"use client";

interface Option {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  options: Option[];
  selected: string;
  onChange: (value: string) => void;
}

export default function RadioGroup({
  label,
  options,
  selected,
  onChange,
}: RadioGroupProps) {
  return (
    <div>
      <span className="input-label">{label}</span>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`px-4 py-2.5 rounded-md border text-sm transition-colors ${
                isSelected
                  ? "border-[var(--border-accent)] bg-accent/5 text-white"
                  : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
