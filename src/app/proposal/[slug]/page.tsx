import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import type { Proposal } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import ProposalViewer from "@/components/proposal/ProposalViewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sql = getDb();
  const rows = await sql`
    SELECT client_name FROM proposals WHERE slug = ${slug} AND status = 'published'
  `;

  if (rows.length === 0) {
    return { title: "Proposal Not Found" };
  }

  const clientName = rows[0].client_name;

  return {
    title: `${clientName} — Digital Growth Proposal`,
    description: `Custom digital growth proposal for ${clientName} by L3ad Solutions.`,
    openGraph: {
      title: `${clientName} — Digital Growth Proposal | L3ad Solutions`,
      description: `Custom digital growth proposal for ${clientName} by L3ad Solutions.`,
      images: ["/op-image.png"],
    },
  };
}

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sql = getDb();

  const rows = await sql`
    SELECT * FROM proposals WHERE slug = ${slug} AND status = 'published'
  `;

  if (rows.length === 0) {
    notFound();
  }

  const proposal = rows[0] as unknown as Proposal;

  return (
    <AppShell>
      <ProposalViewer
        data={proposal.proposal_data}
        clientName={proposal.client_name}
      />
    </AppShell>
  );
}
