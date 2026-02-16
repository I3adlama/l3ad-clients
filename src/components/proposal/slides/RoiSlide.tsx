import type { ProposalData } from "@/lib/types";

export default function RoiSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">WHEN DOES THIS PAY FOR ITSELF?</h1>

      <div className="scroll-fade-up delay-1 flex flex-col sm:flex-row gap-8 mb-6 mt-8">
        {/* Cost breakdown */}
        <div className="flex-1">
          <h2 className="roi-card__title">YOUR UPFRONT INVESTMENT:</h2>
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
          <h2 className="roi-card__title">THE MATH (AT ~{data.roi.revenue_per_customer}/ORDER):</h2>
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
              <span className="text-[var(--accent)] font-bold">Avg order value: ~{data.roi.revenue_per_customer}+</span>
              <span />
            </div>
          </div>
        </div>
      </div>

      {/* Projected growth — card format */}
      {data.roi.projections && (
        <div className="scroll-fade-up delay-2">
          <h2 className="roi-card__title">CONSERVATIVE GROWTH PROJECTIONS:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {data.roi.projections.map((p, i) => (
              <div key={i} className="roi-projection-card">
                <div className="roi-projection-card__month">{p.month}</div>
                <div className="space-y-1">
                  <div className="roi-cost-item">
                    <span className="text-[var(--text-muted)]">New Orders</span>
                    <span className="text-white font-bold">{p.orders}</span>
                  </div>
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
      <div className="scroll-fade-up delay-3 roi-callout">
        <i className="bi-lightning-charge-fill roi-callout__icon" />
        <div className="roi-callout__text">
          <p>Just 2 extra catering orders per month covers your entire monthly investment of {data.roi.monthly_cost}.</p>
          <p>By Month 6, SEO begins to compound — driving free organic traffic and inbound leads around the clock.</p>
          <p>By Month 12, you&apos;re projected at 8-10 new orders/mo — {data.roi.annual_revenue} in annual revenue.</p>
        </div>
      </div>
    </section>
  );
}
