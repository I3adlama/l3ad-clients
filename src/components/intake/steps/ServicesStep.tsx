"use client";

import { useState, useRef } from "react";
import RadioGroup from "@/components/ui/RadioGroup";
import AiSuggestion from "@/components/ui/AiSuggestion";
import RadiusSlider from "@/components/ui/RadiusSlider";
import SectionWrapper from "../SectionWrapper";

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
  aiServices?: string[];
  aiPrefill?: {
    main_services?: string[];
    specialty?: string;
    service_area?: string;
  };
  location?: string;
}

export default function ServicesStep({
  data,
  onChange,
  aiServices,
  aiPrefill,
  location,
}: Props) {
  const [showPricing, setShowPricing] = useState(data.wants_pricing_research ?? false);
  const [customService, setCustomService] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);

  // On first visit with AI services, initialize verified_services to all AI services
  const hasAiServices = aiServices && aiServices.length > 0;
  if (hasAiServices && !data.verified_services) {
    // Initialize all AI services as checked
    onChange({ ...data, verified_services: [...aiServices] });
  }

  function update<K extends keyof ServicesData>(field: K, value: ServicesData[K]) {
    onChange({ ...data, [field]: value });
  }

  function addCustomService() {
    const trimmed = customService.trim();
    if (!trimmed) return;
    const current = data.verified_services || [];
    if (!current.includes(trimmed)) {
      update("verified_services", [...current, trimmed]);
    }
    setCustomService("");
    customInputRef.current?.focus();
  }

  return (
    <SectionWrapper
      title="Services"
      subtitle="What do you do? Let us know everything."
    >
      {/* AI-discovered services verification */}
      {hasAiServices && (
        <div>
          <span className="input-label">We found these services — uncheck any that don&apos;t apply</span>
          <div className="space-y-2">
            {(data.verified_services || aiServices).map((service) => {
              const verified = data.verified_services || aiServices;
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
                      : "border-[var(--border)] bg-noir-800 text-[var(--text-soft)]"
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

          {/* Add custom service */}
          <div className="flex gap-2 mt-3">
            <input
              ref={customInputRef}
              type="text"
              className="input-field flex-1"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomService();
                }
              }}
              placeholder="Add another service..."
            />
            <button
              type="button"
              onClick={addCustomService}
              className="px-4 py-2 rounded-md border border-[var(--border-accent)] bg-accent/10 text-accent text-sm hover:bg-accent/20 transition-colors shrink-0"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <AiSuggestion
        label="What's your bread and butter — the thing you do the most?"
        aiSuggestion={aiPrefill?.specialty}
        currentValue={data.specialty || ""}
        onChange={(v) => update("specialty", v)}
        placeholder="The work you're best known for..."
        name="specialty"
        minRows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RadiusSlider
          label="What areas do you serve?"
          value={data.service_area || "25 miles"}
          onChange={(v) => update("service_area", v)}
          location={location}
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
    </SectionWrapper>
  );
}
