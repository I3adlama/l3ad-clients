"use client";

interface DarkLightPickerProps {
  selected: string;
  onChange: (value: string) => void;
}

const options = [
  {
    value: "dark",
    label: "Dark & Bold",
    description: "Dark backgrounds, bright text",
    bg: "bg-noir-900",
    text: "text-white",
    accent: "bg-accent",
    border: "border-noir-600",
  },
  {
    value: "light",
    label: "Light & Clean",
    description: "White backgrounds, dark text",
    bg: "bg-white",
    text: "text-noir-900",
    accent: "bg-blue-500",
    border: "border-gray-200",
  },
  {
    value: "no-preference",
    label: "No Preference",
    description: "We'll pick what works best",
    bg: "bg-gradient-to-r from-noir-800 to-white",
    text: "text-white",
    accent: "bg-accent",
    border: "border-noir-500",
  },
];

export default function DarkLightPicker({ selected, onChange }: DarkLightPickerProps) {
  return (
    <div>
      <span className="input-label">Do you prefer a darker or lighter website?</span>
      <div className="grid grid-cols-3 gap-3 mt-2">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-lg border-2 overflow-hidden transition-all text-left ${
                isSelected
                  ? "border-accent shadow-[0_0_12px_rgba(0,240,208,0.3)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]"
              }`}
            >
              {/* Preview */}
              <div className={`h-20 ${opt.bg} ${opt.border} p-3 flex flex-col justify-end`}>
                <div className={`h-1.5 ${opt.accent} rounded-full w-8 mb-1.5`} />
                <div className={`h-1 rounded-full w-12 ${opt.value === "light" ? "bg-gray-300" : "bg-white/20"}`} />
                <div className={`h-1 rounded-full w-8 mt-1 ${opt.value === "light" ? "bg-gray-200" : "bg-white/10"}`} />
              </div>
              <div className="p-2 bg-noir-800">
                <p className="text-xs font-bold text-white">{opt.label}</p>
                <p className="text-[10px] text-[var(--text-soft)] mt-0.5">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
