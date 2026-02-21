"use client";

interface RadiusSliderProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  location?: string;
}

export default function RadiusSlider({
  label,
  value,
  onChange,
  location,
}: RadiusSliderProps) {
  // Parse current miles from stored string like "25 miles"
  const parsed = parseInt(value, 10);
  const miles = isNaN(parsed) ? 25 : parsed;

  const locationLabel = location || "your location";

  return (
    <div>
      <span className="input-label">{label}</span>
      <div className="mt-1">
        <input
          type="range"
          min={5}
          max={100}
          step={5}
          value={miles}
          onChange={(e) => onChange(`${e.target.value} miles`)}
          className="radius-slider w-full"
        />
        <p className="text-sm text-[var(--text-muted)] mt-2 text-center">
          <span className="text-accent font-semibold">{miles} miles</span>
          {" "}from {locationLabel}
        </p>
      </div>
    </div>
  );
}
