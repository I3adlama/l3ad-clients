"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import BevelButton from "@/components/ui/BevelButton";
import ProjectCard from "@/components/admin/ProjectCard";

export default function Dashboard() {
  const [projects, setProjects] = useState<(Project & { intake_completed?: boolean; current_step?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
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
