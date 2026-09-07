import type { ProposalData } from "@/lib/types";

/** Pull the largest dollar figure out of a string like "$35,000 to $45,000" or "$0". */
function parseMoney(s: string | undefined): number | null {
  if (!s) return null;
  const nums = s.match(/\$?\d[\d,]*/g);
  if (!nums) return null;
  const vals = nums.map((n) => parseInt(n.replace(/[$,]/g, ""), 10)).filter((n) => !isNaN(n));
  if (vals.length === 0) return null;
  return Math.max(...vals);
}

/**
 * When does this pay for itself.
 * Animation: the investment and math columns slide in from opposite sides,
 * then the projection bars grow up from the baseline one after another,
 * with the break-even line drawing across once the bars are up.
 */
export default function RoiSlide({ data }: { data: ProposalData }) {
  const projections = data.roi.projections || [];
  const cumulative = projections.map((p) => parseMoney(p.cumulative));
  const chartable = projections.length > 1 && cumulative.every((v) => v !== null);
  const maxCum = chartable ? Math.max(1, ...(cumulative as number[])) : 1;
  const monthlyCost = parseMoney(data.roi.monthly_cost);

  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">WHEN DOES THIS PAY FOR ITSELF?</h1>

      <div className="flex flex-col sm:flex-row gap-8 mb-10 mt-8">
        {/* Cost breakdown */}
        {data.roi.cost_breakdown && data.roi.cost_breakdown.length > 0 && (
          <div className="scroll-fade-up delay-1 flex-1 roi-panel roi-panel--left">
            <h2 className="roi-card__title">YOUR INVESTMENT</h2>
            <div className="space-y-1">
              {data.roi.cost_breakdown.map((item, i) => (
                <div key={i} className="roi-cost-item">
                  <span className="text-[var(--text-muted)]">{item.label}</span>
                  <span className="text-white font-bold">{item.amount}</span>
                </div>
              ))}
            </div>
            <div className="roi-total">
              <span>Monthly Total</span>
              <span className="text-[var(--accent)]">{data.roi.monthly_cost}</span>
            </div>
          </div>
        )}

        {/* Revenue model */}
        {data.roi.revenue_model && data.roi.revenue_model.length > 0 && (
          <div className="scroll-fade-up delay-2 flex-1 roi-panel roi-panel--right">
            <h2 className="roi-card__title">THE MATH</h2>
            <div className="space-y-1">
              {data.roi.revenue_model.map((item, i) => (
                <div key={i} className="roi-cost-item">
                  <span className="text-[var(--text-muted)]">{item.label}</span>
                  <span className="text-[var(--accent)] font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projected growth */}
      {projections.length > 0 && (
        <div className="scroll-fade-up delay-2">
          <h2 className="roi-card__title">CONSERVATIVE GROWTH PROJECTIONS</h2>

          {chartable ? (
            <div className="roi-chart">
              <div className="roi-chart__bars">
                {projections.map((p, i) => {
                  const cum = cumulative[i] as number;
                  const heightPct = Math.max(4, Math.round((cum / maxCum) * 100));
                  const paid = monthlyCost !== null && cum >= monthlyCost * (i + 1);
                  return (
                    <div key={i} className="roi-bar">
                      <div className="roi-bar__value">{p.cumulative}</div>
                      <div className="roi-bar__track">
                        <div
                          className={`roi-bar__fill ${paid ? "roi-bar__fill--paid" : ""}`}
                          style={{ height: `${heightPct}%`, animationDelay: `${0.2 + i * 0.15}s` }}
                        />
                      </div>
                      <div className="roi-bar__month">{p.month}</div>
                      {(p.orders || p.clients) && (
                        <div className="roi-bar__meta">{p.orders || p.clients}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="roi-chart__legend">
                <span><i className="roi-legend-swatch" /> Cumulative revenue attributed to this work</span>
                <span><i className="roi-legend-swatch roi-legend-swatch--paid" /> Ahead of what you&apos;ve paid so far</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {projections.map((p, i) => (
                <div key={i} className="roi-projection-card">
                  <div className="roi-projection-card__month">{p.month}</div>
                  {(p.orders || p.clients) && (
                    <div className="roi-projection-card__row">
                      <span>{p.orders ? "New Orders" : "New Clients"}</span>
                      <span className="text-white font-bold">{p.orders || p.clients}</span>
                    </div>
                  )}
                  <div className="roi-projection-card__row">
                    <span>Revenue</span>
                    <span className="text-white font-bold">{p.revenue}</span>
                  </div>
                  <div className="roi-projection-card__row">
                    <span>Cumulative</span>
                    <span className="text-[var(--accent)] font-bold">{p.cumulative}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="roi-total mt-6">
            <span>12-Month Projected Revenue</span>
            <span className="text-[var(--accent)]">{data.roi.annual_revenue}</span>
          </div>
          <div className="roi-cost-item mt-1">
            <span className="text-[var(--text-muted)]">Estimated Return on Investment</span>
            <span className="text-[var(--accent)] font-bold">{data.roi.roi_percentage}</span>
          </div>
        </div>
      )}

      {/* Payoff callout */}
      {data.roi.callout && (
        <div className="scroll-fade-up delay-3 roi-callout">
          <i className="bi-lightning-charge-fill roi-callout__icon" />
          <div className="roi-callout__text">
            {data.roi.callout.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
