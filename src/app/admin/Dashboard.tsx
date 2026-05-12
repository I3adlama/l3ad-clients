"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import BevelButton from "@/components/ui/BevelButton";
import ProjectCard from "@/components/admin/ProjectCard";

const VENDOR_FORM_PATH = "/events/memorial-day-bash-vendor-application";

export default function Dashboard() {
  const [projects, setProjects] = useState<(Project & { intake_completed?: boolean; current_step?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function copyVendorLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${VENDOR_FORM_PATH}`
        : VENDOR_FORM_PATH;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — fall back to a prompt the user can copy from
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div>
      {/* Memorial Day Bash vendor form quick-link */}
      <div className="noir-panel noir-panel--accent p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg text-white">
            Memorial Day Bash — Vendor Form
          </h2>
          <p className="text-[var(--text-soft)] text-sm">
            Public signup form for the May 23, 2026 event. Share this link with
            vendors.
          </p>
          <code className="text-[var(--text-soft)] text-xs block mt-1 truncate">
            {VENDOR_FORM_PATH}
          </code>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <BevelButton onClick={copyVendorLink} size="sm" variant="secondary">
            {copied ? "Copied!" : "Copy Link"}
          </BevelButton>
          <BevelButton
            onClick={() =>
              window.open(VENDOR_FORM_PATH, "_blank", "noopener,noreferrer")
            }
            size="sm"
          >
            Open Form
          </BevelButton>
        </div>
      </div>

      {/* Proposals quick-link */}
      <div className="noir-panel noir-panel--accent p-4 mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-white">Proposals</h2>
          <p className="text-[var(--text-soft)] text-sm">
            Client presentation decks — view, publish, and share.
          </p>
        </div>
        <BevelButton href="/admin/proposals" size="sm" variant="secondary">
          View Proposals
        </BevelButton>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display">Projects</h1>
        <BevelButton href="/admin/projects/new" size="sm">
          + New Project
        </BevelButton>
      </div>

      {loading ? (
        <div className="text-[var(--text-soft)] text-center py-12">
          Loading...
        </div>
      ) : projects.length === 0 ? (
        <div className="noir-panel p-12 text-center">
          <p className="text-[var(--text-soft)] mb-4">
            No projects yet. Create your first one.
          </p>
          <BevelButton href="/admin/projects/new">
            Create Project
          </BevelButton>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
