import type { ProposalData } from "@/lib/types";

const PHASE_ICONS = ["bi-rocket-takeoff", "bi-graph-up-arrow", "bi-cash-stack", "bi-people-fill"];

export default function TimelineSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading text-center">WHAT HAPPENS &amp; WHEN</h1>

      <div className="max-w-2xl mx-auto mt-8">
        {data.timeline.phases.map((phase, i) => (
          <div key={i} className={`scroll-fade-up delay-${Math.min(i + 1, 4)} timeline-phase`}>
            {/* Marker */}
            <div className="timeline-phase__marker">
              <div className="timeline-phase__circle">
                <i className={`${PHASE_ICONS[i] || "bi-check-lg"} text-[var(--accent)]`} />
              </div>
              {i < data.timeline.phases.length - 1 && (
                <div className="timeline-phase__line" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="timeline-phase__header">
                <span className="timeline-phase__header-title">{phase.title}</span>
                <span className="timeline-phase__header-sep">—</span>
                <span className="timeline-phase__header-duration">{phase.duration}</span>
              </div>
              {phase.tasks.map((task, j) => (
                <div key={j} className="timeline-phase__task">
                  <i className="bi-check-square-fill flex-shrink-0 text-[#ec4899]" />
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
