import type { ProposalData } from "@/lib/types";

const SECTION_STYLES: Record<string, { barClass: string }> = {
  "ONE-TIME SETUP": { barClass: "pricing-bar--teal" },
  "MONTHLY SEO": { barClass: "pricing-bar--pink" },
  "GBP PRO MANAGEMENT": { barClass: "pricing-bar--outlined" },
};

export default function ItemizedPricingSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">WHAT YOU GET — ITEMIZED</h1>

      <div className="space-y-5 mt-8">
        {data.itemized_pricing.sections.map((section, i) => {
          const style = SECTION_STYLES[section.category];
          const isOptional = section.category.toLowerCase().includes("optional");

          return (
            <div key={i} className={`scroll-fade-up delay-${Math.min(i + 1, 5)}`}>
              <div className={`pricing-bar ${isOptional ? "pricing-bar--orange" : style?.barClass || "pricing-bar--teal"}`}>
                <span>{section.category}</span>
                {section.subtotal && <span className="text-lg font-display">{section.subtotal}</span>}
              </div>

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
                    <span className="text-[var(--accent)] font-bold flex-shrink-0 ml-3">
                      {item.price}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
