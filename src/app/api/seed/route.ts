import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/seed";
import { verifySession } from "@/lib/auth";

export async function POST() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runMigrations();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}
