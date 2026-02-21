"use client";

import TextArea from "@/components/ui/TextArea";
import SectionWrapper from "../SectionWrapper";

interface WebsiteFeaturesData {
  needed_features?: string[];
  other_features?: string;
}

interface Props {
  data: WebsiteFeaturesData;
  onChange: (data: WebsiteFeaturesData) => void;
}

export default function WebsiteFeaturesStep({ data, onChange }: Props) {
  return (
    <SectionWrapper
      title="Special Requests"
      subtitle="We'll handle the essentials. Is there anything specific you'd like?"
    >
      <p className="text-[var(--text-soft)] text-sm -mt-2 mb-4">
        Things like contact forms, photo galleries, and SEO are standard.
        But if you need something special — online ordering, appointment booking,
        payment processing, a specific integration — let us know.
      </p>

      <TextArea
        label="Any special features or integrations you need?"
        value={data.other_features || ""}
        onChange={(v) => onChange({ ...data, other_features: v })}
        placeholder="Online ordering, appointment booking, payment processing, specific integrations..."
        name="other_features"
      />
    </SectionWrapper>
  );
}
