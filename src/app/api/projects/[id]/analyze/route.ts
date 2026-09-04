import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { analyzeBusinessLinks, analyzeFromUrl, type BusinessAnalysis } from "@/lib/agent";
import { jsonEqual } from "@/lib/ai/text";

export const runtime = "nodejs";
// Crawl + five model calls (two in parallel) + web research; well under this on a normal run.
export const maxDuration = 300;

type SocialUrl = { platform: string; url: string };

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
    SELECT p.*, ir.responses AS intake_responses, ir.completed AS intake_completed
    FROM projects p
    LEFT JOIN intake_responses ir ON ir.project_id = p.id
    WHERE p.id = ${id}::uuid
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projects[0];
  const previous = (project.ai_analysis as BusinessAnalysis | null) || null;

  try {
    let analysis: BusinessAnalysis;

    if (project.source_url) {
      // URL-first flow: discover everything from the source URL
      analysis = await analyzeFromUrl(
        project.source_url as string,
        (project.notes as string) || ""
      );

      // Merge discovered profile links with anything already on the project (dedupe by URL)
      const existingUrls = (project.social_urls as SocialUrl[]) || [];
      const seen = new Set(existingUrls.map((u) => u.url.replace(/\/$/, "")));
      const mergedUrls = [...existingUrls];
      for (const link of analysis.discovered_social_urls || []) {
        const key = link.url.replace(/\/$/, "");
        if (!seen.has(key)) {
          mergedUrls.push(link);
          seen.add(key);
        }
      }

      await sql`
        UPDATE projects
        SET ai_analysis = ${JSON.stringify(analysis)}::jsonb,
            client_name = ${analysis.business_name},
            business_type = ${analysis.business_type || null},
            location = ${analysis.location || null},
            social_urls = ${JSON.stringify(mergedUrls)}::jsonb,
            updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
    } else {
      // Legacy flow: analyze from manually-entered social URLs
      const urls = (project.social_urls as SocialUrl[]) || [];

      if (urls.length === 0) {
        return NextResponse.json({ error: "No URLs to analyze" }, { status: 400 });
      }

      analysis = await analyzeBusinessLinks(
        project.client_name as string,
        (project.business_type as string) || "",
        (project.location as string) || "",
        urls
      );

      await sql`
        UPDATE projects
        SET ai_analysis = ${JSON.stringify(analysis)}::jsonb,
            business_type = COALESCE(${analysis.business_type || null}, business_type),
            location = COALESCE(${analysis.location || null}, location),
            updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
    }

    // Pre-fill the intake form with the discovered answers. Safe only while the client
    // has not started: the stored responses are empty or exactly the previous prefill.
    const currentResponses = (project.intake_responses as Record<string, unknown> | null) || {};
    const untouched =
      !project.intake_completed &&
      (Object.keys(currentResponses).length === 0 ||
        (previous?.prefill ? jsonEqual(currentResponses, previous.prefill) : false));

    if (analysis.prefill && untouched) {
      await sql`
        UPDATE intake_responses
        SET responses = ${JSON.stringify(analysis.prefill)}::jsonb,
            current_step = 0
        WHERE project_id = ${id}::uuid
      `;
    }

    return NextResponse.json({ ...analysis, prefill_applied: untouched });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error(`[analyze] project ${id} failed:`, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
