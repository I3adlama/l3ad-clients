import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { analyzeBusinessLinks } from "@/lib/agent";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sql = getDb();

  const projects = await sql`
    SELECT * FROM projects WHERE id = ${id}::uuid
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projects[0];
  const urls = (project.social_urls as { platform: string; url: string }[]) || [];

  if (urls.length === 0) {
    return NextResponse.json(
      { error: "No URLs to analyze" },
      { status: 400 }
    );
  }

  try {
    const analysis = await analyzeBusinessLinks(
      project.client_name,
      project.business_type || "",
      project.location || "",
      urls
    );

    // Store analysis on the project
    await sql`
      UPDATE projects
      SET ai_analysis = ${JSON.stringify(analysis)}::jsonb,
          updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

    // Pre-fill the intake responses with discovered data
    if (analysis.prefill) {
      const prefillData = JSON.stringify(analysis.prefill);
      await sql`
        UPDATE intake_responses
        SET responses = responses || ${prefillData}::jsonb
        WHERE project_id = ${id}::uuid
        AND (responses = '{}'::jsonb OR responses IS NULL)
      `;
    }

    return NextResponse.json(analysis);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
