"use client";

interface Option {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: CheckboxGroupProps) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div>
      <span className="input-label">{label}</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className={`text-left p-3 rounded-md border transition-colors ${
                isSelected
                  ? "border-[var(--border-accent)] bg-accent/5 text-white"
                  : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-accent border-accent text-black"
                      : "border-[var(--border-strong)]"
                  }`}
                >
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-sm">{option.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
