"use client";

import TextArea from "./TextArea";

interface AiSuggestionProps {
  label: string;
  aiSuggestion: string | undefined;
  currentValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  rows?: number;
}

export default function AiSuggestion({
  label,
  aiSuggestion,
  currentValue,
  onChange,
  placeholder,
  name,
  rows = 4,
}: AiSuggestionProps) {
  // No AI suggestion — fall back to plain TextArea
  if (!aiSuggestion) {
    return (
      <TextArea
        label={label}
        value={currentValue}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        rows={rows}
      />
    );
  }

  // Derive state from comparing currentValue to aiSuggestion
  const isUndecided = !currentValue;
  const isAccepted = currentValue === aiSuggestion;
  const isRejected = !isUndecided && !isAccepted;

  return (
    <div>
      <span className="input-label">{label}</span>

      {/* AI suggestion box */}
      <div className="rounded-md border border-[var(--border-accent)] bg-accent/5 p-3 mb-3">
        <p className="text-xs text-accent font-semibold mb-1 uppercase tracking-wider">
          AI Suggestion
        </p>
        <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">
          {aiSuggestion}
        </p>
      </div>

      {/* Accept / Reject buttons */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => onChange(aiSuggestion)}
          className={`px-4 py-2 rounded-md border text-sm transition-colors ${
            isAccepted
              ? "border-[var(--border-accent)] bg-accent/10 text-accent"
              : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
          }`}
        >
          Yes, that&apos;s right
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isRejected) onChange(" "); // trigger rejected state with a space (user will replace)
          }}
          className={`px-4 py-2 rounded-md border text-sm transition-colors ${
            isRejected
              ? "border-[var(--border-accent)] bg-accent/10 text-accent"
              : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
          }`}
        >
          No, I&apos;ll write my own
        </button>
      </div>

      {/* Show textarea only if user rejected the suggestion */}
      {isRejected && (
        <TextArea
          label=""
          value={currentValue.trim() === "" ? "" : currentValue}
          onChange={onChange}
          placeholder={placeholder || "Write your own answer..."}
          name={name}
          rows={rows}
        />
      )}
    </div>
  );
}
