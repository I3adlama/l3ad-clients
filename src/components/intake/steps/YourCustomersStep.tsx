"use client";

import TextArea from "@/components/ui/TextArea";
import CheckboxGroup from "@/components/ui/CheckboxGroup";
import AiSuggestion from "@/components/ui/AiSuggestion";
import SectionWrapper from "../SectionWrapper";

const DISCOVERY_OPTIONS = [
  { value: "Word of mouth", label: "Word of mouth" },
  { value: "Nextdoor", label: "Nextdoor" },
  { value: "Facebook", label: "Facebook" },
  { value: "Google Search", label: "Google Search" },
  { value: "Google Maps", label: "Google Maps" },
  { value: "Yard signs", label: "Yard signs" },
  { value: "Referrals", label: "Referrals" },
  { value: "Home Advisor / Angi", label: "Home Advisor / Angi" },
];

interface YourCustomersData {
  ideal_customer?: string;
  how_they_find_you?: string[];
  want_more_of?: string;
}

interface Props {
  data: YourCustomersData;
  onChange: (data: YourCustomersData) => void;
  aiPrefill?: {
    ideal_customer?: string;
    how_they_find_you?: string[];
  };
}

export default function YourCustomersStep({ data, onChange, aiPrefill }: Props) {
  function update<K extends keyof YourCustomersData>(field: K, value: YourCustomersData[K]) {
    onChange({ ...data, [field]: value });
  }

  return (
    <SectionWrapper
      title="Your Customers"
      subtitle="Help us understand who you're trying to reach."
    >
      <AiSuggestion
        label="Who's your ideal customer?"
        aiSuggestion={aiPrefill?.ideal_customer}
        currentValue={data.ideal_customer || ""}
        onChange={(v) => update("ideal_customer", v)}
        placeholder="Homeowners? Commercial properties? New builds? Describe who you love working with."
        name="ideal_customer"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CheckboxGroup
          label="How do most customers find you right now?"
          options={DISCOVERY_OPTIONS}
          selected={data.how_they_find_you || []}
          onChange={(v) => update("how_they_find_you", v)}
        />

        <TextArea
          label="Is there a type of customer or job you'd love to get more of?"
          value={data.want_more_of || ""}
          onChange={(v) => update("want_more_of", v)}
          placeholder="Maybe bigger jobs, a specific neighborhood, commercial work..."
          name="want_more_of"
          minRows={3}
        />
      </div>
    </SectionWrapper>
  );
}
