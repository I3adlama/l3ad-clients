import { NextResponse } from "next/server";
import { runMigrations, seedProposals } from "@/lib/seed";
import { verifySession } from "@/lib/auth";

export async function POST() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const migrations = await runMigrations();
    const proposals = await seedProposals();
    return NextResponse.json({
      success: true,
      message: `${migrations.message}. ${proposals.message}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}
