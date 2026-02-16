import type { ProposalData } from "@/lib/types";

export default function CompetitorsSlide({ data }: { data: ProposalData }) {
  return (
    <div className="proposal-slide">
      <h2 className="slide-heading">YOUR COMPETITORS ARE ALREADY DOING THIS</h2>

      <div className="max-w-4xl">
        {/* Competitor table */}
        <div className="overflow-x-auto">
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
                  <td>{entry.name}</td>
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
        <div className="advantage-callout">
          <div className="advantage-callout__title">YOUR UNFAIR ADVANTAGE</div>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            {data.competitors.unfair_advantage}
          </p>
        </div>
      </div>
    </div>
  );
}
