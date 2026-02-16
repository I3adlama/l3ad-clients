"use client";

import { useEffect, useRef } from "react";
import type { ProposalData } from "@/lib/types";
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

interface ProposalViewerProps {
  data: ProposalData;
  clientName: string;
}

export default function ProposalViewer({ data }: ProposalViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered animations via IntersectionObserver
  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll(".scroll-fade-up");
    if (!elements) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {/* Top teal accent line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[var(--accent)] z-40" />

      <TitleSlide data={data} />
      <PainPointsSlide data={data} />
      <WhyNewWebsiteSlide data={data} />
      <AidaStrategySlide data={data} />
      <ItemizedPricingSlide data={data} />
      <CompetitorsSlide data={data} />
      <RoiSlide data={data} />
      <TimelineSlide data={data} />
      <PricingSummarySlide data={data} />
      <NextStepsSlide data={data} />

      {/* Footer */}
      <footer className="proposal-footer">
        <p className="proposal-footer__text">
          L3AD SOLUTIONS
        </p>
        <p className="proposal-footer__text">
          hello@l3adsolutions.com &middot; (321) 291-3409 &middot; l3adsolutions.com
        </p>
      </footer>
    </div>
  );
}
