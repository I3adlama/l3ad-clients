"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TextArea from "@/components/ui/TextArea";
import BevelButton from "@/components/ui/BevelButton";

interface ProjectOption {
  id: string;
  client_name: string;
  business_type: string | null;
  location: string | null;
}

export default function ProposalForm({ projects }: { projects: ProjectOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Proposal notes are required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes.trim(),
          project_id: projectId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate proposal");
        return;
      }

      router.push("/admin/proposals");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="input-label" htmlFor="project">
          Link to Project (optional)
        </label>
        <select
          id="project"
          name="project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="input-field"
          disabled={loading}
        >
          <option value="">— No project (notes only) —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.client_name}
              {p.business_type ? ` · ${p.business_type}` : ""}
              {p.location ? ` · ${p.location}` : ""}
            </option>
          ))}
        </select>
      </div>

      <TextArea
        label="Proposal Notes"
        value={notes}
        onChange={setNotes}
        placeholder="Describe what this proposal should cover — services needed, client goals, budget range, special considerations..."
        name="notes"
        minRows={5}
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {loading && (
        <div className="noir-panel p-4 text-center">
          <div className="text-[var(--accent)] font-ui tracking-wider mb-1">
            AI is crafting your proposal...
          </div>
          <div className="text-[var(--text-soft)] text-sm">
            This usually takes 1-3 minutes ({elapsed}s elapsed)
          </div>
        </div>
      )}

      <BevelButton type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate with AI"}
      </BevelButton>
    </form>
  );
}
