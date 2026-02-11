"use client";

import type { SocialUrl } from "@/lib/types";

const PLATFORMS = [
  "Facebook",
  "Instagram",
  "Google Business",
  "Nextdoor",
  "Yelp",
  "LinkedIn",
  "TikTok",
  "Other",
];

interface SocialUrlInputProps {
  urls: SocialUrl[];
  onChange: (urls: SocialUrl[]) => void;
}

export default function SocialUrlInput({ urls, onChange }: SocialUrlInputProps) {
  function addUrl() {
    onChange([...urls, { platform: "Facebook", url: "" }]);
  }

  function removeUrl(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  function updateUrl(index: number, field: keyof SocialUrl, value: string) {
    const updated = urls.map((u, i) =>
      i === index ? { ...u, [field]: value } : u
    );
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <label className="input-label">Social & Business Links</label>

      {urls.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          <select
            className="input-field w-40 shrink-0"
            value={item.platform}
            onChange={(e) => updateUrl(index, "platform", e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="url"
            className="input-field flex-1"
            value={item.url}
            onChange={(e) => updateUrl(index, "url", e.target.value)}
            placeholder="https://..."
          />
          <button
            type="button"
            onClick={() => removeUrl(index)}
            className="text-[var(--text-soft)] hover:text-red-400 px-2 py-3 text-lg"
            aria-label="Remove URL"
          >
            &times;
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addUrl}
        className="text-accent text-sm font-ui tracking-wider uppercase hover:text-accent-bright"
      >
        + Add Link
      </button>
    </div>
  );
}
