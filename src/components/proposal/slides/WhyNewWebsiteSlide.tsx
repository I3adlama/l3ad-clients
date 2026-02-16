import type { ProposalData } from "@/lib/types";

export default function WhyNewWebsiteSlide({ data }: { data: ProposalData }) {
  return (
    <div className="proposal-slide">
      <h2 className="slide-heading">WHY YOU NEED A NEW WEBSITE</h2>
      <p className="slide-subheading">
        Your current site is holding you back. Here&apos;s what a professional rebuild delivers:
      </p>

      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
        {/* Before column */}
        <div className="comparison-col comparison-col--before bg-[var(--bg-elevated)]">
          <div className="comparison-col__header text-[#ef4444]">CURRENT SITE</div>
          {data.why_new_website.before.map((item, i) => (
            <div key={i} className="comparison-item">
              <i className="bi-x-lg text-[#ef4444] text-xs mt-0.5 flex-shrink-0" />
              <span className="text-[#ef4444]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Arrow between columns */}
        <div className="hidden sm:flex items-center">
          <i className="bi-arrow-right text-[var(--accent)] text-2xl" />
        </div>
        <div className="flex sm:hidden justify-center">
          <i className="bi-arrow-down text-[var(--accent)] text-2xl" />
        </div>

        {/* After column */}
        <div className="comparison-col comparison-col--after bg-[var(--bg-elevated)]">
          <div className="comparison-col__header text-[var(--accent)]">NEW SITE WE BUILD</div>
          {data.why_new_website.after.map((item, i) => (
            <div key={i} className="comparison-item">
              <i className="bi-check-circle-fill text-[var(--accent)] text-xs mt-0.5 flex-shrink-0" />
              <span className="text-[var(--accent)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
