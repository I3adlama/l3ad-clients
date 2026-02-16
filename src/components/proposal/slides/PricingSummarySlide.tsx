import type { ProposalData } from "@/lib/types";

export default function PricingSummarySlide({ data }: { data: ProposalData }) {
  return (
    <div className="proposal-slide">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="slide-heading mb-0">SIMPLE PRICING, NO SURPRISES</h2>
        <span className="founders-badge">
          FOUNDER&apos;S RATE — SAVE $840+/MO VS. STANDARD PRICING
        </span>
      </div>

      <div className="max-w-4xl">
        {/* Price boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {data.pricing_summary.packages.map((pkg, i) => (
            <div key={i} className="price-box">
              <div className="price-box__label">{pkg.label}</div>
              {pkg.original_price && (
                <div className="price-box__original">{pkg.original_price}</div>
              )}
              <div className="price-box__price">{pkg.price}</div>
              {pkg.frequency && (
                <div className="price-box__freq">
                  {pkg.frequency === "one-time" ? "ONE-TIME" : `PER MONTH`}
                </div>
              )}
              {pkg.savings && (
                <div className="price-box__savings">{pkg.savings}</div>
              )}
            </div>
          ))}
        </div>

        {/* Optional add-on */}
        <div className="pricing-bar pricing-bar--orange mt-4 text-sm">
          OPTIONAL: Social Media Management $397/mo → $150/mo (save $247/mo)
        </div>

        {/* Personal note */}
        {data.pricing_summary.personal_note && (
          <div className="personal-note">
            <p className="personal-note__text">
              {data.pricing_summary.personal_note}
            </p>
            <p className="personal-note__author">— Nathaniel, L3ad Solutions LLC</p>
          </div>
        )}
      </div>

      {/* Bottom teal accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]" />
    </div>
  );
}
