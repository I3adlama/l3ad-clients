import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getDb } from "@/lib/db";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Client-upload token endpoint for Vercel Blob.
 * The browser uploads straight to Blob storage, which sidesteps the 4.5MB request-body
 * limit on serverless functions that used to break phone photos. This route only issues
 * a short-lived token after validating the project link, path, type, and size.
 */

const slugPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,118}[a-zA-Z0-9]$/;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slugPattern.test(slug) || slug.length > 120) {
    return NextResponse.json({ error: "Invalid project link" }, { status: 400 });
  }

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Upload-completed callbacks come from Vercel Blob, not the client; nothing to record
  // server-side because the browser stores the returned URL in the form itself.
  if (body.type === "blob.upload-completed") {
    return NextResponse.json({ ok: true });
  }

  const sql = getDb();
  const projects = await sql`SELECT id FROM projects WHERE slug = ${slug}`;
  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(`intake/${slug}/`) || pathname.includes("..")) {
          throw new Error("Invalid upload path");
        }
        return {
          allowedContentTypes: ALLOWED_UPLOAD_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ slug }),
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload could not be authorized";
    console.error("Blob token error:", err);
    const status = /BLOB_READ_WRITE_TOKEN|token/i.test(message) && !/Invalid upload path/.test(message) ? 503 : 400;
    return NextResponse.json(
      { error: status === 503 ? "File storage is unavailable. Please try again later." : message },
      { status }
    );
  }
}
