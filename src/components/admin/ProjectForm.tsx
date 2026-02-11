"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SocialUrl } from "@/lib/types";
import TextInput from "@/components/ui/TextInput";
import TextArea from "@/components/ui/TextArea";
import BevelButton from "@/components/ui/BevelButton";
import SocialUrlInput from "./SocialUrlInput";

export default function ProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clientName, setClientName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [socialUrls, setSocialUrls] = useState<SocialUrl[]>([
    { platform: "Facebook", url: "" },
  ]);
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const filteredUrls = socialUrls.filter((u) => u.url.trim() !== "");

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          business_type: businessType || undefined,
          location: location || undefined,
          social_urls: filteredUrls,
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
        label="Client Name"
        value={clientName}
        onChange={setClientName}
        placeholder="e.g. Small Town Screening"
        required
        name="client_name"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="Business Type"
          value={businessType}
          onChange={setBusinessType}
          placeholder="e.g. Screen Enclosures"
          name="business_type"
        />
        <TextInput
          label="Location"
          value={location}
          onChange={setLocation}
          placeholder="e.g. Titusville, FL"
          name="location"
        />
      </div>

      <SocialUrlInput urls={socialUrls} onChange={setSocialUrls} />

      <TextArea
        label="Notes"
        value={notes}
        onChange={setNotes}
        placeholder="Any context about this client..."
        name="notes"
        rows={3}
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <BevelButton type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </BevelButton>
    </form>
  );
}
