import type { ProposalData } from "@/lib/types";

const AIDA_CONFIG = [
  { key: "attention" as const, letter: "A", label: "ATTENTION", color: "#ef4444", icon: "bi-eye-fill" },
  { key: "interest" as const, letter: "I", label: "INTEREST", color: "#f59e0b", icon: "bi-search" },
  { key: "desire" as const, letter: "D", label: "DESIRE", color: "#00f0d0", icon: "bi-heart-fill" },
  { key: "action" as const, letter: "A", label: "ACTION", color: "#ec4899", icon: "bi-telephone-fill" },
];

/**
 * AIDA framework: four stacked rows (4x1), one per stage.
 * Animation: each row's colour rail draws downward, the letter stamps in,
 * and the checklist items cascade in from the left on a rhythmic stagger.
 */
export default function AidaStrategySlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <div className="scroll-fade-up">
        <p className="font-body text-sm tracking-widest text-[var(--text-soft)] font-bold uppercase mb-1">
          The Strategy
        </p>
        <h1 className="section-heading">THE AIDA FRAMEWORK</h1>
      </div>
      <p className="scroll-fade-up delay-1 section-subheading">
        Every page, post, and profile follows one proven sequence. Here&apos;s what each stage does for you.
      </p>

      <div className="aida-stack">
        {AIDA_CONFIG.map((cfg, idx) => {
          const section = data.aida_strategy[cfg.key];
          return (
            <div
              key={cfg.key}
              className={`scroll-fade-up delay-${idx + 1} aida-row`}
              style={{ "--aida-color": cfg.color } as React.CSSProperties}
            >
              {/* Left rail: letter + label */}
              <div className="aida-row__rail">
                <div className="aida-row__rail-line" />
                <div className="aida-row__letter">{cfg.letter}</div>
                <div className="aida-row__label">{cfg.label}</div>
              </div>

              {/* Right: title + items */}
              <div className="aida-row__body">
                <div className="aida-row__title">
                  <i className={`${cfg.icon} aida-row__title-icon`} />
                  <span>{section.title}</span>
                </div>
                <div className="aida-row__items">
                  {section.items.map((item, j) => (
                    <div
                      key={j}
                      className="aida-row__item"
                      style={{ animationDelay: `${0.35 + j * 0.18}s` }}
                    >
                      <i className="bi-check-square-fill aida-row__check" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector arrow to the next stage */}
              {idx < AIDA_CONFIG.length - 1 && (
                <div className="aida-row__connector">
                  <i className="bi-chevron-double-down" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="scroll-fade-up delay-5 text-[var(--accent)] italic text-center font-body text-base mt-10 max-w-3xl mx-auto">
        Strangers find you, check you out, decide you&apos;re the safe choice, and reach out. Every piece of the plan pushes one of those four steps.
      </p>
    </section>
  );
}
