"use client";

import TextArea from "@/components/ui/TextArea";
import TextInput from "@/components/ui/TextInput";
import CheckboxGroup from "@/components/ui/CheckboxGroup";
import StepWrapper from "../StepWrapper";

const SERVICE_OPTIONS = [
  { value: "Screen Enclosures", label: "Screen Enclosures" },
  { value: "Rescreening", label: "Rescreening" },
  { value: "Pool Enclosures", label: "Pool Enclosures" },
  { value: "Patio Covers", label: "Patio Covers" },
  { value: "Sunrooms", label: "Sunrooms" },
  { value: "Pergolas", label: "Pergolas" },
  { value: "Carports", label: "Carports" },
  { value: "Gutters", label: "Gutters" },
  { value: "Fence Installation", label: "Fence Installation" },
  { value: "General Contracting", label: "General Contracting" },
];

interface ServicesData {
  main_services?: string[];
  specialty?: string;
  service_area?: string;
}

interface Props {
  data: ServicesData;
  onChange: (data: ServicesData) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export default function ServicesStep({ data, onChange, onNext, onBack, isSaving }: Props) {
  function update<K extends keyof ServicesData>(field: K, value: ServicesData[K]) {
    onChange({ ...data, [field]: value });
  }

  return (
    <StepWrapper
      title="Services"
      subtitle="What do you do? Check all that apply."
      onNext={onNext}
      onBack={onBack}
      isFirst={false}
      isLast={false}
      isSaving={isSaving}
    >
      <CheckboxGroup
        label="What services do you offer?"
        options={SERVICE_OPTIONS}
        selected={data.main_services || []}
        onChange={(v) => update("main_services", v)}
      />

      <TextArea
        label="What's your bread and butter — the thing you do the most?"
        value={data.specialty || ""}
        onChange={(v) => update("specialty", v)}
        placeholder="The work you're best known for..."
        name="specialty"
        rows={3}
      />

      <TextInput
        label="What areas do you serve?"
        value={data.service_area || ""}
        onChange={(v) => update("service_area", v)}
        placeholder="e.g. Titusville, Cocoa, Melbourne — all of Brevard County"
        name="service_area"
      />
    </StepWrapper>
  );
}
