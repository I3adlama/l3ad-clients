"use client";

import { useState } from "react";

interface UrlInputProps {
  label: string;
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  placeholder?: string;
}

export default function UrlInput({
  label,
  urls,
  onChange,
  max = 3,
  placeholder = "https://example.com",
}: UrlInputProps) {
  const [draft, setDraft] = useState("");

  function addUrl() {
    const trimmed = draft.trim();
    if (!trimmed || urls.length >= max) return;

    // Auto-prepend https:// if missing
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    if (!urls.includes(url)) {
      onChange([...urls, url]);
    }
    setDraft("");
  }

  function removeUrl(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addUrl();
    }
  }

  return (
    <div>
      <span className="input-label">{label}</span>

      {urls.length > 0 && (
        <div className="space-y-2 mb-2">
          {urls.map((url, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-noir-800 border border-[var(--border)] rounded-md px-3 py-2"
            >
              <span className="text-sm text-accent truncate flex-1">{url}</span>
              <button
                type="button"
                onClick={() => removeUrl(i)}
                className="text-[var(--text-soft)] hover:text-red-400 text-xs shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {urls.length < max && (
        <div className="flex gap-2">
          <input
            type="url"
            className="input-field flex-1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={addUrl}
            className="px-3 py-2 bg-noir-700 border border-[var(--border)] rounded-md text-sm text-[var(--text-muted)] hover:text-white hover:border-accent transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
