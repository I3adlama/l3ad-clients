"use client";

import StepWrapper from "../StepWrapper";
import StylePicker, {
  CleanPreview,
  BoldPreview,
  WarmPreview,
  RuggedPreview,
  ColorPalettePreview,
  PhotoStylePreview,
} from "../StylePicker";

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

const PHOTO_STYLES = [
  {
    value: "real-authentic",
    label: "Real & Authentic",
    description: "Real photos of your actual work, no stock images",
    preview: <PhotoStylePreview icon="📸" bgClass="bg-amber-900/30" />,
  },
  {
    value: "polished-professional",
    label: "Polished & Professional",
    description: "Clean, well-lit, magazine quality shots",
    preview: <PhotoStylePreview icon="✨" bgClass="bg-blue-900/30" />,
  },
  {
    value: "action-shots",
    label: "Action Shots",
    description: "Your team in action, on the job site",
    preview: <PhotoStylePreview icon="🔨" bgClass="bg-orange-900/30" />,
  },
  {
    value: "before-after",
    label: "Before & After",
    description: "Show the transformation, the results",
    preview: <PhotoStylePreview icon="🔄" bgClass="bg-green-900/30" />,
  },
];

interface LookAndFeelData {
  website_style?: string;
  color_mood?: string;
  photo_style?: string;
}

interface Props {
  data: LookAndFeelData;
  onChange: (data: LookAndFeelData) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export default function LookAndFeelStep({ data, onChange, onNext, onBack, isSaving }: Props) {
  function update(field: keyof LookAndFeelData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <StepWrapper
      title="Look & Feel"
      subtitle="Pick what speaks to you. There are no wrong answers."
      onNext={onNext}
      onBack={onBack}
      isFirst={false}
      isLast={false}
      isSaving={isSaving}
    >
      <StylePicker
        label="What style speaks to you?"
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

      <StylePicker
        label="What kind of photos represent your work best?"
        options={PHOTO_STYLES}
        selected={data.photo_style || ""}
        onSelect={(v) => update("photo_style", v)}
      />
    </StepWrapper>
  );
}
