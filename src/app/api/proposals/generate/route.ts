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

/** Ensure a value is a non-array object; if not, return fallback */
function ensureObj(val: unknown, fallback: Record<string, unknown>): Record<string, unknown> {
  return (val && typeof val === "object" && !Array.isArray(val))
    ? val as Record<string, unknown>
    : fallback;
}

/** Ensure a value is an array; if not, return empty array */
function ensureArr(val: unknown): unknown[] {
  return Array.isArray(val) ? val : [];
}

/** Coerce AI output to match ProposalData shape — prevents renderer crashes */
function sanitizeProposalData(d: Record<string, unknown>): Record<string, unknown> {
  const data = JSON.parse(JSON.stringify(d));

  data.title = ensureObj(data.title, { client_name: "", date: "" });
  data.pain_points = ensureArr(data.pain_points);

  data.why_new_website = ensureObj(data.why_new_website, { before: [], after: [] });
  data.why_new_website.before = ensureArr(data.why_new_website.before);
  data.why_new_website.after = ensureArr(data.why_new_website.after);

  data.aida_strategy = ensureObj(data.aida_strategy, {});
  for (const key of ["attention", "interest", "desire", "action"]) {
    data.aida_strategy[key] = ensureObj(data.aida_strategy[key], { title: "", items: [] });
    data.aida_strategy[key].items = ensureArr(data.aida_strategy[key].items);
  }

  data.itemized_pricing = ensureObj(data.itemized_pricing, { sections: [] });
  data.itemized_pricing.sections = ensureArr(data.itemized_pricing.sections);

  data.competitors = ensureObj(data.competitors, { entries: [], unfair_advantage: "" });
  data.competitors.entries = ensureArr(data.competitors.entries);

  data.roi = ensureObj(data.roi, { monthly_cost: "$0", revenue_per_customer: "$0", new_customers_per_month: "0", monthly_revenue: "$0", annual_revenue: "$0", roi_percentage: "0%" });
  if (data.roi.cost_breakdown) data.roi.cost_breakdown = ensureArr(data.roi.cost_breakdown);
  if (data.roi.revenue_model) data.roi.revenue_model = ensureArr(data.roi.revenue_model);
  data.roi.projections = ensureArr(data.roi.projections);

  data.timeline = ensureObj(data.timeline, { phases: [] });
  data.timeline.phases = ensureArr(data.timeline.phases);
  for (const phase of data.timeline.phases) {
    if (phase && typeof phase === "object") phase.tasks = ensureArr(phase.tasks);
  }

  data.pricing_summary = ensureObj(data.pricing_summary, { packages: [] });
  data.pricing_summary.packages = ensureArr(data.pricing_summary.packages);

  data.next_steps = ensureObj(data.next_steps, { steps: [] });
  data.next_steps.steps = ensureArr(data.next_steps.steps);

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
