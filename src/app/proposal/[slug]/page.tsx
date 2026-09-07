import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";
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
  const session = await verifySession();
  const rows = session
    ? await sql`SELECT client_name FROM proposals WHERE slug = ${slug}`
    : await sql`SELECT client_name FROM proposals WHERE slug = ${slug} AND status = 'published'`;

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
      images: ["/og-image.png"],
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

  // Published proposals are public. Drafts and archived proposals render only
  // for a logged-in admin (same rule as /api/proposals/[slug]); before this,
  // the admin "View" button 404'd on every freshly generated draft.
  const session = await verifySession();
  const rows = session
    ? await sql`SELECT * FROM proposals WHERE slug = ${slug}`
    : await sql`SELECT * FROM proposals WHERE slug = ${slug} AND status = 'published'`;

  if (rows.length === 0) {
    notFound();
  }

  const proposal = rows[0] as unknown as Proposal;
  const isPreview = proposal.status !== "published";

  return (
    <AppShell>
      {isPreview && (
        <div className="bg-[#f59e0b] text-black text-center text-sm font-ui tracking-wider px-4 py-2">
          {proposal.status.toUpperCase()} PREVIEW. Only you can see this page. Publish it from the admin
          proposals list before sending the link to {proposal.client_name}.
        </div>
      )}
      <ProposalViewer
        data={proposal.proposal_data}
        clientName={proposal.client_name}
      />
    </AppShell>
  );
}
