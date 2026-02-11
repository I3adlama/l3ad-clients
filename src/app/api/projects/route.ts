import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { z } from "zod";
import { nanoid } from "nanoid";

const CreateProjectSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  business_type: z.string().optional().default(""),
  location: z.string().optional().default(""),
  social_urls: z
    .array(z.object({ platform: z.string(), url: z.string().url() }))
    .optional()
    .default([]),
  notes: z.string().optional().default(""),
});

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${nanoid(4)}`;
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
    const slug = slugify(data.client_name);
    const sql = getDb();

    const [project] = await sql`
      INSERT INTO projects (slug, client_name, business_type, location, social_urls, notes)
      VALUES (
        ${slug},
        ${data.client_name},
        ${data.business_type || null},
        ${data.location || null},
        ${JSON.stringify(data.social_urls)},
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
