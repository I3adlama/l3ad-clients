import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { z } from "zod";
import { STEP_SECTIONS } from "@/lib/types";

// Slug must be alphanumeric with dashes, max 120 chars
const slugPattern = /^[a-z0-9][a-z0-9-]{0,118}[a-z0-9]$/;

function validateSlug(slug: string): boolean {
  return slugPattern.test(slug) && slug.length <= 120;
}

const SaveStepSchema = z.object({
  step: z.number().int().min(0).max(STEP_SECTIONS.length - 1),
  section_key: z.enum(STEP_SECTIONS as unknown as [string, ...string[]]),
  data: z.record(z.string(), z.unknown()).refine(
    (d) => JSON.stringify(d).length < 50_000,
    "Response data too large"
  ),
  completed: z.boolean().optional().default(false),
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
    return NextResponse.json(
      { error: "Invalid data" },
      { status: 400 }
    );
  }

  const { step, section_key, data, completed } = parsed.data;
  const sql = getDb();

  const projects = await sql`
    SELECT id FROM projects WHERE slug = ${slug}
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const projectId = projects[0].id;
  const sectionData = JSON.stringify({ [section_key]: data });

  if (completed) {
    await sql`
      UPDATE intake_responses
      SET responses = responses || ${sectionData}::jsonb,
          current_step = ${step},
          completed = true,
          completed_at = NOW()
      WHERE project_id = ${projectId}
    `;

    await sql`
      UPDATE projects
      SET status = 'completed', updated_at = NOW()
      WHERE id = ${projectId}
    `;

  } else {
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

  return NextResponse.json({ success: true });
}
