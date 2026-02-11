"use client";

import RadioGroup from "@/components/ui/RadioGroup";
import TextArea from "@/components/ui/TextArea";
import StepWrapper from "../StepWrapper";

interface ContentMediaData {
  has_photos?: string;
  has_logo?: string;
  has_videos?: string;
  other_content?: string;
}

interface Props {
  data: ContentMediaData;
  onChange: (data: ContentMediaData) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export default function ContentMediaStep({ data, onChange, onNext, onBack, isSaving }: Props) {
  function update(field: keyof ContentMediaData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <StepWrapper
      title="Content & Media"
      subtitle="What do you already have that we can work with?"
      onNext={onNext}
      onBack={onBack}
      isFirst={false}
      isLast={false}
      isSaving={isSaving}
    >
      <RadioGroup
        label="Do you have photos of your work?"
        options={[
          { value: "tons", label: "Tons — I take pics of everything" },
          { value: "some", label: "Some — a few on my phone" },
          { value: "not-really", label: "Not really" },
        ]}
        selected={data.has_photos || ""}
        onChange={(v) => update("has_photos", v)}
      />

      <RadioGroup
        label="Do you have a logo?"
        options={[
          { value: "yes", label: "Yes" },
          { value: "sort-of", label: "Sort of — could use a refresh" },
          { value: "no", label: "No" },
        ]}
        selected={data.has_logo || ""}
        onChange={(v) => update("has_logo", v)}
      />

      <RadioGroup
        label="Any videos of your work or team?"
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
        selected={data.has_videos || ""}
        onChange={(v) => update("has_videos", v)}
      />

      <TextArea
        label="Anything else — testimonials, certifications, awards?"
        value={data.other_content || ""}
        onChange={(v) => update("other_content", v)}
        placeholder="Licensed & insured, BBB accredited, 5-star reviews..."
        name="other_content"
        rows={3}
      />
    </StepWrapper>
  );
}
