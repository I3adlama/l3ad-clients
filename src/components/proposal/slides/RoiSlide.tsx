import type { ProposalData } from "@/lib/types";

export default function RoiSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">WHEN DOES THIS PAY FOR ITSELF?</h1>

      <div className="scroll-fade-up delay-1 flex flex-col sm:flex-row gap-8 mb-6 mt-8">
        {/* Cost breakdown */}
        {data.roi.cost_breakdown && data.roi.cost_breakdown.length > 0 && (
          <div className="flex-1">
            <h2 className="roi-card__title">YOUR INVESTMENT:</h2>
            <div className="space-y-1">
              {data.roi.cost_breakdown.map((item, i) => (
                <div key={i} className="roi-cost-item">
                  <span className="text-[var(--text-muted)]">{item.label}</span>
                  <span className="text-white font-bold">{item.amount}</span>
                </div>
              ))}
            </div>
            <div className="roi-total">
              <span>Monthly Total:</span>
              <span className="text-[var(--accent)]">{data.roi.monthly_cost}</span>
            </div>
          </div>
        )}

        {/* Revenue model */}
        {data.roi.revenue_model && data.roi.revenue_model.length > 0 && (
          <div className="flex-1">
            <h2 className="roi-card__title">THE MATH:</h2>
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
      {data.roi.projections && data.roi.projections.length > 0 && (
        <div className="scroll-fade-up delay-2">
          <h2 className="roi-card__title">CONSERVATIVE GROWTH PROJECTIONS:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {data.roi.projections.map((p, i) => (
              <div key={i} className="roi-projection-card">
                <div className="roi-projection-card__month">{p.month}</div>
                <div className="space-y-1">
                  {(p.orders || p.clients) && (
                    <div className="roi-cost-item">
                      <span className="text-[var(--text-muted)]">{p.orders ? "New Orders" : "New Clients"}</span>
                      <span className="text-white font-bold">{p.orders || p.clients}</span>
                    </div>
                  )}
                  <div className="roi-cost-item">
                    <span className="text-[var(--text-muted)]">Revenue</span>
                    <span className={i > 0 ? "text-[var(--accent)] font-bold" : "text-white font-bold"}>
                      {p.revenue}
                    </span>
                  </div>
                  <div className="roi-cost-item">
                    <span className="text-[var(--text-muted)]">Cumulative</span>
                    <span className={i <= 1 ? "text-[#f59e0b] font-bold" : "text-[var(--accent)] font-bold"}>
                      {p.cumulative}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="roi-total mt-4">
            <span>12-Month Projected Revenue:</span>
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
