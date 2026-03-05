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
                <span>
                  {(() => {
                    const colonIdx = section.category.indexOf(": ");
                    const parenIdx = section.category.indexOf("(");
                    const splitIdx = colonIdx > 0 ? colonIdx : parenIdx;
                    if (splitIdx > 0) {
                      const main = section.category.slice(0, colonIdx > 0 ? colonIdx + 1 : splitIdx).trim();
                      const sub = section.category.slice(colonIdx > 0 ? colonIdx + 2 : splitIdx).trim();
                      return (
                        <>
                          {main}
                          <span className="pricing-bar__sub">{sub}</span>
                        </>
                      );
                    }
                    return section.category;
                  })()}
                </span>
                {!isOptional && section.subtotal && <span className="pricing-bar__total">{section.subtotal}</span>}
              </div>
              {isOptional && section.subtotal && (
                <div className="pricing-item--optional-note">
                  {section.subtotal}
                </div>
              )}

              {section.items.map((item, j) => (
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
