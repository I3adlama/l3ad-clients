"use client";

import { useRef } from "react";

interface ColorInputProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  max?: number;
}

export default function ColorInput({ colors, onChange, max = 5 }: ColorInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addColor(color: string) {
    if (colors.length < max && !colors.includes(color)) {
      onChange([...colors, color]);
    }
  }

  function removeColor(index: number) {
    onChange(colors.filter((_, i) => i !== index));
  }

  function updateColor(index: number, color: string) {
    const updated = [...colors];
    updated[index] = color;
    onChange(updated);
  }

  return (
    <div>
      <span className="input-label">Your brand colors</span>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {colors.map((color, i) => (
          <div key={i} className="relative group">
            <input
              type="color"
              value={color}
              onChange={(e) => updateColor(i, e.target.value)}
              className="w-10 h-10 rounded-full border-2 border-[var(--border)] cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
              style={{ backgroundColor: color }}
            />
            <button
              type="button"
              onClick={() => removeColor(i)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              x
            </button>
            <span className="block text-center text-[10px] text-[var(--text-soft)] mt-1">
              {color}
            </span>
          </div>
        ))}

        {colors.length < max && (
          <>
            <input
              ref={inputRef}
              type="color"
              className="sr-only"
              onChange={(e) => addColor(e.target.value)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-10 h-10 rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center text-[var(--text-soft)] hover:border-accent hover:text-accent transition-colors"
            >
              +
            </button>
          </>
        )}
      </div>
    </div>
  );
}
