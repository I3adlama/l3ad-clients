import type { ProposalData } from "@/lib/types";

const PHASE_ICONS = ["bi-rocket-takeoff", "bi-graph-up-arrow", "bi-cash-stack", "bi-handshake"];

export default function TimelineSlide({ data }: { data: ProposalData }) {
  return (
    <div className="proposal-slide">
      <h2 className="slide-heading">WHAT HAPPENS &amp; WHEN</h2>

      <div className="max-w-3xl space-y-0">
        {data.timeline.phases.map((phase, i) => (
          <div key={i} className="timeline-phase">
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
              <div className="flex items-baseline gap-3 mb-1">
                <span className="timeline-phase__duration">{phase.duration}</span>
                <span className="timeline-phase__title">{phase.title}</span>
              </div>
              {phase.tasks.map((task, j) => (
                <div key={j} className="timeline-phase__task">
                  {task}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
