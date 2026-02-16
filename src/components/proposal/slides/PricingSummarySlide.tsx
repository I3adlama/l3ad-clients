import type { ProposalData } from "@/lib/types";

export default function PricingSummarySlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <div className="scroll-fade-up">
        <h1 className="section-heading">SIMPLE PRICING, NO SURPRISES</h1>
        <span className="founders-badge mt-2 inline-block">
          FOUNDER&apos;S RATE — SAVE $840+/MO VS. STANDARD PRICING
        </span>
      </div>

      {/* Price boxes */}
      <div className="scroll-fade-up delay-1 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {data.pricing_summary.packages.map((pkg, i) => (
          <div key={i} className="price-box">
            <div className="price-box__label">{pkg.label}</div>
            {pkg.original_price && (
              <div className="price-box__original">{pkg.original_price}</div>
            )}
            <div className="price-box__price">{pkg.price}</div>
            {pkg.frequency && (
              <div className="price-box__freq">
                {pkg.frequency === "one-time" ? "ONE-TIME" : "PER MONTH"}
              </div>
            )}
            {pkg.savings && (
              <div className="price-box__savings">{pkg.savings}</div>
            )}
          </div>
        ))}
      </div>

      {/* Optional add-on */}
      <div className="scroll-fade-up delay-2 pricing-bar pricing-bar--orange mt-5 text-sm">
        OPTIONAL: Social Media Management $397/mo → $150/mo (save $247/mo)
      </div>

      {/* Personal note */}
      {data.pricing_summary.personal_note && (
        <div className="scroll-fade-up delay-3 personal-note">
          <p className="personal-note__text">
            {data.pricing_summary.personal_note}
          </p>
          <p className="personal-note__author">— Nathaniel, L3ad Solutions LLC</p>
        </div>
      )}
    </section>
  );
}
