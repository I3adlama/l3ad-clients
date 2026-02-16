import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sql = getDb();
  const session = await verifySession();

  // Published proposals are public; drafts/archived require admin
  const proposals = session
    ? await sql`SELECT * FROM proposals WHERE slug = ${slug}`
    : await sql`SELECT * FROM proposals WHERE slug = ${slug} AND status = 'published'`;

  if (proposals.length === 0) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  return NextResponse.json(proposals[0]);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const sql = getDb();

  const existing = await sql`SELECT id FROM proposals WHERE slug = ${slug}`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const updates: string[] = [];
    const values: Record<string, unknown> = {};

    if (body.status) {
      values.status = body.status;
    }
    if (body.proposal_data) {
      values.proposal_data = JSON.stringify(body.proposal_data);
    }
    if (body.client_name) {
      values.client_name = body.client_name;
    }
    if (body.contact_name !== undefined) {
      values.contact_name = body.contact_name;
    }
    if (body.industry !== undefined) {
      values.industry = body.industry;
    }

    if (Object.keys(values).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Build dynamic update — since neon tagged templates don't support dynamic columns,
    // we handle the most common update patterns directly
    let result;
    if (values.status && values.proposal_data) {
      [result] = await sql`
        UPDATE proposals
        SET status = ${values.status as string},
            proposal_data = ${values.proposal_data as string}::jsonb,
            updated_at = NOW()
        WHERE slug = ${slug}
        RETURNING *
      `;
    } else if (values.status) {
      [result] = await sql`
        UPDATE proposals
        SET status = ${values.status as string}, updated_at = NOW()
        WHERE slug = ${slug}
        RETURNING *
      `;
    } else if (values.proposal_data) {
      [result] = await sql`
        UPDATE proposals
        SET proposal_data = ${values.proposal_data as string}::jsonb, updated_at = NOW()
        WHERE slug = ${slug}
        RETURNING *
      `;
    } else {
      [result] = await sql`
        UPDATE proposals
        SET client_name = COALESCE(${(values.client_name as string) || null}, client_name),
            contact_name = COALESCE(${(values.contact_name as string) || null}, contact_name),
            industry = COALESCE(${(values.industry as string) || null}, industry),
            updated_at = NOW()
        WHERE slug = ${slug}
        RETURNING *
      `;
    }

    void updates;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const sql = getDb();

  const existing = await sql`SELECT id FROM proposals WHERE slug = ${slug}`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  await sql`DELETE FROM proposals WHERE slug = ${slug}`;
  return NextResponse.json({ success: true });
}
