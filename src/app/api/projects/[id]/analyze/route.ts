import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { analyzeBusinessLinks, analyzeFromUrl } from "@/lib/agent";

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

  try {
    let analysis;

    if (project.source_url) {
      // URL-first flow: discover everything from the source URL
      analysis = await analyzeFromUrl(
        project.source_url as string,
        (project.notes as string) || ""
      );

      // Write back discovered business info to the project
      const discoveredSocials = analysis.discovered_social_urls || [];
      const existingUrls = (project.social_urls as { platform: string; url: string }[]) || [];

      // Merge discovered URLs with existing ones (deduplicate by URL)
      const seenUrls = new Set(existingUrls.map((u) => u.url));
      const mergedUrls = [...existingUrls];
      for (const link of discoveredSocials) {
        if (!seenUrls.has(link.url)) {
          mergedUrls.push(link);
          seenUrls.add(link.url);
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
      const urls = (project.social_urls as { platform: string; url: string }[]) || [];

      if (urls.length === 0) {
        return NextResponse.json(
          { error: "No URLs to analyze" },
          { status: 400 }
        );
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
            updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
    }

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
