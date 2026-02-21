"use client";

import type { UploadedFile } from "@/lib/types";
import SectionWrapper from "../SectionWrapper";
import DarkLightPicker from "../DarkLightPicker";
import BrandPersonalityPicker from "../BrandPersonalityPicker";
import StylePicker, {
  CleanPreview,
  BoldPreview,
  WarmPreview,
  RuggedPreview,
  ColorPalettePreview,
} from "../StylePicker";
import ColorInput from "@/components/ui/ColorInput";
import UrlInput from "@/components/ui/UrlInput";
import FileUpload from "@/components/ui/FileUpload";

const WEBSITE_STYLES = [
  {
    value: "clean-professional",
    label: "Clean & Professional",
    description: "White space, thin lines, trustworthy and polished",
    preview: <CleanPreview />,
  },
  {
    value: "bold-modern",
    label: "Bold & Modern",
    description: "Dark backgrounds, bright accents, strong presence",
    preview: <BoldPreview />,
  },
  {
    value: "warm-friendly",
    label: "Warm & Friendly",
    description: "Soft colors, rounded edges, approachable feel",
    preview: <WarmPreview />,
  },
  {
    value: "rugged-industrial",
    label: "Rugged & Industrial",
    description: "Hard edges, dark steel, built tough",
    preview: <RuggedPreview />,
  },
];

const COLOR_MOODS = [
  {
    value: "earth-tones",
    label: "Earth Tones",
    description: "Warm browns, greens, natural feel",
    preview: <ColorPalettePreview colors={["#8B7355", "#2D5016", "#F5F0E8", "#C75B39"]} />,
  },
  {
    value: "cool-professional",
    label: "Cool & Professional",
    description: "Navy, slate, clean and corporate",
    preview: <ColorPalettePreview colors={["#1e3a5f", "#64748b", "#ffffff", "#93c5fd"]} />,
  },
  {
    value: "bold-energetic",
    label: "Bold & Energetic",
    description: "High contrast, strong and confident",
    preview: <ColorPalettePreview colors={["#000000", "#dc2626", "#ffffff", "#4b5563"]} />,
  },
  {
    value: "natural-fresh",
    label: "Natural & Fresh",
    description: "Greens, whites, outdoorsy and clean",
    preview: <ColorPalettePreview colors={["#16a34a", "#ffffff", "#d4a574", "#87ceeb"]} />,
  },
];

interface YourBrandData {
  dark_or_light?: string;
  brand_personality?: string[];
  has_brand_colors?: boolean;
  brand_colors?: string[];
  website_style?: string;
  color_mood?: string;
  inspiration_urls?: string[];
  uploads?: UploadedFile[];
}

interface Props {
  data: YourBrandData;
  onChange: (data: YourBrandData) => void;
  slug: string;
}

export default function YourBrandStep({ data, onChange, slug }: Props) {
  function update<K extends keyof YourBrandData>(field: K, value: YourBrandData[K]) {
    onChange({ ...data, [field]: value });
  }

  return (
    <SectionWrapper
      title="Your Brand"
      subtitle="Pick what speaks to you. There are no wrong answers."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DarkLightPicker
          selected={data.dark_or_light || ""}
          onChange={(v) => update("dark_or_light", v)}
        />

        {/* Brand colors */}
        <div>
          <span className="input-label">Do you already have brand colors?</span>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => update("has_brand_colors", true)}
              className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                data.has_brand_colors === true
                  ? "border-[var(--border-accent)] bg-accent/5 text-white"
                  : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                update("has_brand_colors", false);
                update("brand_colors", []);
              }}
              className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                data.has_brand_colors === false
                  ? "border-[var(--border-accent)] bg-accent/5 text-white"
                  : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              No
            </button>
          </div>

          {data.has_brand_colors && (
            <div className="mt-3">
              <ColorInput
                colors={data.brand_colors || []}
                onChange={(c) => update("brand_colors", c)}
              />
            </div>
          )}
        </div>
      </div>

      <BrandPersonalityPicker
        selected={data.brand_personality || []}
        onChange={(v) => update("brand_personality", v)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StylePicker
          label="Which of these feels closest to what you want?"
          options={WEBSITE_STYLES}
          selected={data.website_style || ""}
          onSelect={(v) => update("website_style", v)}
        />

        <StylePicker
          label="What colors feel right for your brand?"
          options={COLOR_MOODS}
          selected={data.color_mood || ""}
          onSelect={(v) => update("color_mood", v)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <UrlInput
          label="Any websites you love the look of? (up to 3)"
          urls={data.inspiration_urls || []}
          onChange={(u) => update("inspiration_urls", u)}
          max={3}
          placeholder="https://a-website-you-love.com"
        />

        <FileUpload
          label="Got any images that show the vibe? Logos, screenshots, anything"
          files={data.uploads || []}
          onChange={(f) => update("uploads", f)}
          uploadUrl={`/api/intake/${slug}/upload`}
          max={3}
        />
      </div>
    </SectionWrapper>
  );
}
