"use client";

import TextArea from "@/components/ui/TextArea";
import TextInput from "@/components/ui/TextInput";
import RadioGroup from "@/components/ui/RadioGroup";
import SectionWrapper from "../SectionWrapper";

interface GoalsData {
  primary_goal?: string;
  timeline?: string;
  websites_admired?: string;
  competitor_url?: string;
  anything_else?: string;
}

interface Props {
  data: GoalsData;
  onChange: (data: GoalsData) => void;
}

export default function GoalsStep({ data, onChange }: Props) {
  function update(field: keyof GoalsData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <SectionWrapper
      title="Goals"
      subtitle="Last section — what does success look like?"
    >
      <TextArea
        label="What's the #1 thing you want this website to do for your business?"
        value={data.primary_goal || ""}
        onChange={(v) => update("primary_goal", v)}
        placeholder="Get more phone calls? Look more professional? Show up on Google?"
        name="primary_goal"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <TextInput
          label="Who's your biggest competitor? (website URL if you have it)"
          value={data.competitor_url || ""}
          onChange={(v) => update("competitor_url", v)}
          placeholder="https://competitor.com or just their name"
          name="competitor_url"
        />
      </div>

      <TextArea
        label="Are there any websites you really admire? What do you like about them?"
        value={data.websites_admired || ""}
        onChange={(v) => update("websites_admired", v)}
        placeholder="A competitor's site, a brand you love, anything that caught your eye..."
        name="websites_admired"
        minRows={3}
      />

      <TextArea
        label="Anything else we should know?"
        value={data.anything_else || ""}
        onChange={(v) => update("anything_else", v)}
        placeholder="Things you hate about websites, pet peeves, must-haves..."
        name="anything_else"
        minRows={3}
      />
    </SectionWrapper>
  );
}
