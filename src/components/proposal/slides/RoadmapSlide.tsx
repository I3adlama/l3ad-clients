import type { ProposalData } from "@/lib/types";

const PHASE_ICONS = ["bi-tools", "bi-geo-alt-fill", "bi-broadcast"];

/**
 * 90-day roadmap with KPIs. Phases stack as full-width rows down a vertical
 * rail, one per 30 days.
 * Animation: the rail draws downward and each phase node lights up as its
 * row arrives, then the KPI rows fill from baseline to target with a sliding
 * bar so the movement reads as a chart, not a table.
 */
export default function RoadmapSlide({ data }: { data: ProposalData }) {
  const rm = data.roadmap;
  if (!rm) return null;

  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">{rm.heading || "THE FIRST 90 DAYS"}</h1>
      {rm.subheading && (
        <p className="scroll-fade-up delay-1 section-subheading">{rm.subheading}</p>
      )}

      {/* Phase rows on a vertical rail */}
      <div className="roadmap-rail">
        {rm.phases.map((phase, i) => (
          <div key={i} className={`scroll-fade-up delay-${Math.min(i + 1, 5)} roadmap-row`}>
            <div className="roadmap-row__marker">
              <div className="roadmap-node__circle">
                <i className={PHASE_ICONS[i] || "bi-check-lg"} />
              </div>
              {i < rm.phases.length - 1 && <div className="roadmap-row__line" />}
            </div>

            <div className="roadmap-phase">
              <div className="roadmap-phase__head">
                <div>
                  <div className="roadmap-node__days">{phase.days}</div>
                  <div className="roadmap-phase__label">{phase.label}</div>
                </div>
                <div className="roadmap-phase__num">0{i + 1}</div>
              </div>
              <div className="roadmap-phase__goal">
                <i className="bi-bullseye" /> {phase.goal}
              </div>
              <ul className="roadmap-phase__list">
                {phase.deliverables.map((d, j) => (
                  <li key={j} style={{ animationDelay: `${0.3 + j * 0.1}s` }}>
                    <i className="bi-check-square-fill" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* KPI table */}
      {rm.kpis.length > 0 && (
        <div className="scroll-fade-up delay-3 mt-12">
          <h2 className="roi-card__title">What I measure, and what working looks like</h2>
          <div className="kpi-table">
            <div className="kpi-row kpi-row--head">
              <span>Metric</span>
              <span>Today</span>
              <span>Day 90</span>
            </div>
            {rm.kpis.map((k, i) => (
              <div key={i} className="kpi-row" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                <span className="kpi-row__metric">
                  {k.metric}
                  {k.tracked_by && <span className="kpi-row__tracked">{k.tracked_by}</span>}
                </span>
                <span className="kpi-row__baseline">{k.baseline}</span>
                <span className="kpi-row__target">
                  <span className="kpi-row__bar" aria-hidden />
                  <span className="kpi-row__target-text">{k.target}</span>
                </span>
              </div>
            ))}
          </div>
          {rm.footnote && <p className="kpi-footnote">{rm.footnote}</p>}
        </div>
      )}
    </section>
  );
}
