import { requireAdmin } from "@/lib/dal";
import { getDb } from "@/lib/db";
import ProposalForm from "@/components/admin/ProposalForm";

export default async function NewProposalPage() {
  await requireAdmin();

  const sql = getDb();
  const projects = await sql`
    SELECT id, client_name, business_type, location
    FROM projects
    ORDER BY created_at DESC
  `;

  return (
    <div>
      <h1 className="text-3xl font-display mb-8">New Proposal</h1>
      <div className="noir-panel p-6 max-w-2xl">
        <ProposalForm projects={projects as { id: string; client_name: string; business_type: string | null; location: string | null }[]} />
      </div>
    </div>
  );
}
