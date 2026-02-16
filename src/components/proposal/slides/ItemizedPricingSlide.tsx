import type { ProposalData } from "@/lib/types";

const SECTION_STYLES: Record<string, { barClass: string }> = {
  "ONE-TIME SETUP": { barClass: "pricing-bar--teal" },
  "MONTHLY SEO": { barClass: "pricing-bar--pink" },
  "GBP PRO MANAGEMENT": { barClass: "pricing-bar--outlined" },
};

export default function ItemizedPricingSlide({ data }: { data: ProposalData }) {
  return (
    <div className="proposal-slide">
      <h2 className="slide-heading">WHAT YOU GET — ITEMIZED</h2>

      <div className="max-w-4xl space-y-4">
        {data.itemized_pricing.sections.map((section, i) => {
          const style = SECTION_STYLES[section.category];
          const isOptional = section.category.toLowerCase().includes("optional");

          return (
            <div key={i}>
              {/* Section header bar */}
              <div className={`pricing-bar ${isOptional ? "pricing-bar--orange" : style?.barClass || "pricing-bar--teal"}`}>
                <span>{section.category}</span>
                {section.subtotal && <span className="text-base font-display">{section.subtotal}</span>}
              </div>

              {/* Items */}
              {!isOptional && section.items.map((item, j) => (
                <div
                  key={j}
                  className={`pricing-item ${item.price ? "pricing-item--main" : "pricing-item--sub"}`}
                >
                  <span className="flex items-start gap-2">
                    {!item.price && <span className="text-[var(--text-soft)]">—</span>}
                    {item.name}
                  </span>
                  {item.price && (
                    <span className="text-[var(--accent)] font-bold flex-shrink-0 ml-2">
                      {item.price}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
