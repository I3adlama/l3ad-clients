"use client";

const PERSONALITY_OPTIONS = [
  "Rugged",
  "Elegant",
  "Playful",
  "Professional",
  "Friendly",
  "Bold",
  "Minimalist",
  "Luxurious",
  "Trustworthy",
  "Innovative",
  "Traditional",
  "Energetic",
];

interface BrandPersonalityPickerProps {
  selected: string[];
  onChange: (value: string[]) => void;
}

export default function BrandPersonalityPicker({
  selected,
  onChange,
}: BrandPersonalityPickerProps) {
  function toggle(word: string) {
    if (selected.includes(word)) {
      onChange(selected.filter((w) => w !== word));
    } else if (selected.length < 5) {
      onChange([...selected, word]);
    }
  }

  return (
    <div>
      <span className="input-label">
        Pick 3-5 words that describe your brand&apos;s personality
      </span>
      <p className="text-[var(--text-soft)] text-xs mb-2">
        {selected.length}/5 selected {selected.length < 3 && "(pick at least 3)"}
      </p>
      <div className="flex flex-wrap gap-2">
        {PERSONALITY_OPTIONS.map((word) => {
          const isSelected = selected.includes(word);
          const atMax = selected.length >= 5 && !isSelected;
          return (
            <button
              key={word}
              type="button"
              onClick={() => toggle(word)}
              disabled={atMax}
              className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                isSelected
                  ? "border-[var(--border-accent)] bg-accent/10 text-accent font-bold"
                  : atMax
                    ? "border-[var(--border)] bg-noir-800 text-[var(--text-soft)] opacity-40 cursor-not-allowed"
                    : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
