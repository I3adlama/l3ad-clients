"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { IntakeResponses } from "@/lib/types";
import { STEP_SECTIONS } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import ComicFooter from "@/components/layout/ComicFooter";
import ComicCard from "@/components/ui/ComicCard";
import ProgressBar from "@/components/ui/ProgressBar";
import YourStoryStep from "./steps/YourStoryStep";
import ServicesStep from "./steps/ServicesStep";
import YourCustomersStep from "./steps/YourCustomersStep";
import YourBrandStep from "./steps/YourBrandStep";
import ContentMediaStep from "./steps/ContentMediaStep";
import WebsiteFeaturesStep from "./steps/WebsiteFeaturesStep";
import GoalsStep from "./steps/GoalsStep";

interface IntakeWizardProps {
  slug: string;
  clientName: string;
  initialResponses: IntakeResponses;
  initialStep: number;
  aiServices?: string[];
}

export default function IntakeWizard({
  slug,
  clientName,
  initialResponses,
  initialStep,
  aiServices,
}: IntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [responses, setResponses] = useState<IntakeResponses>(initialResponses);
  const [isSaving, setIsSaving] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animState, setAnimState] = useState<"active" | "exit" | "enter">("active");
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSteps = STEP_SECTIONS.length;

  const saveStep = useCallback(
    async (step: number, completed = false) => {
      setIsSaving(true);
      try {
        const sectionKey = STEP_SECTIONS[step];
        await fetch(`/api/intake/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step,
            section_key: sectionKey,
            data: responses[sectionKey] || {},
            completed,
          }),
        });
      } catch (err) {
        console.error("Failed to save:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [slug, responses]
  );

  function animateTransition(newStep: number, dir: "forward" | "back") {
    setDirection(dir);
    setAnimState("exit");
    setTimeout(() => {
      setCurrentStep(newStep);
      setAnimState("enter");
      containerRef.current?.scrollTo({ top: 0 });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setAnimState("active"), 20);
    }, 250);
  }

  async function handleNext() {
    await saveStep(currentStep, currentStep === totalSteps - 1);

    if (currentStep === totalSteps - 1) {
      // Notify admin via Web3Forms (fire-and-forget from browser)
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "e9fbf786-bbd1-47c8-80b8-1b98a141a58a",
          subject: `Intake completed: ${clientName}`,
          from_name: "L3ad Clients",
          message: `${clientName} just completed their intake form.\n\nView responses: ${window.location.origin}/admin`,
        }),
      }).catch(() => {});

      window.location.href = `/intake/${slug}/thank-you`;
      return;
    }

    animateTransition(currentStep + 1, "forward");
  }

  async function handleBack() {
    await saveStep(currentStep);
    animateTransition(currentStep - 1, "back");
  }

  function updateSection(key: keyof IntakeResponses, data: IntakeResponses[typeof key]) {
    setResponses((prev) => ({ ...prev, [key]: data }));
  }

  const animClass =
    animState === "exit"
      ? "step-exit"
      : animState === "enter"
        ? direction === "forward"
          ? "step-enter"
          : "step-enter-back"
        : "step-active";

  // Auto-save on beforeunload
  useEffect(() => {
    function onBeforeUnload() {
      const sectionKey = STEP_SECTIONS[currentStep];
      const data = responses[sectionKey] || {};
      const blob = new Blob(
        [JSON.stringify({ step: currentStep, section_key: sectionKey, data })],
        { type: "application/json" }
      );
      navigator.sendBeacon(`/api/intake/${slug}`, blob);
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [currentStep, responses, slug]);

  return (
    <AppShell>
      <Header />
      <div className="min-h-screen" ref={containerRef}>
        <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl sm:text-3xl">
              Welcome, {clientName}
            </h1>
            <p className="text-[var(--text-soft)] text-sm mt-1">
              Let&apos;s build something great together.
            </p>
          </div>

          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          <ComicCard variant="dark">
            <div className={`p-5 sm:p-6 ${animClass}`}>
              {currentStep === 0 && (
                <YourStoryStep
                  data={responses.your_story || {}}
                  onChange={(d) => updateSection("your_story", d)}
                  onNext={handleNext}
                  isSaving={isSaving}
                />
              )}
              {currentStep === 1 && (
                <ServicesStep
                  data={responses.services || {}}
                  onChange={(d) => updateSection("services", d)}
                  onNext={handleNext}
                  onBack={handleBack}
                  isSaving={isSaving}
                  aiServices={aiServices}
                />
              )}
              {currentStep === 2 && (
                <YourCustomersStep
                  data={responses.your_customers || {}}
                  onChange={(d) => updateSection("your_customers", d)}
                  onNext={handleNext}
                  onBack={handleBack}
                  isSaving={isSaving}
                />
              )}
              {currentStep === 3 && (
                <YourBrandStep
                  data={responses.your_brand || {}}
                  onChange={(d) => updateSection("your_brand", d)}
                  onNext={handleNext}
                  onBack={handleBack}
                  isSaving={isSaving}
                  slug={slug}
                />
              )}
              {currentStep === 4 && (
                <ContentMediaStep
                  data={responses.content_media || {}}
                  onChange={(d) => updateSection("content_media", d)}
                  onNext={handleNext}
                  onBack={handleBack}
                  isSaving={isSaving}
                  slug={slug}
                />
              )}
              {currentStep === 5 && (
                <WebsiteFeaturesStep
                  data={responses.website_features || {}}
                  onChange={(d) => updateSection("website_features", d)}
                  onNext={handleNext}
                  onBack={handleBack}
                  isSaving={isSaving}
                />
              )}
              {currentStep === 6 && (
                <GoalsStep
                  data={responses.goals || {}}
                  onChange={(d) => updateSection("goals", d)}
                  onNext={handleNext}
                  onBack={handleBack}
                  isSaving={isSaving}
                />
              )}
            </div>
          </ComicCard>

          <p className="text-center text-[var(--text-soft)] text-xs mt-6">
            Powered by{" "}
            <a
              href="https://l3adsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-bright"
            >
              L3ad Solutions
            </a>
          </p>
        </div>
      </div>
      <ComicFooter />
    </AppShell>
  );
}
