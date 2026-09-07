import type { ProposalData } from "@/lib/types";

/**
 * What I need from you.
 * Animation: checklist boxes tick themselves one after another down the list
 * (a visible rhythm), and the time-commitment meter shrinks from weekly to
 * monthly as the phases light up.
 */
export default function WhatWeNeedSlide({ data }: { data: ProposalData }) {
  const need = data.what_we_need;
  if (!need) return null;

  const commit = need.time_commitment;
  const phaseCount = commit ? Math.max(1, commit.phases.length - 1) : 1;

  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">{need.heading || "WHAT I NEED FROM YOU"}</h1>
      {need.subheading && (
        <p className="scroll-fade-up delay-1 section-subheading">{need.subheading}</p>
      )}

      <div className="need-grid">
        {need.items.map((item, i) => (
          <div
            key={i}
            className={`scroll-fade-up delay-${Math.min(Math.floor(i / 2) + 1, 5)} need-item`}
            style={{ animationDelay: `${0.2 + i * 0.14}s` }}
          >
            <div className="need-item__box">
              <i className="bi-check-lg" />
            </div>
            <div>
              <div className="need-item__title">
                {item.icon && <i className={`${item.icon} need-item__icon`} />}
                {item.title}
              </div>
              <div className="need-item__detail">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {commit && (
        <div className="scroll-fade-up delay-4 commit">
          <div className="commit__title">
            <i className="bi-calendar-check" /> {commit.title}
          </div>
          <div className="commit__phases">
            {commit.phases.map((p, i) => (
              <div key={i} className="commit__phase" style={{ animationDelay: `${0.3 + i * 0.35}s` }}>
                <div className="commit__period">{p.period}</div>
                <div className="commit__cadence">{p.cadence}</div>
                <div className="commit__meter">
                  <span style={{ width: `${100 - i * (60 / phaseCount)}%` }} />
                </div>
                <div className="commit__detail">{p.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
