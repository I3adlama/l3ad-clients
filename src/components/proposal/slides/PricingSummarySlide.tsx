import type { ProposalData } from "@/lib/types";

export default function PricingSummarySlide({ data }: { data: ProposalData }) {
  const packages = data.pricing_summary.packages;

  return (
    <section className="proposal-section">
      <div className="scroll-fade-up">
        <h1 className="section-heading">SIMPLE PRICING, NO SURPRISES</h1>
      </div>

      {/* Pricing table */}
      <div className="scroll-fade-up delay-1 mt-8 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left font-ui text-xs tracking-widest text-[var(--text-soft)] uppercase pb-3 pr-4">
                Package
              </th>
              {packages.map((pkg, i) => (
                <th
                  key={i}
                  className={`text-center font-ui text-xs tracking-widest uppercase pb-3 px-4 ${
                    pkg.highlighted
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-soft)]"
                  }`}
                >
                  {pkg.highlighted && (
                    <span className="block text-[10px] text-[var(--accent)] mb-1 tracking-[0.2em]">
                      RECOMMENDED
                    </span>
                  )}
                  {pkg.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Standard price row */}
            {packages.some((p) => p.original_price) && (
              <tr className="border-t border-[var(--text-soft)]/10">
                <td className="py-3 pr-4 text-sm text-[var(--text-muted)] font-body">
                  Standard Rate
                </td>
                {packages.map((pkg, i) => (
                  <td
                    key={i}
                    className="py-3 px-4 text-center text-sm text-[var(--text-soft)] line-through font-body"
                  >
                    {pkg.original_price || "-"}
                  </td>
                ))}
              </tr>
            )}

            {/* Your price row */}
            <tr className="border-t border-[var(--text-soft)]/10">
              <td className="py-3 pr-4 text-sm text-white font-body font-bold">
                Your Price
              </td>
              {packages.map((pkg, i) => (
                <td
                  key={i}
                  className={`py-3 px-4 text-center font-display text-lg ${
                    pkg.highlighted ? "text-[var(--accent)]" : "text-white"
                  }`}
                >
                  {pkg.price}
                  {pkg.frequency && (
                    <span className="text-xs text-[var(--text-muted)] font-body ml-1">
                      {pkg.frequency === "one-time" ? "" : pkg.frequency}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Savings row */}
            {packages.some((p) => p.savings) && (
              <tr className="border-t border-[var(--text-soft)]/10">
                <td className="py-3 pr-4 text-sm text-[var(--text-muted)] font-body">
                  You Save
                </td>
                {packages.map((pkg, i) => (
                  <td
                    key={i}
                    className="py-3 px-4 text-center text-sm text-[#10b981] font-bold font-body"
                  >
                    {pkg.savings || "-"}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Personal note */}
      {data.pricing_summary.personal_note && (
        <div className="scroll-fade-up delay-3 personal-note mt-8">
          {data.pricing_summary.personal_note.split("\n\n").map((paragraph, i) => (
            <p key={i} className="personal-note__text">
              {paragraph}
            </p>
          ))}
          <p className="personal-note__author">
            &mdash; Nathaniel, L3ad Solutions LLC
          </p>
        </div>
      )}
    </section>
  );
}
