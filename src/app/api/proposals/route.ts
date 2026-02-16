import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const ProposalDataSchema = z.object({
  title: z.object({
    client_name: z.string().min(1),
    date: z.string().min(1),
    subtitle: z.string().optional(),
  }),
  pain_points: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })),
  why_new_website: z.object({
    before: z.array(z.object({ label: z.string(), description: z.string() })),
    after: z.array(z.object({ label: z.string(), description: z.string() })),
  }),
  aida_strategy: z.object({
    attention: z.object({ title: z.string(), items: z.array(z.string()) }),
    interest: z.object({ title: z.string(), items: z.array(z.string()) }),
    desire: z.object({ title: z.string(), items: z.array(z.string()) }),
    action: z.object({ title: z.string(), items: z.array(z.string()) }),
  }),
  itemized_pricing: z.object({
    sections: z.array(z.object({
      category: z.string(),
      items: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
      })),
      subtotal: z.string().optional(),
    })),
  }),
  competitors: z.object({
    entries: z.array(z.object({
      name: z.string(),
      website_score: z.string().optional(),
      seo_score: z.string().optional(),
      reviews: z.string().optional(),
      notes: z.string().optional(),
    })),
    unfair_advantage: z.string(),
  }),
  roi: z.object({
    monthly_cost: z.string(),
    revenue_per_customer: z.string(),
    new_customers_per_month: z.string(),
    monthly_revenue: z.string(),
    annual_revenue: z.string(),
    roi_percentage: z.string(),
    projections: z.array(z.object({
      month: z.string(),
      revenue: z.string(),
      cumulative: z.string(),
    })).optional(),
  }),
  timeline: z.object({
    phases: z.array(z.object({
      phase_number: z.number(),
      title: z.string(),
      duration: z.string(),
      tasks: z.array(z.string()),
    })),
  }),
  pricing_summary: z.object({
    packages: z.array(z.object({
      label: z.string(),
      original_price: z.string().optional(),
      price: z.string(),
      frequency: z.string().optional(),
      savings: z.string().optional(),
      highlighted: z.boolean().optional(),
    })),
    personal_note: z.string().optional(),
  }),
  next_steps: z.object({
    steps: z.array(z.object({
      number: z.number(),
      title: z.string(),
      description: z.string(),
    })),
    cta_text: z.string().optional(),
    cta_url: z.string().optional(),
  }),
});

const CreateProposalSchema = z.object({
  client_name: z.string().min(1),
  contact_name: z.string().optional(),
  industry: z.string().optional(),
  project_id: z.string().uuid().optional(),
  proposal_data: ProposalDataSchema,
  status: z.enum(["draft", "published", "archived"]).optional().default("draft"),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const proposals = await sql`
    SELECT id, slug, client_name, contact_name, industry, status, created_at, updated_at
    FROM proposals
    ORDER BY created_at DESC
  `;

  return NextResponse.json(proposals);
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = CreateProposalSchema.parse(body);
    const slug = slugify(data.client_name);
    const sql = getDb();

    const [proposal] = await sql`
      INSERT INTO proposals (slug, client_name, contact_name, industry, project_id, proposal_data, status)
      VALUES (
        ${slug},
        ${data.client_name},
        ${data.contact_name || null},
        ${data.industry || null},
        ${data.project_id || null},
        ${JSON.stringify(data.proposal_data)},
        ${data.status}
      )
      RETURNING *
    `;

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Proposal creation error:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}
