import type { ProposalData } from "@/lib/types";

const SECTION_STYLES: Record<string, { barClass: string }> = {
  "ONE-TIME SETUP": { barClass: "pricing-bar--teal" },
  "MONTHLY SEO": { barClass: "pricing-bar--pink" },
  "GBP PRO MANAGEMENT": { barClass: "pricing-bar--outlined" },
};

const BAR_CYCLE = ["pricing-bar--teal", "pricing-bar--pink", "pricing-bar--outlined", "pricing-bar--orange"];

/**
 * Itemized pricing.
 * Animation: each category bar wipes in from the left, then its line items
 * slide in one after another with the price ticking into place on the right.
 */
export default function ItemizedPricingSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">WHAT YOU GET, ITEMIZED</h1>
      <p className="scroll-fade-up delay-1 section-subheading">
        Every line is something I build, run, or report on. Nothing padded.
      </p>

      <div className="space-y-6 mt-2">
        {data.itemized_pricing.sections.map((section, i) => {
          const style = SECTION_STYLES[section.category];
          const isOptional = section.category.toLowerCase().includes("optional");
          const barClass = isOptional
            ? "pricing-bar--orange"
            : style?.barClass || BAR_CYCLE[i % BAR_CYCLE.length];

          return (
            <div key={i} className={`scroll-fade-up delay-${Math.min(i + 1, 5)} pricing-group`}>
              <div className={`pricing-bar ${barClass}`}>
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
                  style={{ animationDelay: `${0.25 + j * 0.12}s` }}
                >
                  <span className="pricing-item__text">
                    <span className="flex items-start gap-2">
                      {!item.price && <span className="text-[var(--text-soft)]">&middot;</span>}
                      {item.name}
                    </span>
                    {item.price && item.description && (
                      <span className="pricing-item__desc">{item.description}</span>
                    )}
                  </span>
                  {item.price && (
                    <span className="pricing-item__price">
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
