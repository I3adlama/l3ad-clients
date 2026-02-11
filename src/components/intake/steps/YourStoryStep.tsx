"use client";

import TextInput from "@/components/ui/TextInput";
import TextArea from "@/components/ui/TextArea";
import StepWrapper from "../StepWrapper";

interface YourStoryData {
  how_started?: string;
  years_in_business?: string;
  proud_of?: string;
  differentiator?: string;
}

interface Props {
  data: YourStoryData;
  onChange: (data: YourStoryData) => void;
  onNext: () => void;
  isSaving: boolean;
}

export default function YourStoryStep({ data, onChange, onNext, isSaving }: Props) {
  function update(field: keyof YourStoryData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <StepWrapper
      title="Your Story"
      subtitle="We want to get to know you and your business."
      onNext={onNext}
      isFirst
      isLast={false}
      isSaving={isSaving}
    >
      <TextArea
        label="How did you get into this business?"
        value={data.how_started || ""}
        onChange={(v) => update("how_started", v)}
        placeholder="What got you started? Family business, career change, saw an opportunity?"
        name="how_started"
      />

      <TextInput
        label="How long have you been doing this?"
        value={data.years_in_business || ""}
        onChange={(v) => update("years_in_business", v)}
        placeholder="e.g. 5 years, since 2019, just getting started"
        name="years_in_business"
      />

      <TextArea
        label="Tell us about a job you're really proud of"
        value={data.proud_of || ""}
        onChange={(v) => update("proud_of", v)}
        placeholder="A project that really shows what you can do..."
        name="proud_of"
      />

      <TextArea
        label="What makes you different from the other guys?"
        value={data.differentiator || ""}
        onChange={(v) => update("differentiator", v)}
        placeholder="Why should someone pick you over the competition?"
        name="differentiator"
      />
    </StepWrapper>
  );
}
