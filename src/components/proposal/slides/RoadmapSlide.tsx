import type { ProposalData } from "@/lib/types";

const PHASE_ICONS = ["bi-tools", "bi-geo-alt-fill", "bi-broadcast"];

/**
 * 90-day roadmap with KPIs.
 * Animation: a progress track draws across the three phases and each node
 * lights up in sequence, then the KPI rows fill from baseline to target with
 * a sliding bar so the movement reads as a chart, not a table.
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

      {/* Phase track */}
      <div className="scroll-fade-up delay-1 roadmap-track">
        <div className="roadmap-track__line" />
        <div className="roadmap-track__line roadmap-track__line--fill" />
        <div className="roadmap-track__nodes">
          {rm.phases.map((phase, i) => (
            <div key={i} className="roadmap-node" style={{ animationDelay: `${0.3 + i * 0.5}s` }}>
              <div className="roadmap-node__circle">
                <i className={PHASE_ICONS[i] || "bi-check-lg"} />
              </div>
              <div className="roadmap-node__days">{phase.days}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      <div className="roadmap-phases">
        {rm.phases.map((phase, i) => (
          <div key={i} className={`scroll-fade-up delay-${Math.min(i + 2, 5)} roadmap-phase`}>
            <div className="roadmap-phase__num">0{i + 1}</div>
            <div className="roadmap-phase__label">{phase.label}</div>
            <div className="roadmap-phase__goal">
              <i className="bi-bullseye" /> {phase.goal}
            </div>
            <ul className="roadmap-phase__list">
              {phase.deliverables.map((d, j) => (
                <li key={j} style={{ animationDelay: `${0.4 + i * 0.25 + j * 0.12}s` }}>
                  <i className="bi-check-square-fill" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
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
