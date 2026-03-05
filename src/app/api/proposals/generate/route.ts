import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { generateProposal, type ProposalProjectContext } from "@/lib/agent";
import { z } from "zod";

export const maxDuration = 300;

const GenerateSchema = z.object({
  notes: z.string().min(1, "Proposal notes are required"),
  project_id: z.string().uuid().optional(),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Coerce AI output to match ProposalData shape — ensures array fields are arrays */
function sanitizeProposalData(d: Record<string, unknown>): Record<string, unknown> {
  const data = JSON.parse(JSON.stringify(d));

  // Ensure top-level arrays
  if (!Array.isArray(data.pain_points)) data.pain_points = [];

  // why_new_website.before / .after must be arrays
  if (data.why_new_website && typeof data.why_new_website === "object") {
    const wnw = data.why_new_website as Record<string, unknown>;
    if (!Array.isArray(wnw.before)) wnw.before = [];
    if (!Array.isArray(wnw.after)) wnw.after = [];
  }

  // aida_strategy sections must have items arrays
  if (data.aida_strategy && typeof data.aida_strategy === "object") {
    for (const key of ["attention", "interest", "desire", "action"]) {
      const section = (data.aida_strategy as Record<string, unknown>)[key];
      if (section && typeof section === "object" && !Array.isArray((section as Record<string, unknown>).items)) {
        (section as Record<string, unknown>).items = [];
      }
    }
  }

  // itemized_pricing.sections must be array
  if (data.itemized_pricing && typeof data.itemized_pricing === "object") {
    const ip = data.itemized_pricing as Record<string, unknown>;
    if (!Array.isArray(ip.sections)) ip.sections = [];
  }

  // competitors.entries must be array
  if (data.competitors && typeof data.competitors === "object") {
    const c = data.competitors as Record<string, unknown>;
    if (!Array.isArray(c.entries)) c.entries = [];
  }

  // roi.projections must be array if present
  if (data.roi && typeof data.roi === "object") {
    const r = data.roi as Record<string, unknown>;
    if (r.projections && !Array.isArray(r.projections)) r.projections = [];
  }

  // timeline.phases must be array
  if (data.timeline && typeof data.timeline === "object") {
    const t = data.timeline as Record<string, unknown>;
    if (!Array.isArray(t.phases)) t.phases = [];
  }

  // pricing_summary.packages must be array
  if (data.pricing_summary && typeof data.pricing_summary === "object") {
    const ps = data.pricing_summary as Record<string, unknown>;
    if (!Array.isArray(ps.packages)) ps.packages = [];
  }

  // next_steps.steps must be array
  if (data.next_steps && typeof data.next_steps === "object") {
    const ns = data.next_steps as Record<string, unknown>;
    if (!Array.isArray(ns.steps)) ns.steps = [];
  }

  return data;
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = GenerateSchema.parse(body);
    const sql = getDb();

    let project: ProposalProjectContext | null = null;

    if (data.project_id) {
      const [row] = await sql`
        SELECT id, client_name, business_type, location, social_urls, ai_analysis
        FROM projects
        WHERE id = ${data.project_id}
      `;
      if (!row) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      const intakeRows = await sql`
        SELECT responses
        FROM intake_responses
        WHERE project_id = ${data.project_id}
      `;

      // intake_responses has a single row per project with all responses in one JSONB blob
      const intakeData = intakeRows.length > 0
        ? (intakeRows[0].responses as Record<string, Record<string, unknown>>)
        : {};

      project = {
        id: row.id as string,
        client_name: row.client_name as string,
        business_type: row.business_type as string | null,
        location: row.location as string | null,
        social_urls: row.social_urls as { platform: string; url: string }[] | null,
        ai_analysis: row.ai_analysis as Record<string, unknown> | null,
        intake_responses: Object.entries(intakeData).map(([section_key, responses]) => ({
          section_key,
          responses: (responses && typeof responses === "object") ? responses as Record<string, unknown> : {},
        })),
      };
    }

    const { proposalData, clientName, industry } = await generateProposal(data.notes, project);
    const sanitized = sanitizeProposalData(proposalData);

    const slug = slugify(clientName) + "-" + Date.now().toString(36);

    const [proposal] = await sql`
      INSERT INTO proposals (slug, client_name, contact_name, industry, project_id, proposal_data, status)
      VALUES (
        ${slug},
        ${clientName},
        ${null},
        ${industry},
        ${data.project_id || null},
        ${JSON.stringify(sanitized)},
        ${"draft"}
      )
      RETURNING id, slug
    `;

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Proposal generation error:", message, error);
    return NextResponse.json(
      { error: `Failed to generate proposal: ${message}` },
      { status: 500 }
    );
  }
}
