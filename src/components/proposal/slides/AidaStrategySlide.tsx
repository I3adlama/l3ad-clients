import type { ProposalData } from "@/lib/types";

const AIDA_CONFIG = [
  { key: "attention" as const, letter: "A", label: "ATTENTION", color: "#ef4444" },
  { key: "interest" as const, letter: "I", label: "INTEREST", color: "#f59e0b" },
  { key: "desire" as const, letter: "D", label: "DESIRE", color: "#00f0d0" },
  { key: "action" as const, letter: "A", label: "ACTION", color: "#ec4899" },
];

export default function AidaStrategySlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">OUR STRATEGY: THE AIDA FRAMEWORK</h1>
      <p className="scroll-fade-up delay-1 section-subheading">
        Every piece of your digital presence follows one proven marketing framework:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {AIDA_CONFIG.map((cfg, idx) => {
          const section = data.aida_strategy[cfg.key];
          return (
            <div
              key={cfg.key}
              className={`scroll-fade-up delay-${idx + 1} aida-card`}
              style={{ borderColor: cfg.color }}
            >
              {/* Top color bar */}
              <div
                className="h-1 -mx-[1.5rem] -mt-[1.5rem] mb-5"
                style={{ background: cfg.color }}
              />
              <div className="aida-card__letter" style={{ color: cfg.color }}>
                {cfg.letter}
              </div>
              <div className="aida-card__label" style={{ color: cfg.color }}>
                {cfg.label}
              </div>
              <div className="aida-card__title">{section.title}</div>
              {section.items.map((item, j) => (
                <div key={j} className="aida-card__item">
                  <i
                    className="bi-check-square-fill flex-shrink-0 mt-0.5"
                    style={{ color: cfg.color }}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <p className="scroll-fade-up delay-5 text-[var(--accent)] italic text-center font-body text-base mt-8 max-w-3xl mx-auto">
        Every blog post, page, and social post follows this framework — turning strangers into customers.
      </p>
    </section>
  );
}
