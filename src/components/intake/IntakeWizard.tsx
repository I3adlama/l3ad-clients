"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { IntakeResponses, AiPrefill } from "@/lib/types";
import { STEP_SECTIONS } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import ComicFooter from "@/components/layout/ComicFooter";
import ComicCard from "@/components/ui/ComicCard";
import BevelButton from "@/components/ui/BevelButton";
import YourStoryStep from "./steps/YourStoryStep";
import ServicesStep from "./steps/ServicesStep";
import YourCustomersStep from "./steps/YourCustomersStep";
import YourBrandStep from "./steps/YourBrandStep";
import ContentMediaStep from "./steps/ContentMediaStep";
import WebsiteFeaturesStep from "./steps/WebsiteFeaturesStep";
import GoalsStep from "./steps/GoalsStep";
import SectionDivider from "./SectionDivider";

interface IntakeWizardProps {
  slug: string;
  clientName: string;
  initialResponses: IntakeResponses;
  initialStep: number;
  aiServices?: string[];
  aiPrefill?: AiPrefill;
  location?: string;
}

export default function IntakeWizard({
  slug,
  clientName,
  initialResponses,
  initialStep,
  aiServices,
  aiPrefill,
  location,
}: IntakeWizardProps) {
  const [responses, setResponses] = useState<IntakeResponses>(initialResponses);
  const [isSaving, setIsSaving] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Track which sections have been modified for debounced auto-save
  const dirtyRef = useRef<Set<number>>(new Set());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastModifiedRef = useRef<number>(0);

  // Section refs for scrolling
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalSteps = STEP_SECTIONS.length;

  // --- Save logic ---

  const saveSection = useCallback(
    async (step: number, completed = false) => {
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
    },
    [slug, responses]
  );

  const saveDirtySections = useCallback(async () => {
    const dirty = Array.from(dirtyRef.current);
    if (dirty.length === 0) return;

    setSaveStatus("saving");
    setIsSaving(true);
    try {
      await Promise.all(dirty.map((step) => saveSection(step)));
      dirtyRef.current.clear();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to save:", err);
      setSaveStatus("idle");
    } finally {
      setIsSaving(false);
    }
  }, [saveSection]);

  // Debounced auto-save: 2s after last keystroke
  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDirtySections();
    }, 2000);
  }, [saveDirtySections]);

  function updateSection(key: keyof IntakeResponses, data: IntakeResponses[typeof key]) {
    setResponses((prev) => ({ ...prev, [key]: data }));
    const stepIndex = STEP_SECTIONS.indexOf(key);
    if (stepIndex !== -1) {
      dirtyRef.current.add(stepIndex);
      lastModifiedRef.current = stepIndex;
    }
    scheduleSave();
  }

  // --- Submit ---

  async function handleSubmit() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    setIsSaving(true);
    setSaveStatus("saving");
    try {
      // Save all sections, last one with completed: true
      await Promise.all(
        STEP_SECTIONS.map((_, i) => saveSection(i, i === totalSteps - 1))
      );

      // Notify admin via Web3Forms
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
    } catch (err) {
      console.error("Submit failed:", err);
      setSaveStatus("idle");
      setIsSaving(false);
    }
  }

  // --- Scroll progress bar ---

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Scroll to initial section on mount ---

  useEffect(() => {
    if (initialStep > 0 && sectionRefs.current[initialStep]) {
      setTimeout(() => {
        sectionRefs.current[initialStep]?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [initialStep]);

  // --- beforeunload beacon ---

  useEffect(() => {
    function onBeforeUnload() {
      const step = lastModifiedRef.current;
      const sectionKey = STEP_SECTIONS[step];
      const data = responses[sectionKey] || {};
      const blob = new Blob(
        [JSON.stringify({ step, section_key: sectionKey, data })],
        { type: "application/json" }
      );
      navigator.sendBeacon(`/api/intake/${slug}`, blob);
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [responses, slug]);

  return (
    <AppShell>
      <Header />

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-noir-800">
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="min-h-screen overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl sm:text-3xl">
              Welcome, {clientName}
            </h1>
            <p className="text-[var(--text-soft)] text-sm mt-1">
              Let&apos;s build something great together.
            </p>
          </div>

          {/* Section 0: Your Story */}
          <div ref={(el) => { sectionRefs.current[0] = el; }}>
            <ComicCard variant="dark">
              <div className="p-5 sm:p-6">
                <YourStoryStep
                  data={responses.your_story || {}}
                  onChange={(d) => updateSection("your_story", d)}
                  aiPrefill={aiPrefill?.your_story}
                />
              </div>
            </ComicCard>
          </div>

          <SectionDivider />

          {/* Section 1: Services */}
          <div ref={(el) => { sectionRefs.current[1] = el; }}>
            <ComicCard variant="dark">
              <div className="p-5 sm:p-6">
                <ServicesStep
                  data={responses.services || {}}
                  onChange={(d) => updateSection("services", d)}
                  aiServices={aiServices}
                  aiPrefill={aiPrefill?.services}
                  location={location}
                />
              </div>
            </ComicCard>
          </div>

          <SectionDivider />

          {/* Section 2: Your Customers */}
          <div ref={(el) => { sectionRefs.current[2] = el; }}>
            <ComicCard variant="dark">
              <div className="p-5 sm:p-6">
                <YourCustomersStep
                  data={responses.your_customers || {}}
                  onChange={(d) => updateSection("your_customers", d)}
                  aiPrefill={aiPrefill?.your_customers}
                />
              </div>
            </ComicCard>
          </div>

          <SectionDivider />

          {/* Section 3: Your Brand */}
          <div ref={(el) => { sectionRefs.current[3] = el; }}>
            <ComicCard variant="dark">
              <div className="p-5 sm:p-6">
                <YourBrandStep
                  data={responses.your_brand || {}}
                  onChange={(d) => updateSection("your_brand", d)}
                  slug={slug}
                />
              </div>
            </ComicCard>
          </div>

          <SectionDivider />

          {/* Section 4: Content & Media */}
          <div ref={(el) => { sectionRefs.current[4] = el; }}>
            <ComicCard variant="dark">
              <div className="p-5 sm:p-6">
                <ContentMediaStep
                  data={responses.content_media || {}}
                  onChange={(d) => updateSection("content_media", d)}
                  slug={slug}
                />
              </div>
            </ComicCard>
          </div>

          <SectionDivider />

          {/* Section 5: Special Requests */}
          <div ref={(el) => { sectionRefs.current[5] = el; }}>
            <ComicCard variant="dark">
              <div className="p-5 sm:p-6">
                <WebsiteFeaturesStep
                  data={responses.website_features || {}}
                  onChange={(d) => updateSection("website_features", d)}
                />
              </div>
            </ComicCard>
          </div>

          <SectionDivider />

          {/* Section 6: Goals */}
          <div ref={(el) => { sectionRefs.current[6] = el; }}>
            <ComicCard variant="dark">
              <div className="p-5 sm:p-6">
                <GoalsStep
                  data={responses.goals || {}}
                  onChange={(d) => updateSection("goals", d)}
                />
              </div>
            </ComicCard>
          </div>

          {/* Submit area */}
          <div className="mt-10 flex flex-col items-center gap-3">
            {saveStatus === "saved" && (
              <span className="text-accent text-xs font-ui uppercase tracking-wider">
                Saved
              </span>
            )}
            {saveStatus === "saving" && (
              <span className="text-[var(--text-soft)] text-xs font-ui uppercase tracking-wider">
                Saving...
              </span>
            )}
            <BevelButton onClick={handleSubmit} disabled={isSaving} size="lg">
              {isSaving ? "Submitting..." : "Submit"}
            </BevelButton>
          </div>

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
