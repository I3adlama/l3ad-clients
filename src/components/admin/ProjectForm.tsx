"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextInput from "@/components/ui/TextInput";
import TextArea from "@/components/ui/TextArea";
import BevelButton from "@/components/ui/BevelButton";

export default function ProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create project");
        return;
      }

      const project = await res.json();
      router.push(`/admin/projects/${project.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TextInput
        label="Website URL"
        value={url}
        onChange={setUrl}
        placeholder="e.g. smalltownscreening.com"
        required
        name="url"
      />

      <TextArea
        label="Notes (optional)"
        value={notes}
        onChange={setNotes}
        placeholder="Any context — business type, location, what they need help with..."
        name="notes"
        minRows={3}
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <BevelButton type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </BevelButton>
    </form>
  );
}
