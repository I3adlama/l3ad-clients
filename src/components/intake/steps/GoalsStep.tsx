"use client";

import TextArea from "@/components/ui/TextArea";
import RadioGroup from "@/components/ui/RadioGroup";
import StepWrapper from "../StepWrapper";

interface GoalsData {
  primary_goal?: string;
  timeline?: string;
  anything_else?: string;
}

interface Props {
  data: GoalsData;
  onChange: (data: GoalsData) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export default function GoalsStep({ data, onChange, onNext, onBack, isSaving }: Props) {
  function update(field: keyof GoalsData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <StepWrapper
      title="Goals"
      subtitle="Last step — what does success look like?"
      onNext={onNext}
      onBack={onBack}
      isFirst={false}
      isLast
      isSaving={isSaving}
    >
      <TextArea
        label="What's the #1 thing you want this website to do for your business?"
        value={data.primary_goal || ""}
        onChange={(v) => update("primary_goal", v)}
        placeholder="Get more phone calls? Look more professional? Show up on Google?"
        name="primary_goal"
      />

      <RadioGroup
        label="When do you need this done by?"
        options={[
          { value: "asap", label: "ASAP" },
          { value: "within-a-month", label: "Within a month" },
          { value: "within-3-months", label: "Within 3 months" },
          { value: "no-rush", label: "No rush" },
        ]}
        selected={data.timeline || ""}
        onChange={(v) => update("timeline", v)}
      />

      <TextArea
        label="Anything else we should know?"
        value={data.anything_else || ""}
        onChange={(v) => update("anything_else", v)}
        placeholder="Anything at all — competitors you like, things you hate, pet peeves with websites..."
        name="anything_else"
        rows={3}
      />
    </StepWrapper>
  );
}
