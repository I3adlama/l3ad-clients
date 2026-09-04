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
import YourDataStep from "./steps/YourDataStep";
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

const AUTOSAVE_DELAY_MS = 1500;

/** True when the client has typed or picked at least one real answer. */
function hasAnyAnswer(responses: IntakeResponses): boolean {
  for (const section of Object.values(responses)) {
    if (!section || typeof section !== "object") continue;
    for (const value of Object.values(section as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) return true;
      if (typeof value === "boolean") return true;
      if (Array.isArray(value) && value.length > 0) return true;
    }
  }
  return false;
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
  const [submitting, setSubmitting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Always-current copy of responses so timers and unload handlers never see stale state
  const responsesRef = useRef<IntakeResponses>(initialResponses);
  const dirtyRef = useRef<Set<number>>(new Set());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const totalSteps = STEP_SECTIONS.length;

  // --- Save logic ---

  const saveSection = useCallback(
    async (step: number, keepalive = false) => {
      const sectionKey = STEP_SECTIONS[step];
      const res = await fetch(`/api/intake/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        keepalive,
        body: JSON.stringify({
          step,
          section_key: sectionKey,
          data: responsesRef.current[sectionKey] || {},
        }),
      });
      if (!res.ok) {
        throw new Error(`Save failed for ${sectionKey} (${res.status})`);
      }
    },
    [slug]
  );

  const saveDirtySections = useCallback(async () => {
    if (submittedRef.current) return;
    const dirty = Array.from(dirtyRef.current);
    if (dirty.length === 0) return;

    dirtyRef.current.clear();
    setSaveStatus("saving");
    try {
      await Promise.all(dirty.map((step) => saveSection(step)));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
    } catch (err) {
      console.error("Autosave failed:", err);
      // Put the sections back so the next edit retries them
      for (const step of dirty) dirtyRef.current.add(step);
      setSaveStatus("error");
    }
  }, [saveSection]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDirtySections();
    }, AUTOSAVE_DELAY_MS);
  }, [saveDirtySections]);

  function updateSection<K extends keyof IntakeResponses>(key: K, data: IntakeResponses[K]) {
    const next = { ...responsesRef.current, [key]: data };
    responsesRef.current = next;
    setResponses(next);
    const stepIndex = STEP_SECTIONS.indexOf(key);
    if (stepIndex !== -1) dirtyRef.current.add(stepIndex);
    scheduleSave();
  }

  // --- Submit ---

  async function handleSubmit() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSubmitError(null);

    if (!hasAnyAnswer(responsesRef.current)) {
      setSubmitError("Answer at least a few questions before submitting, even short answers help.");
      return;
    }

    setSubmitting(true);
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/intake/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", responses: responsesRef.current }),
      });

      if (!res.ok) {
        let message = "Something went wrong saving your responses. Please try again.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          /* non-JSON error body */
        }
        throw new Error(message);
      }

      submittedRef.current = true;
      dirtyRef.current.clear();
      window.location.href = `/intake/${slug}/thank-you`;
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSaveStatus("idle");
      setSubmitting(false);
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

  // --- Flush unsaved edits when the tab is hidden or closed ---

  useEffect(() => {
    function flush() {
      if (submittedRef.current || dirtyRef.current.size === 0) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const dirty = Array.from(dirtyRef.current);
      dirtyRef.current.clear();
      for (const step of dirty) {
        saveSection(step, true).catch(() => dirtyRef.current.add(step));
      }
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") flush();
    }
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [saveSection]);

  const statusLabel =
    saveStatus === "saving" ? "Saving..." :
    saveStatus === "saved" ? "Saved" :
    saveStatus === "error" ? "Couldn't save, will retry" :
    "";

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

      {/* Save status pill */}
      {statusLabel && (
        <div
          className={`fixed top-3 right-3 z-50 text-[11px] font-ui uppercase tracking-wider px-2.5 py-1 rounded border ${
            saveStatus === "error"
              ? "border-red-400/40 bg-red-400/10 text-red-300"
              : "border-[var(--border)] bg-noir-900/90 text-[var(--text-soft)]"
          }`}
          aria-live="polite"
        >
          {statusLabel}
        </div>
      )}

      <div className="min-h-screen overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl sm:text-3xl">
              Welcome, {clientName}
            </h1>
            <p className="text-[var(--text-soft)] text-sm mt-1">
              Let&apos;s build something great together. Your answers save as you go.
            </p>
          </div>

          {/* Section 0: Your Story */}
          <div ref={(el) => { sectionRefs.current[0] = el; }}>
            <ComicCard variant="form">
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
            <ComicCard variant="form">
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
            <ComicCard variant="form">
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

          {/* Section 3: Your Numbers (internal / original data) */}
          <div ref={(el) => { sectionRefs.current[3] = el; }}>
            <ComicCard variant="form">
              <div className="p-5 sm:p-6">
                <YourDataStep
                  data={responses.your_data || {}}
                  onChange={(d) => updateSection("your_data", d)}
                  slug={slug}
                />
              </div>
            </ComicCard>
          </div>

          <SectionDivider />

          {/* Section 4: Your Brand */}
          <div ref={(el) => { sectionRefs.current[4] = el; }}>
            <ComicCard variant="form">
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

          {/* Section 5: Content & Media */}
          <div ref={(el) => { sectionRefs.current[5] = el; }}>
            <ComicCard variant="form">
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

          {/* Section 6: Special Requests */}
          <div ref={(el) => { sectionRefs.current[6] = el; }}>
            <ComicCard variant="form">
              <div className="p-5 sm:p-6">
                <WebsiteFeaturesStep
                  data={responses.website_features || {}}
                  onChange={(d) => updateSection("website_features", d)}
                />
              </div>
            </ComicCard>
          </div>

          <SectionDivider />

          {/* Section 7: Goals */}
          <div ref={(el) => { sectionRefs.current[7] = el; }}>
            <ComicCard variant="form">
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
            <BevelButton onClick={handleSubmit} disabled={submitting} size="lg">
              {submitting ? "Submitting..." : "Submit"}
            </BevelButton>
            <p className="text-[var(--text-soft)] text-xs text-center">
              {totalSteps} sections. You can come back to this link any time before you submit.
            </p>
            {submitError && (
              <p className="text-red-400 text-sm text-center mt-2" role="alert">{submitError}</p>
            )}
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
