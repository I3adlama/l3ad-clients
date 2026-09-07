import type { ProposalData } from "@/lib/types";

type Entry = ProposalData["competitors"]["entries"][number];

function metricsFor(entry: Entry): { label: string; value: string }[] {
  if (entry.metrics && entry.metrics.length > 0) return entry.metrics;
  return [
    { label: "Keywords", value: entry.website_score || "-" },
    { label: "Traffic", value: entry.seo_score || "-" },
    { label: "Backlinks", value: entry.reviews || "-" },
  ];
}

/**
 * Competitors.
 * Animation: competitor cards deal in one after another with a slight tilt
 * that settles flat, then the client card slides up and a scan line runs
 * across it so the eye lands on your numbers last.
 */
export default function CompetitorsSlide({ data }: { data: ProposalData }) {
  const competitors = data.competitors.entries.filter((e) => e.notes !== "client");
  const client = data.competitors.entries.find((e) => e.notes === "client");

  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">
        YOUR COMPETITORS ARE ALREADY DOING THIS
      </h1>
      <p className="scroll-fade-up delay-1 section-subheading">
        Here&apos;s how you stack up against the companies showing up for your buyers&apos; searches.
      </p>

      {/* Competitor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {competitors.map((entry, i) => (
          <div
            key={i}
            className={`scroll-fade-up delay-${Math.min(i + 1, 5)} comp-card comp-card--deal`}
          >
            <div className="comp-card__name">{entry.name}</div>
            {metricsFor(entry).map((m, j) => (
              <div key={j} className="comp-card__metric">
                <span className="comp-card__metric-label">{m.label}</span>
                <span className={`comp-card__metric-value ${j === 0 ? "text-[var(--accent)]" : ""}`}>
                  {m.value}
                </span>
              </div>
            ))}
            {entry.metrics && entry.notes && (
              <p className="comp-card__note">{entry.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Client card, highlighted */}
      {client && (
        <div className="scroll-fade-up delay-4 comp-card comp-card--client mt-4">
          <div className="comp-card__scan" aria-hidden />
          <div className="comp-card__name">{client.name.replace(" (You)", "")}</div>
          <div className={`grid gap-4 ${metricsFor(client).length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
            {metricsFor(client).map((m, j) => (
              <div key={j} className="text-center">
                <div className="comp-card__metric-label text-sm mb-1">{m.label}</div>
                <div className="comp-card__metric-value text-lg mx-auto">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unfair advantage callout */}
      <div className="scroll-fade-up delay-5 advantage-callout mt-8">
        <div className="advantage-callout__title">YOUR UNFAIR ADVANTAGE</div>
        <div className="font-body text-base text-[var(--text-muted)] leading-relaxed space-y-3">
          {data.competitors.unfair_advantage.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
