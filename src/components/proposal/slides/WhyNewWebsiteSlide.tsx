import type { ProposalData } from "@/lib/types";

export default function WhyNewWebsiteSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">WHY YOU NEED A NEW WEBSITE</h1>
      <p className="scroll-fade-up delay-1 section-subheading">
        Your current site is holding you back. Here&apos;s what a professional rebuild delivers:
      </p>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Before column */}
        <div className="scroll-fade-up delay-2 comparison-col comparison-col--before bg-[var(--bg-elevated)]">
          <div className="comparison-col__header text-[#ef4444]">CURRENT SITE</div>
          {data.why_new_website.before.map((item, i) => (
            <div key={i} className="comparison-item">
              <i className="bi-x-lg text-[#ef4444] text-sm mt-1 flex-shrink-0" />
              <span className="text-[#ef4444]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Arrow between columns */}
        <div className="hidden lg:flex items-center">
          <i className="bi-arrow-right text-[var(--accent)] text-3xl" />
        </div>
        <div className="flex lg:hidden justify-center">
          <i className="bi-arrow-down text-[var(--accent)] text-3xl" />
        </div>

        {/* After column */}
        <div className="scroll-fade-up delay-3 comparison-col comparison-col--after bg-[var(--bg-elevated)]">
          <div className="comparison-col__header text-[var(--accent)]">NEW SITE WE BUILD</div>
          {data.why_new_website.after.map((item, i) => (
            <div key={i} className="comparison-item">
              <i className="bi-check-circle-fill text-[var(--accent)] text-sm mt-1 flex-shrink-0" />
              <span className="text-[var(--accent)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
