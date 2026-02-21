import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { z } from "zod";
import { nanoid } from "nanoid";

const CreateProjectSchema = z.object({
  url: z.string().min(1, "URL is required"),
  notes: z.string().optional().default(""),
});

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${nanoid(4)}`;
}

/** Normalize a URL: prepend https:// if missing, validate it parses */
function normalizeUrl(raw: string): string {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  // Validate it parses
  new URL(url);
  return url;
}

/** Extract a display name from a domain: "smalltownscreening.com" → "Small Town Screening" */
function nameFromDomain(url: string): string {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const raw = hostname.split(".")[0];
  // Split on hyphens, underscores, and camelCase boundaries
  const words = raw
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/\s+/);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

/** Detect a platform name from a URL hostname */
const PLATFORM_MAP: Record<string, string> = {
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "linkedin.com": "LinkedIn",
  "twitter.com": "Twitter",
  "x.com": "Twitter",
  "youtube.com": "YouTube",
  "tiktok.com": "TikTok",
  "yelp.com": "Yelp",
  "nextdoor.com": "Nextdoor",
  "bbb.org": "BBB",
  "homeadvisor.com": "HomeAdvisor",
  "houzz.com": "Houzz",
  "thumbtack.com": "Thumbtack",
  "angieslist.com": "Angie's List",
  "angi.com": "Angi",
  "google.com": "Google Business",
};

function detectPlatform(url: string): string {
  const hostname = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  for (const [domain, platform] of Object.entries(PLATFORM_MAP)) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      return platform;
    }
  }
  return "Website";
}

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const projects = await sql`
    SELECT p.*,
           ir.completed as intake_completed,
           ir.current_step
    FROM projects p
    LEFT JOIN intake_responses ir ON ir.project_id = p.id
    ORDER BY p.created_at DESC
  `;

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = CreateProjectSchema.parse(body);

    let sourceUrl: string;
    try {
      sourceUrl = normalizeUrl(data.url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL. Enter a website address like smalltownscreening.com" },
        { status: 400 }
      );
    }

    const tempName = nameFromDomain(sourceUrl);
    const platform = detectPlatform(sourceUrl);
    const slug = slugify(tempName);
    const socialUrls = JSON.stringify([{ platform, url: sourceUrl }]);
    const sql = getDb();

    const [project] = await sql`
      INSERT INTO projects (slug, client_name, source_url, social_urls, notes)
      VALUES (
        ${slug},
        ${tempName},
        ${sourceUrl},
        ${socialUrls}::jsonb,
        ${data.notes || null}
      )
      RETURNING *
    `;

    await sql`
      INSERT INTO intake_responses (project_id)
      VALUES (${project.id})
    `;

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
