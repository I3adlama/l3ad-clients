"use client";

import { useState } from "react";
import TextArea from "@/components/ui/TextArea";
import TextInput from "@/components/ui/TextInput";
import CheckboxGroup from "@/components/ui/CheckboxGroup";
import RadioGroup from "@/components/ui/RadioGroup";
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
  verified_services?: string[];
  additional_services?: string[];
  specialty?: string;
  service_area?: string;
  wants_pricing_research?: boolean;
  target_margin?: string;
}

interface Props {
  data: ServicesData;
  onChange: (data: ServicesData) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
  aiServices?: string[];
}

export default function ServicesStep({ data, onChange, onNext, onBack, isSaving, aiServices }: Props) {
  const [showPricing, setShowPricing] = useState(data.wants_pricing_research ?? false);

  function update<K extends keyof ServicesData>(field: K, value: ServicesData[K]) {
    onChange({ ...data, [field]: value });
  }

  return (
    <StepWrapper
      title="Services"
      subtitle="What do you do? Let us know everything."
      onNext={onNext}
      onBack={onBack}
      isFirst={false}
      isLast={false}
      isSaving={isSaving}
    >
      {/* AI-discovered services verification */}
      {aiServices && aiServices.length > 0 && (
        <div>
          <span className="input-label">We found these services — are they right?</span>
          <p className="text-[var(--text-soft)] text-xs mb-2">
            Uncheck any that don&apos;t apply
          </p>
          <div className="space-y-2">
            {aiServices.map((service) => {
              const verified = data.verified_services || [];
              const isChecked = verified.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => {
                    const next = isChecked
                      ? verified.filter((s) => s !== service)
                      : [...verified, service];
                    update("verified_services", next);
                  }}
                  className={`flex items-center gap-2 w-full text-left p-3 rounded-md border transition-colors ${
                    isChecked
                      ? "border-[var(--border-accent)] bg-accent/5 text-white"
                      : "border-[var(--border)] bg-noir-800 text-[var(--text-soft)] line-through"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                      isChecked
                        ? "bg-accent border-accent text-black"
                        : "border-[var(--border-strong)]"
                    }`}
                  >
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm">{service}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional services */}
      <CheckboxGroup
        label={aiServices?.length ? "Any other services you offer?" : "What services do you offer?"}
        options={SERVICE_OPTIONS}
        selected={data.additional_services || data.main_services || []}
        onChange={(v) => {
          if (aiServices?.length) {
            update("additional_services", v);
          } else {
            update("main_services", v);
          }
        }}
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

      {/* Pricing research opt-in */}
      <div>
        <span className="input-label">
          Would you like us to research competitor pricing in your area?
        </span>
        <p className="text-[var(--text-soft)] text-xs mb-2">
          We&apos;ll analyze what competitors charge and suggest pricing for your services
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setShowPricing(true);
              update("wants_pricing_research", true);
            }}
            className={`px-4 py-2 rounded-md border text-sm transition-colors ${
              showPricing
                ? "border-[var(--border-accent)] bg-accent/5 text-white"
                : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
            }`}
          >
            Yes, please!
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPricing(false);
              update("wants_pricing_research", false);
              update("target_margin", undefined);
            }}
            className={`px-4 py-2 rounded-md border text-sm transition-colors ${
              !showPricing && data.wants_pricing_research !== undefined
                ? "border-[var(--border-accent)] bg-accent/5 text-white"
                : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
            }`}
          >
            No thanks
          </button>
        </div>
      </div>

      {showPricing && (
        <RadioGroup
          label="What kind of pricing do you aim for?"
          options={[
            { value: "budget", label: "Budget-friendly — beat the competition on price" },
            { value: "mid-range", label: "Mid-range — competitive and fair (Recommended)" },
            { value: "premium", label: "Premium — quality work, premium price" },
          ]}
          selected={data.target_margin || ""}
          onChange={(v) => update("target_margin", v)}
        />
      )}
    </StepWrapper>
  );
}
