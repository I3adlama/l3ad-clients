"use client";

import CheckboxGroup from "@/components/ui/CheckboxGroup";
import TextArea from "@/components/ui/TextArea";
import StepWrapper from "../StepWrapper";

const FEATURE_OPTIONS = [
  { value: "contact-form", label: "Contact form" },
  { value: "photo-gallery", label: "Photo gallery" },
  { value: "reviews", label: "Reviews / Testimonials" },
  { value: "online-booking", label: "Online booking / scheduling" },
  { value: "service-area-map", label: "Service area map" },
  { value: "before-after", label: "Before & after slider" },
  { value: "faq", label: "FAQ section" },
  { value: "blog", label: "Blog" },
  { value: "social-feed", label: "Social media feed" },
  { value: "free-quote", label: "Free quote / estimate form" },
];

interface WebsiteFeaturesData {
  needed_features?: string[];
  other_features?: string;
}

interface Props {
  data: WebsiteFeaturesData;
  onChange: (data: WebsiteFeaturesData) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export default function WebsiteFeaturesStep({ data, onChange, onNext, onBack, isSaving }: Props) {
  function update<K extends keyof WebsiteFeaturesData>(field: K, value: WebsiteFeaturesData[K]) {
    onChange({ ...data, [field]: value });
  }

  return (
    <StepWrapper
      title="Website Features"
      subtitle="What does your site need to do?"
      onNext={onNext}
      onBack={onBack}
      isFirst={false}
      isLast={false}
      isSaving={isSaving}
    >
      <CheckboxGroup
        label="What do you need your website to do?"
        options={FEATURE_OPTIONS}
        selected={data.needed_features || []}
        onChange={(v) => update("needed_features", v)}
      />

      <TextArea
        label="Anything else you need the site to handle?"
        value={data.other_features || ""}
        onChange={(v) => update("other_features", v)}
        placeholder="Anything we missed? Payment processing, specific integrations..."
        name="other_features"
        rows={3}
      />
    </StepWrapper>
  );
}
