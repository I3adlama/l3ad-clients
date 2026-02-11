"use client";

import Link from "next/link";
import type { Project } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-noir-600 text-noir-200",
  sent: "bg-blue-900/50 text-blue-300",
  in_progress: "bg-yellow-900/50 text-yellow-300",
  completed: "bg-green-900/50 text-green-300",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  in_progress: "In Progress",
  completed: "Completed",
};

interface ProjectCardProps {
  project: Project & {
    intake_completed?: boolean;
    current_step?: number;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const status = project.intake_completed
    ? "completed"
    : (project.current_step ?? 0) > 0
      ? "in_progress"
      : project.status;

  const intakeUrl = `${window.location.origin}/intake/${project.slug}`;

  function copyLink() {
    navigator.clipboard.writeText(intakeUrl);
  }

  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className="noir-panel p-4 block hover:border-[var(--border-accent)] transition-colors no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-display text-white truncate">
            {project.client_name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-soft)]">
            {project.business_type && <span>{project.business_type}</span>}
            {project.business_type && project.location && <span>&middot;</span>}
            {project.location && <span>{project.location}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2 py-0.5 rounded text-xs font-ui tracking-wider uppercase ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}
          >
            {STATUS_LABELS[status] || status}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              copyLink();
            }}
            className="text-[var(--text-soft)] hover:text-accent text-sm px-2 py-1"
            title="Copy intake link"
          >
            Copy Link
          </button>
        </div>
      </div>
    </Link>
  );
}
