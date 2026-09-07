import type { ProposalData } from "@/lib/types";
import CountUp from "../CountUp";

/**
 * Proof slide: case studies and testimonials from other L3ad clients.
 * Animation: the flagship card's stat numbers count up from zero on a beat,
 * a light sweep crosses the card, and the supporting cards drift in from
 * alternating sides.
 */
export default function CaseStudiesSlide({ data }: { data: ProposalData }) {
  const cs = data.case_studies;
  if (!cs || cs.entries.length === 0) return null;

  const [flagship, ...rest] = cs.entries;

  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">
        {cs.heading || "PROOF FROM CLIENTS I ALREADY WORK WITH"}
      </h1>
      {cs.subheading && (
        <p className="scroll-fade-up delay-1 section-subheading">{cs.subheading}</p>
      )}

      {/* Flagship case study */}
      <div className="scroll-fade-up delay-2 case-flagship">
        <div className="case-flagship__sweep" aria-hidden />
        <div className="case-flagship__head">
          <div>
            <div className="case-flagship__eyebrow">Flagship case study</div>
            <div className="case-flagship__client">{flagship.client}</div>
            <div className="case-flagship__industry">{flagship.industry}</div>
          </div>
          <i className="bi-trophy-fill case-flagship__icon" />
        </div>

        <p className="case-flagship__summary">{flagship.summary}</p>

        <div className="case-stats">
          {flagship.stats.map((s, i) => (
            <div key={i} className="case-stat" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
              <div className="case-stat__value">
                <CountUp value={s.value} duration={1200 + i * 150} />
              </div>
              <div className="case-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        {flagship.quote && (
          <blockquote className="case-quote case-quote--inline">
            <i className="bi-quote case-quote__mark" />
            <p>{flagship.quote}</p>
            {flagship.quote_author && <cite>{flagship.quote_author}</cite>}
          </blockquote>
        )}
      </div>

      {/* Supporting case studies / testimonials */}
      {rest.length > 0 && (
        <div className="case-grid">
          {rest.map((entry, i) => (
            <div
              key={i}
              className={`scroll-fade-up delay-${Math.min(i + 3, 5)} case-card ${
                i % 2 === 0 ? "case-card--from-left" : "case-card--from-right"
              }`}
            >
              <div className="case-card__client">{entry.client}</div>
              <div className="case-card__industry">{entry.industry}</div>
              <p className="case-card__summary">{entry.summary}</p>
              {entry.stats.length > 0 && (
                <div className="case-card__stats">
                  {entry.stats.map((s, j) => (
                    <div key={j} className="case-card__stat">
                      <span className="case-card__stat-value">
                        <CountUp value={s.value} />
                      </span>
                      <span className="case-card__stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {entry.quote && (
                <blockquote className="case-quote">
                  <i className="bi-quote case-quote__mark" />
                  <p>{entry.quote}</p>
                  {entry.quote_author && <cite>{entry.quote_author}</cite>}
                </blockquote>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
