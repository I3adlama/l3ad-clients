"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import { LazyMotion, domAnimation, m, useScroll, useReducedMotion } from "motion/react";
import type { ProposalData, StoryData } from "@/lib/types";
import { CountUp, Reveal, SplitWords, Stagger, Stripes, useInViewClass } from "./primitives";
import ServiceVisual from "./visuals";
import "@/styles/proposal-story.css";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

/** Smooth wheel scrolling on desktop. Skipped on touch and for reduced motion. */
function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let stop = false;
    let cleanup = () => {};
    import("lenis").then(({ default: Lenis }) => {
      if (stop) return;
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true, autoResize: true });
      const loop = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      const ro = new ResizeObserver(() => lenis.resize());
      ro.observe(document.body);
      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        lenis.destroy();
      };
    });
    return () => {
      stop = true;
      cleanup();
    };
  }, []);
}

/** The four-strand cable that gets pulled across the top of the page as you scroll. */
function CableRail() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  return (
    <div className="sp-rail" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <m.i key={i} style={reduce ? undefined : { scaleX: scrollYProgress }} />
      ))}
    </div>
  );
}

/** Section shell: one prose card on the textured page, with the stripe mark and heading. */
function Section({
  id,
  heading,
  lede,
  children,
  className = "",
}: {
  id?: string;
  heading: string;
  lede?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`sp-sec ${className}`} id={id}>
      <div className="sp-wrap">
        <div className="sp-card">
          <header className="sp-head">
            <Stripes />
            <SplitWords text={heading} className="sp-h2" />
            {lede && (
              <Reveal delay={0.15}>
                <p className="sp-lede">{lede}</p>
              </Reveal>
            )}
          </header>
          {children}
        </div>
      </div>
    </section>
  );
}

/** Screen one: the L3ad title screen, the way our proposals have always opened. */
function Title({ data }: { data: ProposalData }) {
  return (
    <header className="sp-title">
      <div className="sp-title__card">
        <div className="sp-title__logo sp-enter" style={{ animationDelay: "0.1s" }}>
          <Image src="/logowhite.png" alt="L3ad Solutions" width={400} height={92} priority />
        </div>
        <h1 className="sp-title__h sp-enter" style={{ animationDelay: "0.3s" }}>
          Digital Growth
          <br />
          Proposal
        </h1>
        <div className="sp-title__bar" aria-hidden />
        <p className="sp-title__client sp-enter" style={{ animationDelay: "0.7s" }}>
          {data.title.client_name}
        </p>
        <p className="sp-title__meta sp-enter" style={{ animationDelay: "0.9s" }}>
          Prepared by L3ad Solutions LLC, {data.title.date}
        </p>
      </div>
      <a href="#plan" className="sp-cue sp-enter" style={{ animationDelay: "1.4s" }}>
        <span aria-hidden />
        Scroll
        <i className="bi-chevron-down" aria-hidden />
      </a>
    </header>
  );
}

/** Screen two: the client's own brand, no L3ad wordmark beside it. */
function Intro({ story, clientName }: { story: StoryData; clientName: string }) {
  const ref = useInViewClass<HTMLDivElement>();
  return (
    <section className="sp-sec sp-intro" id="plan">
      <div className="sp-wrap">
        <div className="sp-card sp-intro__card">
          <div className="sp-intro__copy">
            <Reveal>
              <p className="sp-intro__hi">
                <i className="bi-hand-thumbs-up-fill" aria-hidden /> {story.greeting_name}, here&apos;s the plan.
              </p>
            </Reveal>
            <SplitWords text={story.headline} className="sp-intro__h" />
            <div ref={ref} className="sp-intro__stripes" aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </div>
            <Reveal delay={0.3}>
              <p className="sp-intro__sub">{story.sub}</p>
            </Reveal>
          </div>
          {story.client_logo && (
            <Reveal delay={0.2} className="sp-intro__logo">
              <Image src={story.client_logo} alt={clientName} width={601} height={306} priority />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

type Fact = StoryData["facts"][number];

function Bars({ fact }: { fact: Fact }) {
  const ref = useInViewClass<HTMLDivElement>();
  if (!fact.bars || fact.bars.length === 0) return null;
  const max = Math.max(...fact.bars.map((b) => b.value), 1);
  return (
    <div ref={ref} className="sp-bars">
      {fact.bars_caption && <p className="sp-bars__cap">{fact.bars_caption}</p>}
      {fact.bars.map((b, i) => (
        <div key={i} className={`sp-bar ${b.highlight ? "sp-bar--on" : ""}`}>
          <div className="sp-bar__top">
            <span>{b.label}</span>
            <b>{b.display ?? b.value.toLocaleString("en-US")}</b>
          </div>
          <div className="sp-bar__track">
            <i
              style={
                {
                  "--w": `${Math.max(1.5, (b.value / max) * 100)}%`,
                  transitionDelay: `${0.2 + i * 0.12}s`,
                } as CSSProperties
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Facts({ story }: { story: StoryData }) {
  const close = story.facts_close;
  return (
    <Section heading={story.facts_heading}>
      <div className="sp-facts">
        {story.facts.map((f, i) => (
          <Reveal key={i} delay={i * 0.08} className={`sp-factcard ${i === 0 ? "sp-factcard--wide" : ""}`}>
            <div className="sp-factcard__main">
              <span className="sp-ico" aria-hidden>
                <i className={f.icon || "bi-bar-chart"} />
              </span>
              <p className="sp-factcard__n">
                <CountUp value={f.value} prefix={f.prefix} suffix={f.suffix} />
              </p>
              <h3>{f.label}</h3>
              <p className="sp-factcard__body">{f.body}</p>
            </div>
            <Bars fact={f} />
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="sp-tracks">
          <div className="sp-tracks__head">
            <h3>{close.title}</h3>
            <p>{close.body}</p>
          </div>
          {close.tracks && (
            <div className="sp-tracks__grid">
              {close.tracks.map((t, i) => (
                <div key={i} className="sp-track">
                  <span className="sp-ico sp-ico--solid" aria-hidden>
                    <i className={t.icon} />
                  </span>
                  <div>
                    <b>{t.title}</b>
                    <p>{t.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </Section>
  );
}

function Services({ story, clientName }: { story: StoryData; clientName: string }) {
  return (
    <>
      <Section heading={story.services_heading} lede={story.services_sub} className="sp-sec--tight">
        <Reveal delay={0.2}>
          <nav className="sp-jump" aria-label="Services in this plan">
            {story.services.map((s, i) => (
              <a key={i} href={`#svc-${s.visual}`}>
                <em>{i + 1}</em>
                {s.name}
              </a>
            ))}
          </nav>
        </Reveal>
      </Section>

      {story.services.map((s, i) => (
        <section key={i} id={`svc-${s.visual}`} className="sp-sec sp-sec--tight sp-svc">
          <div className="sp-wrap">
            <article className="sp-card">
              <ServiceVisual visual={s.visual} clientName={clientName} />

              <div className="sp-svc__grid">
                <div className="sp-svc__lead">
                  <Reveal>
                    <p className="sp-svc__step">
                      <em>{i + 1}</em>
                      <span>{s.tag}</span>
                    </p>
                    <h3 className="sp-h3">{s.name}</h3>
                    <p className="sp-svc__one">{s.one_liner}</p>
                    <h4>
                      <i className="bi-box-seam" aria-hidden /> What you get
                    </h4>
                  </Reveal>
                  <Stagger className="sp-svc__get" step={0.06}>
                    {s.get.map((g, j) => (
                      <p key={j}>
                        <i className="bi-check-circle-fill" aria-hidden />
                        {g}
                      </p>
                    ))}
                  </Stagger>
                </div>

                <Stagger className="sp-svc__why" step={0.1}>
                  <div className="sp-why">
                    <h4>
                      <i className="bi-bullseye" aria-hidden /> Why you need it
                    </h4>
                    <p>{s.need}</p>
                  </div>
                  <div className="sp-why">
                    <h4>
                      <i className="bi-gear-wide-connected" aria-hidden /> Why it works
                    </h4>
                    <p>{s.works}</p>
                  </div>
                  <div className="sp-why sp-why--expect">
                    <h4>
                      <i className="bi-hourglass-split" aria-hidden /> What to expect
                    </h4>
                    <p>{s.expect}</p>
                  </div>
                </Stagger>
              </div>
            </article>
          </div>
        </section>
      ))}
    </>
  );
}

const LOOP_ICONS = ["bi-search", "bi-eye-fill", "bi-telephone-inbound-fill", "bi-tools", "bi-graph-up-arrow"];

function Loop({ story }: { story: StoryData }) {
  const n = story.loop.steps.length;
  return (
    <Section heading={story.loop.heading} lede={story.loop.body}>
      <Reveal delay={0.2}>
        <div className="sp-loop" style={{ "--n": n } as CSSProperties}>
          <div className="sp-loop__wire" aria-hidden>
            <i className="sp-loop__pulse" />
          </div>
          <ol>
            {story.loop.steps.map((s, i) => (
              <li key={i} style={{ "--i": i } as CSSProperties}>
                <span className="sp-loop__disc" aria-hidden>
                  <i className={LOOP_ICONS[i % LOOP_ICONS.length]} />
                </span>
                <div className="sp-loop__card">
                  <em>{i + 1}</em>
                  <p>{s}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="sp-loop__back">
            <svg viewBox="0 0 1000 70" preserveAspectRatio="none" aria-hidden>
              <path d="M 960 4 C 960 74, 40 74, 40 4" />
            </svg>
            <p>
              <i className="bi-arrow-repeat" aria-hidden /> Then it goes around again, a little stronger each time.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

const TL_ICONS = ["bi-rocket-takeoff-fill", "bi-telephone-inbound-fill", "bi-clipboard-data-fill", "bi-sun-fill"];

function Timeline({ story }: { story: StoryData }) {
  return (
    <Section heading={story.timeline_heading}>
      <Stagger className="sp-tl" step={0.12}>
        {story.timeline.map((t, i) => (
          <div key={i} className={`sp-tl__card sp-tl__card--${i % 4}`}>
            <div className="sp-tl__top">
              <span className="sp-ico" aria-hidden>
                <i className={t.icon || TL_ICONS[i % TL_ICONS.length]} />
              </span>
              <span className="sp-tl__when">{t.when}</span>
            </div>
            <h3>{t.title}</h3>
            <ul>
              {t.points.map((p, j) => (
                <li key={j}>
                  <i className="bi-check2" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Stagger>
      <Reveal>
        <p className="sp-fine sp-fine--boxed">
          <i className="bi-shield-check" aria-hidden />
          {story.timeline_note}
        </p>
      </Reveal>
    </Section>
  );
}

function Proof({ story }: { story: StoryData }) {
  return (
    <Section heading={story.proof_heading}>
      <Stagger className="sp-proof" step={0.12}>
        {story.proof.map((p, i) => (
          <div key={i} className="sp-proof__card">
            <header>
              <span className="sp-ico" aria-hidden>
                <i className={p.icon || "bi-building"} />
              </span>
              <div>
                <h3>{p.client}</h3>
                <p>{p.industry}</p>
              </div>
            </header>
            <dl>
              {p.stats.map((s, j) => (
                <div key={j}>
                  <dt>{s.value}</dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
            {p.quote && (
              <blockquote>
                <i className="bi-quote" aria-hidden />
                <p>{p.quote}</p>
                {p.author && <cite>{p.author}</cite>}
              </blockquote>
            )}
          </div>
        ))}
      </Stagger>
    </Section>
  );
}

/** The closer: the one finding from our own measurements that shapes the strategy. */
function Key({ story }: { story: StoryData }) {
  const k = story.key;
  if (!k) return null;
  return (
    <section className="sp-sec sp-key" id="key">
      <div className="sp-wrap">
        <div className="sp-card sp-key__card">
          <header className="sp-head">
            <p className="sp-key__tag">
              <i className="bi-key-fill" aria-hidden /> {k.heading}
            </p>
            <SplitWords text={k.claim} className="sp-h2 sp-key__claim" />
            <Reveal delay={0.2}>
              <p className="sp-lede">{k.body}</p>
            </Reveal>
          </header>

          <Stagger className="sp-key__stats" step={0.1}>
            {k.stats.map((s, i) => (
              <div key={i} className="sp-key__stat">
                <b>{s.value}</b>
                <p>{s.label}</p>
                {s.source && <small>{s.source}</small>}
              </div>
            ))}
          </Stagger>

          <Stagger className="sp-key__moves" step={0.1}>
            {k.moves.map((mv, i) => (
              <div key={i} className="sp-key__move">
                <span className="sp-ico sp-ico--solid" aria-hidden>
                  <i className={mv.icon} />
                </span>
                <div>
                  <b>{mv.title}</b>
                  <p>{mv.body}</p>
                </div>
              </div>
            ))}
          </Stagger>
          {k.footnote && <p className="sp-fine">{k.footnote}</p>}
        </div>
      </div>
    </section>
  );
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function Investment({ story }: { story: StoryData }) {
  const inv = story.investment;
  const [job, setJob] = useState(inv.calc.default_job);
  const total = inv.calc.monthly_total + inv.calc.ad_budget;
  const jobs = Math.max(1, Math.ceil(total / job));

  return (
    <Section id="investment" heading={inv.heading} lede={inv.sub}>
      <div className="sp-inv">
        <Reveal className="sp-inv__card sp-inv__card--once">
          <p className="sp-inv__label">
            <span className="sp-ico" aria-hidden>
              <i className="bi-window-desktop" />
            </span>
            {inv.one_time.label}
          </p>
          <p className="sp-inv__price">
            {inv.one_time.was && <s>{inv.one_time.was}</s>}
            <b>{inv.one_time.price}</b>
            <span>one time</span>
          </p>
          <p className="sp-inv__note">{inv.one_time.note}</p>
        </Reveal>

        <Reveal className="sp-inv__card sp-inv__card--monthly" delay={0.12}>
          <p className="sp-inv__label">
            <span className="sp-ico" aria-hidden>
              <i className="bi-calendar2-check" />
            </span>
            {inv.monthly.label}
          </p>
          <p className="sp-inv__price">
            <b>{inv.monthly.price}</b>
            <span>a month</span>
          </p>
          <ul className="sp-inv__rows">
            {inv.monthly.rows.map((r, i) => (
              <li key={i}>
                <div>
                  <b>{r.label}</b>
                  <small>{r.detail}</small>
                </div>
                <span>{r.price}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal>
        <div className="sp-inv__ads">
          <span className="sp-ico" aria-hidden>
            <i className="bi-megaphone" />
          </span>
          <div>
            <b>{inv.ad_budget.label}</b>
            <p>{inv.ad_budget.note}</p>
          </div>
          <span className="sp-inv__adsprice">{inv.ad_budget.price}</span>
        </div>
        <p className="sp-fine sp-fine--boxed">
          <i className="bi-unlock" aria-hidden />
          {inv.terms}
        </p>
      </Reveal>

      <Reveal>
        <div className="sp-calc">
          <h3 className="sp-h3">
            <i className="bi-calculator" aria-hidden /> How many jobs does it take to cover this?
          </h3>
          <label htmlFor="sp-job">
            Slide to your average job: <b>{money(job)}</b>
          </label>
          <input
            id="sp-job"
            type="range"
            min={300}
            max={6000}
            step={100}
            value={job}
            onChange={(e) => setJob(Number(e.target.value))}
            style={{ "--fill": `${((job - 300) / 5700) * 100}%` } as CSSProperties}
          />
          <div className="sp-calc__out" aria-live="polite">
            <b>{jobs}</b>
            <p>
              {jobs === 1 ? "job" : "jobs"} a month covers the whole plan
              <small>
                {money(inv.calc.monthly_total)} plan + {money(inv.calc.ad_budget)} ad budget = {money(total)} a month
              </small>
            </p>
          </div>
          <p className="sp-fine">{inv.calc.note}</p>
        </div>
      </Reveal>
    </Section>
  );
}

function Needs({ story }: { story: StoryData }) {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const count = Object.values(done).filter(Boolean).length;
  return (
    <Section heading={story.needs_heading} lede={story.needs_sub}>
      <Stagger className="sp-needs" step={0.06}>
        {story.needs.map((n, i) => (
          <button
            key={i}
            type="button"
            className={`sp-need ${done[i] ? "is-done" : ""}`}
            aria-pressed={Boolean(done[i])}
            onClick={() => setDone((prev) => ({ ...prev, [i]: !prev[i] }))}
          >
            <span className="sp-ico" aria-hidden>
              <i className={n.icon || "bi-check2-square"} />
            </span>
            <span className="sp-need__text">
              <b>{n.title}</b>
              <small>{n.detail}</small>
            </span>
            <span className="sp-need__box" aria-hidden>
              <i className="bi-check-lg" />
            </span>
          </button>
        ))}
      </Stagger>
      <p className="sp-fine" aria-live="polite">
        {count === 0
          ? "Tap each one as you send it. It's only a checklist for you; nothing is saved."
          : `${count} of ${story.needs.length} ticked.`}
      </p>
    </Section>
  );
}

function Close({ story }: { story: StoryData }) {
  return (
    <Section heading={story.steps_heading} className="sp-close">
      <div className="sp-close__grid">
        <Stagger className="sp-steps" step={0.1}>
          {story.steps.map((s, i) => (
            <div key={i} className="sp-step">
              <em>{i + 1}</em>
              <div>
                <h3>{s.title}</h3>
                <p>{s.detail}</p>
              </div>
              <i className={s.icon || "bi-arrow-right-circle"} aria-hidden />
            </div>
          ))}
        </Stagger>

        <Reveal className="sp-note">
          <i className="bi-chat-quote-fill" aria-hidden />
          {story.note.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="sp-note__sig">Nathaniel Curran, L3ad Solutions</p>
          <div className="sp-cta">
            <a className="sp-btn" href={`mailto:${story.cta.email}?subject=${encodeURIComponent("Wire Link proposal")}`}>
              <i className="bi-envelope-fill" aria-hidden /> {story.cta.label}
            </a>
            <a className="sp-btn sp-btn--ghost" href={`sms:${story.cta.phone}`}>
              <i className="bi-chat-dots-fill" aria-hidden /> Text {story.cta.phone_display}
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default function StoryProposal({ data, clientName }: { data: ProposalData; clientName: string }) {
  useSmoothScroll();
  const story = data.story;
  if (!story) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <div className={`sp ${grotesk.variable}`}>
        <div className="sp-bg" aria-hidden>
          <i className="sp-bg__glow sp-bg__glow--a" />
          <i className="sp-bg__glow sp-bg__glow--b" />
          <i className="sp-bg__grid" />
          <i className="sp-bg__grain" />
        </div>
        <CableRail />
        <div className="sp-flow">
          <Title data={data} />
          <Intro story={story} clientName={clientName} />
          <Facts story={story} />
          <Services story={story} clientName={clientName} />
          <Loop story={story} />
          <Timeline story={story} />
          <Proof story={story} />
          <Key story={story} />
          <Investment story={story} />
          <Needs story={story} />
          <Close story={story} />
          <footer className="sp-foot">
            <Image src="/logowhite.png" alt="L3ad Solutions" width={120} height={28} />
            <a href="mailto:hello@l3adsolutions.com">
              <i className="bi-envelope" aria-hidden /> hello@l3adsolutions.com
            </a>
            <a href="tel:+13212913409">
              <i className="bi-telephone" aria-hidden /> (321) 291-3409
            </a>
            <a href="https://l3adsolutions.com" target="_blank" rel="noopener noreferrer">
              <i className="bi-globe2" aria-hidden /> l3adsolutions.com
            </a>
          </footer>
        </div>
      </div>
    </LazyMotion>
  );
}
