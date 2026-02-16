import type { ProposalData } from "@/lib/types";

export default function PricingSummarySlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <div className="scroll-fade-up">
        <h1 className="section-heading">SIMPLE PRICING, NO SURPRISES</h1>
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

      {/* Founder's Rate badge */}
      <div className="scroll-fade-up delay-2 mt-5 text-center">
        <span className="founders-badge">
          FOUNDER&apos;S RATE — SAVE $840+/MO VS. STANDARD PRICING
        </span>
      </div>

      {/* Optional add-on */}
      <div className="scroll-fade-up delay-3 optional-addon">
        <div>
          <div className="optional-addon__label">OPTIONAL ADD-ON</div>
          <p className="font-body text-sm text-[var(--text-muted)] mt-1">
            Social Media Management — scheduled posting, content calendar, cross-platform strategy
          </p>
        </div>
        <div className="optional-addon__pricing">
          <span className="optional-addon__original">$397/mo</span>
          <span className="optional-addon__price">$150/mo</span>
          <span className="optional-addon__savings">SAVE $247/mo</span>
        </div>
      </div>

      {/* Personal note */}
      {data.pricing_summary.personal_note && (
        <div className="scroll-fade-up delay-4 personal-note">
          {data.pricing_summary.personal_note.split("\n\n").map((paragraph, i) => (
            <p key={i} className="personal-note__text">
              {paragraph}
            </p>
          ))}
          <p className="personal-note__author">— Nathaniel, L3ad Solutions LLC</p>
        </div>
      )}
    </section>
  );
}
