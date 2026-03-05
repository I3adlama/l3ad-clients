import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { generateProposal, type ProposalProjectContext } from "@/lib/agent";
import { z } from "zod";

export const maxDuration = 120;

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
        SELECT section_key, responses
        FROM intake_responses
        WHERE project_id = ${data.project_id}
      `;

      project = {
        id: row.id as string,
        client_name: row.client_name as string,
        business_type: row.business_type as string | null,
        location: row.location as string | null,
        social_urls: row.social_urls as { platform: string; url: string }[] | null,
        ai_analysis: row.ai_analysis as Record<string, unknown> | null,
        intake_responses: intakeRows.map((r) => ({
          section_key: r.section_key as string,
          responses: r.responses as Record<string, unknown>,
        })),
      };
    }

    const { proposalData, clientName, industry } = await generateProposal(data.notes, project);

    const slug = slugify(clientName) + "-" + Date.now().toString(36);

    const [proposal] = await sql`
      INSERT INTO proposals (slug, client_name, contact_name, industry, project_id, proposal_data, status)
      VALUES (
        ${slug},
        ${clientName},
        ${null},
        ${industry},
        ${data.project_id || null},
        ${JSON.stringify(proposalData)},
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
    console.error("Proposal generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate proposal" },
      { status: 500 }
    );
  }
}
