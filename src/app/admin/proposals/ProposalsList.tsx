"use client";

import { useEffect, useState } from "react";
import BevelButton from "@/components/ui/BevelButton";

interface ProposalSummary {
  id: string;
  slug: string;
  client_name: string;
  contact_name: string | null;
  industry: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ProposalsList() {
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/proposals")
      .then((res) => res.json())
      .then((data) => {
        setProposals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function toggleStatus(slug: string, currentStatus: string) {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const res = await fetch(`/api/proposals/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setProposals((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, status: newStatus } : p))
      );
    }
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/proposal/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display">Proposals</h1>
        <BevelButton href="/admin" variant="secondary" size="sm">
          &larr; Dashboard
        </BevelButton>
      </div>

      {loading ? (
        <div className="text-[var(--text-soft)] text-center py-12">
          Loading...
        </div>
      ) : proposals.length === 0 ? (
        <div className="noir-panel p-12 text-center">
          <p className="text-[var(--text-soft)] mb-4">
            No proposals yet. Create one via the API.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="noir-panel p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold">{proposal.client_name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-ui tracking-wider ${
                      proposal.status === "published"
                        ? "bg-[#10b981]/20 text-[#10b981]"
                        : proposal.status === "archived"
                          ? "bg-[var(--text-soft)]/20 text-[var(--text-soft)]"
                          : "bg-[#f59e0b]/20 text-[#f59e0b]"
                    }`}
                  >
                    {proposal.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[var(--text-soft)] text-sm">
                  {proposal.industry && <span>{proposal.industry} &middot; </span>}
                  <span className="font-mono text-xs">/proposal/{proposal.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => copyLink(proposal.slug)}
                  className="text-xs font-ui text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors px-2 py-1"
                >
                  {copiedSlug === proposal.slug ? (
                    <><i className="bi-check-lg" /> Copied</>
                  ) : (
                    <><i className="bi-link-45deg" /> Copy Link</>
                  )}
                </button>
                <button
                  onClick={() => toggleStatus(proposal.slug, proposal.status)}
                  className={`text-xs font-ui px-2 py-1 transition-colors ${
                    proposal.status === "published"
                      ? "text-[#f59e0b] hover:text-[#f59e0b]/70"
                      : "text-[#10b981] hover:text-[#10b981]/70"
                  }`}
                >
                  {proposal.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <BevelButton
                  href={`/proposal/${proposal.slug}`}
                  size="sm"
                  variant="secondary"
                >
                  View
                </BevelButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
