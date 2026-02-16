import type { ProposalData } from "@/lib/types";

export default function CompetitorsSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">
        YOUR COMPETITORS ARE ALREADY DOING THIS
      </h1>
      <p className="scroll-fade-up delay-1 section-subheading">
        Here&apos;s how you stack up against the competition in your market.
      </p>

      {/* Competitor table */}
      <div className="scroll-fade-up delay-2 overflow-x-auto">
        <table className="comp-table">
          <thead>
            <tr>
              <th>Caterer</th>
              <th>Keywords</th>
              <th>Traffic</th>
              <th>Backlinks</th>
            </tr>
          </thead>
          <tbody>
            {data.competitors.entries.map((entry, i) => (
              <tr
                key={i}
                className={entry.notes === "client" ? "comp-table__client" : ""}
              >
                <td>{entry.notes === "client" ? entry.name.replace(" (You)", "") : entry.name}</td>
                <td className={entry.notes !== "client" && i === 0 ? "text-[var(--accent)] font-bold" : ""}>
                  {entry.website_score}
                </td>
                <td>{entry.seo_score}</td>
                <td>{entry.reviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unfair advantage callout */}
      <div className="scroll-fade-up delay-3 advantage-callout mt-8">
        <div className="advantage-callout__title">YOUR UNFAIR ADVANTAGE</div>
        <p className="font-body text-base text-[var(--text-muted)] leading-relaxed">
          {data.competitors.unfair_advantage}
        </p>
      </div>
    </section>
  );
}
