"use client";

interface StyleOption {
  value: string;
  label: string;
  description: string;
  preview: React.ReactNode;
}

interface StylePickerProps {
  label: string;
  options: StyleOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function StylePicker({
  label,
  options,
  selected,
  onSelect,
}: StylePickerProps) {
  return (
    <div>
      <span className="input-label">{label}</span>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`relative rounded-lg border-2 overflow-hidden transition-all text-left ${
                isSelected
                  ? "border-accent shadow-[0_0_12px_rgba(0,240,208,0.3)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                {option.preview}
              </div>
              <div className="p-2.5 bg-noir-800">
                <p className="text-sm font-bold text-white">{option.label}</p>
                <p className="text-xs text-[var(--text-soft)] mt-0.5 line-clamp-2">
                  {option.description}
                </p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path
                      d="M1 5L4.5 8L11 1"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===== Website Style Previews ===== */

export function CleanPreview() {
  return (
    <div className="h-full bg-white p-2">
      <div className="h-2 bg-blue-500 rounded-full w-12 mb-2" />
      <div className="space-y-1">
        <div className="h-2 bg-gray-200 rounded w-3/4" />
        <div className="h-2 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1">
        <div className="h-8 bg-gray-100 rounded" />
        <div className="h-8 bg-gray-100 rounded" />
      </div>
      <div className="mt-2 h-3 bg-blue-500 rounded w-16" />
    </div>
  );
}

export function BoldPreview() {
  return (
    <div className="h-full bg-noir-900 p-2">
      <div className="h-2 bg-accent rounded-full w-10 mb-2" />
      <div className="h-6 bg-white rounded w-3/4 mb-1" />
      <div className="h-2 bg-noir-400 rounded w-2/3" />
      <div className="mt-3 flex gap-1">
        <div className="h-3 bg-accent rounded w-14" />
        <div className="h-3 bg-noir-600 rounded w-14" />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        <div className="h-6 bg-noir-700 rounded" />
        <div className="h-6 bg-noir-700 rounded" />
        <div className="h-6 bg-noir-700 rounded" />
      </div>
    </div>
  );
}

export function WarmPreview() {
  return (
    <div className="h-full bg-amber-50 p-2">
      <div className="h-2 bg-amber-700 rounded-full w-12 mb-2" />
      <div className="space-y-1">
        <div className="h-3 bg-amber-900/20 rounded-lg w-3/4" />
        <div className="h-2 bg-amber-900/10 rounded-lg w-1/2" />
      </div>
      <div className="mt-3 h-10 bg-amber-100 rounded-xl" />
      <div className="mt-2 h-3 bg-amber-600 rounded-full w-16" />
    </div>
  );
}

export function RuggedPreview() {
  return (
    <div className="h-full bg-zinc-800 p-2">
      <div className="h-2 bg-orange-500 w-10 mb-2" />
      <div className="h-5 bg-zinc-200 w-3/4 mb-1" />
      <div className="h-2 bg-zinc-500 w-2/3" />
      <div className="mt-3 grid grid-cols-2 gap-1">
        <div className="h-8 bg-zinc-700 border border-zinc-600" />
        <div className="h-8 bg-zinc-700 border border-zinc-600" />
      </div>
      <div className="mt-2 h-3 bg-orange-500 w-14" />
    </div>
  );
}

/* ===== Color Mood Previews ===== */

export function ColorPalettePreview({ colors }: { colors: string[] }) {
  return (
    <div className="h-full flex flex-col">
      {colors.map((color, i) => (
        <div key={i} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

/* ===== Photo Style Previews ===== */

export function PhotoStylePreview({
  icon,
  bgClass,
}: {
  icon: string;
  bgClass: string;
}) {
  return (
    <div className={`h-full flex items-center justify-center ${bgClass}`}>
      <span className="text-3xl">{icon}</span>
    </div>
  );
}
