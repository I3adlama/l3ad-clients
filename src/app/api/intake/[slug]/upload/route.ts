import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const slugPattern = /^[a-z0-9][a-z0-9-]{0,118}[a-z0-9]$/;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slugPattern.test(slug) || slug.length > 120) {
    return NextResponse.json({ error: "Invalid project link" }, { status: 400 });
  }

  const sql = getDb();
  const projects = await sql`SELECT id FROM projects WHERE slug = ${slug}`;
  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Use JPEG, PNG, WebP, GIF, or PDF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum 10MB." },
      { status: 400 }
    );
  }

  const blob = await put(`intake/${slug}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({
    url: blob.url,
    filename: file.name,
    size: file.size,
    content_type: file.type,
    uploaded_at: new Date().toISOString(),
  });
}
