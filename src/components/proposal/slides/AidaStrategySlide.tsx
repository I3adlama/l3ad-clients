import type { ProposalData } from "@/lib/types";

const AIDA_CONFIG = [
  { key: "attention" as const, letter: "A", label: "ATTENTION", color: "#ef4444" },
  { key: "interest" as const, letter: "I", label: "INTEREST", color: "#f59e0b" },
  { key: "desire" as const, letter: "D", label: "DESIRE", color: "#00f0d0" },
  { key: "action" as const, letter: "A", label: "ACTION", color: "#ec4899" },
];

export default function AidaStrategySlide({ data }: { data: ProposalData }) {
  return (
    <div className="proposal-slide">
      <h2 className="slide-heading">OUR STRATEGY: THE AIDA FRAMEWORK</h2>
      <p className="slide-subheading">
        Every piece of your digital presence follows one proven marketing framework:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl">
        {AIDA_CONFIG.map((cfg) => {
          const section = data.aida_strategy[cfg.key];
          return (
            <div
              key={cfg.key}
              className="aida-card"
              style={{ borderColor: cfg.color }}
            >
              {/* Top color bar */}
              <div
                className="h-1 -mx-[1.25rem] -mt-[1.25rem] mb-4"
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
                <div key={j} className="aida-card__item">{item}</div>
              ))}
            </div>
          );
        })}
      </div>

      <p className="text-[var(--accent)] italic text-center text-sm mt-6 max-w-3xl mx-auto">
        Every blog post, page, and social post follows this framework — turning strangers into customers.
      </p>
    </div>
  );
}
