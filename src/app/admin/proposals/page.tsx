import { requireAdmin } from "@/lib/dal";
import ProposalsList from "./ProposalsList";

export default async function AdminProposalsPage() {
  await requireAdmin();
  return <ProposalsList />;
}
