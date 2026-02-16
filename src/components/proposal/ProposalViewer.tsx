"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ProposalData } from "@/lib/types";
import { SLIDE_LABELS } from "@/lib/types";
import TitleSlide from "./slides/TitleSlide";
import PainPointsSlide from "./slides/PainPointsSlide";
import WhyNewWebsiteSlide from "./slides/WhyNewWebsiteSlide";
import AidaStrategySlide from "./slides/AidaStrategySlide";
import ItemizedPricingSlide from "./slides/ItemizedPricingSlide";
import CompetitorsSlide from "./slides/CompetitorsSlide";
import RoiSlide from "./slides/RoiSlide";
import TimelineSlide from "./slides/TimelineSlide";
import PricingSummarySlide from "./slides/PricingSummarySlide";
import NextStepsSlide from "./slides/NextStepsSlide";

const TOTAL_SLIDES = 10;
// Title (0) and Pricing Summary (8) have bottom teal bars instead of footer
const NO_FOOTER_SLIDES = new Set([0, 8]);

interface ProposalViewerProps {
  data: ProposalData;
  clientName: string;
}

export default function ProposalViewer({ data, clientName }: ProposalViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animState, setAnimState] = useState<"active" | "exit" | "enter">("active");
  const containerRef = useRef<HTMLDivElement>(null);

  const animateTransition = useCallback((newSlide: number, dir: "forward" | "back") => {
    setDirection(dir);
    setAnimState("exit");
    setTimeout(() => {
      setCurrentSlide(newSlide);
      setAnimState("enter");
      window.scrollTo({ top: 0 });
      setTimeout(() => setAnimState("active"), 20);
    }, 300);
  }, []);

  const goNext = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      animateTransition(currentSlide + 1, "forward");
    }
  }, [currentSlide, animateTransition]);

  const goBack = useCallback(() => {
    if (currentSlide > 0) {
      animateTransition(currentSlide - 1, "back");
    }
  }, [currentSlide, animateTransition]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentSlide) return;
    animateTransition(index, index > currentSlide ? "forward" : "back");
  }, [currentSlide, animateTransition]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goBack]);

  const animClass =
    animState === "exit"
      ? "slide-exit"
      : animState === "enter"
        ? direction === "forward"
          ? "slide-enter"
          : "slide-enter-back"
        : "slide-active";

  const showFooter = !NO_FOOTER_SLIDES.has(currentSlide);

  return (
    <div className="relative min-h-screen" ref={containerRef}>
      {/* Top teal accent line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[var(--accent)] z-40" />

      {/* Slide content */}
      <div className={`pb-16 ${animClass}`}>
        {currentSlide === 0 && <TitleSlide data={data} />}
        {currentSlide === 1 && <PainPointsSlide data={data} />}
        {currentSlide === 2 && <WhyNewWebsiteSlide data={data} />}
        {currentSlide === 3 && <AidaStrategySlide data={data} />}
        {currentSlide === 4 && <ItemizedPricingSlide data={data} />}
        {currentSlide === 5 && <CompetitorsSlide data={data} />}
        {currentSlide === 6 && <RoiSlide data={data} />}
        {currentSlide === 7 && <TimelineSlide data={data} />}
        {currentSlide === 8 && <PricingSummarySlide data={data} />}
        {currentSlide === 9 && <NextStepsSlide data={data} />}
      </div>

      {/* Footer bar (on slides that have it) */}
      {showFooter && (
        <div className="fixed bottom-16 left-0 right-0 bg-[#111] py-2 z-30">
          <p className="text-center text-[var(--text-soft)] text-[0.65rem] tracking-widest">
            L3AD SOLUTIONS &middot; hello@l3adsolutions.com &middot; (321) 291-3409 &middot; l3adsolutions.com
          </p>
        </div>
      )}

      {/* Navigation bar */}
      <nav className="slide-nav" aria-label={`Slide ${currentSlide + 1} of ${TOTAL_SLIDES}: ${clientName}`}>
        <button
          className="slide-nav__btn"
          onClick={goBack}
          disabled={currentSlide === 0}
          aria-label="Previous slide"
        >
          <i className="bi-chevron-left" />
        </button>

        <div className="slide-nav__dots">
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <button
              key={i}
              className={`slide-nav__dot ${i === currentSlide ? "slide-nav__dot--active" : ""}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}: ${SLIDE_LABELS[i]}`}
            />
          ))}
        </div>

        <span className="slide-nav__label hidden sm:block">
          {SLIDE_LABELS[currentSlide]}
        </span>

        <button
          className="slide-nav__btn"
          onClick={goNext}
          disabled={currentSlide === TOTAL_SLIDES - 1}
          aria-label="Next slide"
        >
          <i className="bi-chevron-right" />
        </button>
      </nav>
    </div>
  );
}
