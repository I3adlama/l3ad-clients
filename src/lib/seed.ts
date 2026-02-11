import { getDb } from "./db";

export async function runMigrations() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug          VARCHAR(100) UNIQUE NOT NULL,
      client_name   VARCHAR(255) NOT NULL,
      business_type VARCHAR(255),
      location      VARCHAR(255),
      social_urls   JSONB DEFAULT '[]',
      notes         TEXT,
      status        VARCHAR(50) DEFAULT 'draft',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS intake_responses (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id    UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      responses     JSONB NOT NULL DEFAULT '{}',
      current_step  INT DEFAULT 0,
      completed     BOOLEAN DEFAULT FALSE,
      started_at    TIMESTAMPTZ DEFAULT NOW(),
      completed_at  TIMESTAMPTZ
    )
  `;

  // Add ai_analysis column if it doesn't exist (migration for existing DBs)
  await sql`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS ai_analysis JSONB
  `;

  return { success: true, message: "Migrations completed" };
}
