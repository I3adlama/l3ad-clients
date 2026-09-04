import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { z } from "zod";
import { STEP_SECTIONS, type IntakeResponses } from "@/lib/types";
import { notifyIntakeCompleted } from "@/lib/notify";

export const runtime = "nodejs";

// Slug must be alphanumeric with dashes, max 120 chars (nanoid suffixes may have uppercase)
const slugPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,118}[a-zA-Z0-9]$/;

function validateSlug(slug: string): boolean {
  return slugPattern.test(slug) && slug.length <= 120;
}

const SectionKey = z.enum(STEP_SECTIONS as unknown as [string, ...string[]]);

const SaveStepSchema = z.object({
  step: z.number().int().min(0).max(STEP_SECTIONS.length - 1),
  section_key: SectionKey,
  data: z.record(z.string(), z.unknown()).refine(
    (d) => JSON.stringify(d).length < 50_000,
    "Response data too large"
  ),
  completed: z.boolean().optional().default(false),
});

const SubmitSchema = z.object({
  action: z.literal("submit"),
  responses: z
    .record(SectionKey, z.record(z.string(), z.unknown()))
    .refine((r) => JSON.stringify(r).length < 300_000, "Response data too large"),
});

const AutosaveSchema = SaveStepSchema.extend({
  action: z.literal("autosave").optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "Invalid project link" }, { status: 400 });
  }

  const sql = getDb();

  const projects = await sql`
    SELECT p.*, ir.responses, ir.current_step, ir.completed
    FROM projects p
    LEFT JOIN intake_responses ir ON ir.project_id = p.id
    WHERE p.slug = ${slug}
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projects[0];
  return NextResponse.json({
    id: project.id,
    slug: project.slug,
    client_name: project.client_name,
    business_type: project.business_type,
    responses: project.responses || {},
    current_step: project.current_step || 0,
    completed: project.completed || false,
  });
}

async function findProject(slug: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT p.id, p.client_name, ir.completed
    FROM projects p
    LEFT JOIN intake_responses ir ON ir.project_id = p.id
    WHERE p.slug = ${slug}
  `;
  return rows[0] as { id: string; client_name: string; completed: boolean | null } | undefined;
}

/** Merge one section into the stored responses (autosave). */
async function saveSection(projectId: string, step: number, sectionKey: string, data: Record<string, unknown>) {
  const sql = getDb();
  const sectionData = JSON.stringify({ [sectionKey]: data });

  await sql`
    UPDATE intake_responses
    SET responses = responses || ${sectionData}::jsonb,
        current_step = ${step}
    WHERE project_id = ${projectId}
  `;

  await sql`
    UPDATE projects
    SET status = CASE WHEN status IN ('draft', 'sent') THEN 'in_progress' ELSE status END,
        updated_at = NOW()
    WHERE id = ${projectId}
  `;
}

/** Autosave one section. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "Invalid project link" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = SaveStepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const project = await findProject(slug);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.completed) {
    return NextResponse.json({ error: "This questionnaire has already been submitted" }, { status: 409 });
  }

  const { step, section_key, data, completed } = parsed.data;

  if (completed) {
    // Legacy single-section completion path; the wizard now uses POST {action: "submit"}
    return completeIntake(req, project, { [section_key]: data } as IntakeResponses, step);
  }

  await saveSection(project.id, step, section_key, data);
  return NextResponse.json({ success: true });
}

/**
 * POST handles two things:
 *  - {action: "submit", responses}  final submission of every section in one write
 *  - {step, section_key, data}      autosave sent with keepalive/beacon on page hide
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "Invalid project link" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const project = await findProject(slug);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.completed) {
    return NextResponse.json({ error: "This questionnaire has already been submitted" }, { status: 409 });
  }

  const submit = SubmitSchema.safeParse(body);
  if (submit.success) {
    return completeIntake(req, project, submit.data.responses as IntakeResponses, STEP_SECTIONS.length - 1);
  }

  const autosave = AutosaveSchema.safeParse(body);
  if (autosave.success) {
    const { step, section_key, data } = autosave.data;
    await saveSection(project.id, step, section_key, data);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid data" }, { status: 400 });
}

async function completeIntake(
  req: NextRequest,
  project: { id: string; client_name: string },
  responses: IntakeResponses,
  lastStep: number
) {
  const sql = getDb();
  const merged = JSON.stringify(responses);

  const [row] = await sql`
    UPDATE intake_responses
    SET responses = responses || ${merged}::jsonb,
        current_step = ${lastStep},
        completed = true,
        completed_at = NOW()
    WHERE project_id = ${project.id}
    RETURNING responses
  `;

  await sql`
    UPDATE projects
    SET status = 'completed', updated_at = NOW()
    WHERE id = ${project.id}
  `;

  const origin = req.headers.get("x-forwarded-host")
    ? `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("x-forwarded-host")}`
    : new URL(req.url).origin;

  const notification = await notifyIntakeCompleted({
    clientName: project.client_name,
    projectId: project.id,
    responses: ((row?.responses as IntakeResponses) || responses),
    origin,
  });

  return NextResponse.json({ success: true, notified: notification.sent });
}
