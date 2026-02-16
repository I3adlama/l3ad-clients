import type { ProposalData } from "@/lib/types";

export default function RoiSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">WHEN DOES THIS PAY FOR ITSELF?</h1>

      <div className="scroll-fade-up delay-1 flex flex-col sm:flex-row gap-8 mb-6 mt-8">
        {/* Cost breakdown */}
        <div className="flex-1">
          <h2 className="font-body text-sm tracking-widest text-white font-bold mb-4 uppercase">
            YOUR UPFRONT INVESTMENT:
          </h2>
          <div className="space-y-1">
            <div className="roi-cost-item">
              <span className="text-[var(--text-muted)]">Website Redesign & Build</span>
              <span className="text-white font-bold">$500</span>
            </div>
            <div className="roi-cost-item">
              <span className="text-[var(--text-muted)]">ezCater Menu Integration</span>
              <span className="text-white font-bold">$100</span>
            </div>
            <div className="roi-cost-item">
              <span className="text-[var(--text-muted)]">Month 1 SEO</span>
              <span className="text-white font-bold">$250</span>
            </div>
            <div className="roi-cost-item">
              <span className="text-[var(--text-muted)]">Month 1 GBP Pro</span>
              <span className="text-white font-bold">$100</span>
            </div>
          </div>
          <div className="roi-total">
            <span>Total Month 1:</span>
            <span className="text-[var(--accent)]">$950</span>
          </div>
        </div>

        {/* Menu math */}
        <div className="flex-1">
          <h2 className="font-body text-sm tracking-widest text-white font-bold mb-4 uppercase">
            THE MATH (EZCATER MENU):
          </h2>
          <div className="space-y-1">
            <div className="roi-cost-item">
              <span className="text-[var(--text-muted)]">Chicken Curry (serves 10)</span>
              <span className="text-[var(--text-muted)]">$195</span>
            </div>
            <div className="roi-cost-item">
              <span className="text-[var(--text-muted)]">Beef Curry (serves 10)</span>
              <span className="text-[var(--text-muted)]">$220</span>
            </div>
            <div className="roi-cost-item">
              <span className="text-[var(--text-muted)]">Pork Curry (serves 10)</span>
              <span className="text-[var(--text-muted)]">$210</span>
            </div>
            <div className="roi-cost-item">
              <span className="text-[var(--accent)] font-bold">Avg order value: ~$200+</span>
              <span />
            </div>
          </div>
        </div>
      </div>

      {/* ROI projection table */}
      {data.roi.projections && (
        <div className="scroll-fade-up delay-2 overflow-x-auto">
          <table className="roi-table">
            <thead>
              <tr>
                <th />
                {data.roi.projections.map((p, i) => (
                  <th key={i}>{p.month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Your Cost</td>
                <td>$950</td>
                <td>$1,650</td>
                <td>$2,700</td>
                <td>$4,800</td>
              </tr>
              <tr>
                <td>New Orders</td>
                <td>1-2</td>
                <td>3-5/mo</td>
                <td>5-8/mo</td>
                <td>8-12/mo</td>
              </tr>
              <tr>
                <td>New Revenue</td>
                {data.roi.projections.map((p, i) => (
                  <td key={i} className={i > 0 ? "positive" : ""}>
                    {p.revenue}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Cumulative Profit</td>
                {data.roi.projections.map((p, i) => (
                  <td key={i} className={i === 0 ? "warning" : "positive"}>
                    {p.cumulative}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Orange payoff callout */}
      <div className="scroll-fade-up delay-3 roi-callout">
        2 extra catering orders covers your entire monthly investment ($350/mo).
        By Month 6, SEO compounds — organic traffic you don&apos;t pay for, bringing leads 24/7.
      </div>
    </section>
  );
}
