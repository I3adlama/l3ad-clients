import type { ProposalData } from "@/lib/types";

export default function CompetitorsSlide({ data }: { data: ProposalData }) {
  const competitors = data.competitors.entries.filter((e) => e.notes !== "client");
  const client = data.competitors.entries.find((e) => e.notes === "client");

  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">
        YOUR COMPETITORS ARE ALREADY DOING THIS
      </h1>
      <p className="scroll-fade-up delay-1 section-subheading">
        Here&apos;s how you stack up against the competition in your market.
      </p>

      {/* Competitor cards */}
      <div className="scroll-fade-up delay-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {competitors.map((entry, i) => (
          <div key={i} className="comp-card">
            <div className="comp-card__name">{entry.name}</div>
            <div className="comp-card__metric">
              <span className="comp-card__metric-label">Keywords</span>
              <span className={`comp-card__metric-value ${i === 0 ? "text-[var(--accent)]" : ""}`}>
                {entry.website_score}
              </span>
            </div>
            <div className="comp-card__metric">
              <span className="comp-card__metric-label">Traffic</span>
              <span className="comp-card__metric-value">{entry.seo_score}</span>
            </div>
            <div className="comp-card__metric">
              <span className="comp-card__metric-label">Backlinks</span>
              <span className="comp-card__metric-value">{entry.reviews}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Client card — highlighted */}
      {client && (
        <div className="scroll-fade-up delay-3 comp-card comp-card--client mt-4">
          <div className="comp-card__name">{client.name.replace(" (You)", "")}</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="comp-card__metric-label text-sm mb-1">Keywords</div>
              <div className="comp-card__metric-value text-lg">{client.website_score}</div>
            </div>
            <div className="text-center">
              <div className="comp-card__metric-label text-sm mb-1">Traffic</div>
              <div className="comp-card__metric-value text-lg">{client.seo_score}</div>
            </div>
            <div className="text-center">
              <div className="comp-card__metric-label text-sm mb-1">Backlinks</div>
              <div className="comp-card__metric-value text-lg">{client.reviews}</div>
            </div>
          </div>
        </div>
      )}

      {/* Unfair advantage callout */}
      <div className="scroll-fade-up delay-4 advantage-callout mt-8">
        <div className="advantage-callout__title">YOUR UNFAIR ADVANTAGE</div>
        <p className="font-body text-base text-[var(--text-muted)] leading-relaxed">
          {data.competitors.unfair_advantage}
        </p>
      </div>
    </section>
  );
}
