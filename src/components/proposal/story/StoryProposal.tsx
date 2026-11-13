"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import {
  LazyMotion,
  domAnimation,
  m,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import type { ProposalData, StoryData } from "@/lib/types";
import { CountUp, Reveal, SplitWords, Stagger, Stripes } from "./primitives";
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

/** The four-strand cable that gets pulled down the page as you scroll. */
function CableRail() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  return (
    <>
      <div className="sp-rail sp-rail--v" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <m.i key={i} style={reduce ? undefined : { scaleY: scrollYProgress }} />
        ))}
      </div>
      <div className="sp-rail sp-rail--h" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <m.i key={i} style={reduce ? undefined : { scaleX: scrollYProgress }} />
        ))}
      </div>
    </>
  );
}

function Hero({ story, clientName }: { story: StoryData; clientName: string }) {
  return (
    <header className="sp-hero">
      <div className="sp-hero__glow" aria-hidden />
      <div className="sp-hero__brands sp-enter" style={{ animationDelay: "0.1s" }}>
        <Image src="/logowhite.png" alt="L3ad Solutions" width={150} height={35} priority />
        <span aria-hidden>for</span>
        {story.client_logo ? (
          <Image src={story.client_logo} alt={clientName} width={180} height={103} priority className="sp-hero__client" />
        ) : (
          <b>{clientName}</b>
        )}
      </div>
      <p className="sp-hero__hi sp-enter" style={{ animationDelay: "0.35s" }}>
        {story.greeting_name}, here&apos;s the plan.
      </p>
      <SplitWords as="h1" text={story.headline} className="sp-hero__h" onView={false} baseDelay={0.5} />
      <div className="sp-hero__stripes" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>
      <p className="sp-hero__sub sp-enter" style={{ animationDelay: "1.5s" }}>
        {story.sub}
      </p>
      <p className="sp-hero__meta sp-enter" style={{ animationDelay: "1.7s" }}>
        Prepared by Nathaniel Curran, L3ad Solutions. {story.date}.
      </p>
      <div className="sp-cue sp-enter" style={{ animationDelay: "2.1s" }} aria-hidden>
        <span />
        Scroll
      </div>
    </header>
  );
}

type Fact = StoryData["facts"][number];

function FactBody({ fact }: { fact: Fact }) {
  return (
    <div className="sp-fact">
      <div className="sp-fact__n">
        <CountUp value={fact.value} prefix={fact.prefix} suffix={fact.suffix} />
      </div>
      <div className="sp-fact__copy">
        <h3>{fact.label}</h3>
        <p>{fact.body}</p>
        {fact.chips && (
          <ul className="sp-fact__chips">
            {fact.chips.map((c, i) => (
              <li key={i}>
                <b>{c.value}</b>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CloseBody({ close }: { close: StoryData["facts_close"] }) {
  return (
    <div className="sp-fact sp-fact--close">
      <div className="sp-fact__copy">
        <Stripes />
        <h3>{close.title}</h3>
        <p>{close.body}</p>
      </div>
    </div>
  );
}

function PinnedFrame({
  i,
  n,
  progress,
  children,
}: {
  i: number;
  n: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const w = 1 / n;
  const s = i * w;
  const e = s + w;
  const fade = w * 0.22;
  const opacity = useTransform(progress, [s, s + fade, e - fade, e], [i === 0 ? 1 : 0, 1, 1, i === n - 1 ? 1 : 0]);
  const y = useTransform(progress, [s, e], [i === 0 ? 0 : 60, i === n - 1 ? 0 : -60]);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  return (
    <m.div className="sp-pin__frame" style={{ opacity, y, visibility }}>
      {children}
    </m.div>
  );
}

/** Three numbers and a conclusion. Pinned crossfade on desktop, stacked on phones. */
function Facts({ story }: { story: StoryData }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = story.facts.length + 1;
  const dots = useTransform(scrollYProgress, (p) => Math.min(n - 1, Math.floor(p * n)));
  const [active, setActive] = useState(0);
  useEffect(() => dots.on("change", (v) => setActive(v)), [dots]);

  return (
    <section aria-label={story.facts_heading}>
      <div ref={ref} className="sp-pin" style={{ height: `${n * 90}vh` }}>
        <div className="sp-pin__stage">
          <p className="sp-pin__title">{story.facts_heading}</p>
          {story.facts.map((f, i) => (
            <PinnedFrame key={i} i={i} n={n} progress={scrollYProgress}>
              <FactBody fact={f} />
            </PinnedFrame>
          ))}
          <PinnedFrame i={n - 1} n={n} progress={scrollYProgress}>
            <CloseBody close={story.facts_close} />
          </PinnedFrame>
          <div className="sp-pin__dots" aria-hidden>
            {Array.from({ length: n }).map((_, i) => (
              <i key={i} className={i === active ? "is-on" : ""} />
            ))}
          </div>
        </div>
      </div>

      <div className="sp-stack">
        <div className="sp-wrap">
          <SplitWords text={story.facts_heading} className="sp-h2" />
          {story.facts.map((f, i) => (
            <Reveal key={i}>
              <FactBody fact={f} />
            </Reveal>
          ))}
          <Reveal>
            <CloseBody close={story.facts_close} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Services({ story, clientName }: { story: StoryData; clientName: string }) {
  return (
    <section className="sp-sec">
      <div className="sp-wrap">
        <Stripes />
        <SplitWords text={story.services_heading} className="sp-h2" />
        <Reveal delay={0.15}>
          <p className="sp-lede">{story.services_sub}</p>
        </Reveal>

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
      </div>

      {story.services.map((s, i) => (
        <article key={i} id={`svc-${s.visual}`} className={`sp-svc ${i % 2 ? "sp-svc--flip" : ""}`}>
          <div className="sp-wrap sp-svc__grid">
            <div className="sp-svc__vis">
              <ServiceVisual visual={s.visual} clientName={clientName} />
            </div>
            <div className="sp-svc__copy">
              <Reveal>
                <p className="sp-svc__step">
                  <em>{i + 1}</em>
                  <span>{s.tag}</span>
                </p>
                <h3 className="sp-h3">{s.name}</h3>
                <p className="sp-svc__one">{s.one_liner}</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h4>What you get</h4>
              </Reveal>
              <Stagger className="sp-svc__get" step={0.06}>
                {s.get.map((g, j) => (
                  <p key={j}>
                    <i className="bi-check2" aria-hidden />
                    {g}
                  </p>
                ))}
              </Stagger>
              <Stagger className="sp-svc__why" step={0.1}>
                <div>
                  <h4>Why you need it</h4>
                  <p>{s.need}</p>
                </div>
                <div>
                  <h4>Why it works</h4>
                  <p>{s.works}</p>
                </div>
                <div className="sp-svc__expect">
                  <h4>What to expect</h4>
                  <p>{s.expect}</p>
                </div>
              </Stagger>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function Loop({ story }: { story: StoryData }) {
  return (
    <section className="sp-sec sp-sec--tint">
      <div className="sp-wrap">
        <Stripes />
        <SplitWords text={story.loop.heading} className="sp-h2" />
        <Reveal delay={0.15}>
          <p className="sp-lede">{story.loop.body}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <ol className="sp-loop">
            {story.loop.steps.map((s, i) => (
              <li key={i} style={{ animationDelay: `${i * 1.1}s` }}>
                <em>{i + 1}</em>
                {s}
              </li>
            ))}
          </ol>
          <p className="sp-loop__back">
            <i className="bi-arrow-repeat" aria-hidden /> Then it goes around again, a little stronger each time.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Timeline({ story }: { story: StoryData }) {
  return (
    <section className="sp-sec">
      <div className="sp-wrap">
        <Stripes />
        <SplitWords text={story.timeline_heading} className="sp-h2" />
        <Stagger className="sp-tl" step={0.14}>
          {story.timeline.map((t, i) => (
            <div key={i} className="sp-tl__col">
              <span className="sp-tl__node" aria-hidden />
              <p className="sp-tl__when">{t.when}</p>
              <h3>{t.title}</h3>
              <ul>
                {t.points.map((p, j) => (
                  <li key={j}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </Stagger>
        <Reveal>
          <p className="sp-fine">{story.timeline_note}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Proof({ story }: { story: StoryData }) {
  return (
    <section className="sp-sec sp-sec--tint">
      <div className="sp-wrap">
        <Stripes />
        <SplitWords text={story.proof_heading} className="sp-h2" />
        <Stagger className="sp-proof" step={0.12}>
          {story.proof.map((p, i) => (
            <div key={i} className="sp-proof__card">
              <header>
                <h3>{p.client}</h3>
                <p>{p.industry}</p>
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
                  <p>&ldquo;{p.quote}&rdquo;</p>
                  {p.author && <cite>{p.author}</cite>}
                </blockquote>
              )}
            </div>
          ))}
        </Stagger>
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
    <section className="sp-sec" id="investment">
      <div className="sp-wrap">
        <Stripes />
        <SplitWords text={inv.heading} className="sp-h2" />
        <Reveal delay={0.15}>
          <p className="sp-lede">{inv.sub}</p>
        </Reveal>

        <div className="sp-inv">
          <Reveal className="sp-inv__card sp-inv__card--once">
            <p className="sp-inv__label">{inv.one_time.label}</p>
            <p className="sp-inv__price">
              {inv.one_time.was && <s>{inv.one_time.was}</s>}
              <b>{inv.one_time.price}</b>
              <span>one time</span>
            </p>
            <p className="sp-inv__note">{inv.one_time.note}</p>
          </Reveal>

          <Reveal className="sp-inv__card sp-inv__card--monthly" delay={0.12}>
            <p className="sp-inv__label">{inv.monthly.label}</p>
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
            <div>
              <b>{inv.ad_budget.label}</b>
              <p>{inv.ad_budget.note}</p>
            </div>
            <span>{inv.ad_budget.price}</span>
          </div>
          <p className="sp-fine">{inv.terms}</p>
        </Reveal>

        <Reveal>
          <div className="sp-calc">
            <h3 className="sp-h3">How many jobs does it take to cover this?</h3>
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
              style={{ "--fill": `${((job - 300) / 5700) * 100}%` } as React.CSSProperties}
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
      </div>
    </section>
  );
}

function Needs({ story }: { story: StoryData }) {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const count = Object.values(done).filter(Boolean).length;
  return (
    <section className="sp-sec sp-sec--tint">
      <div className="sp-wrap">
        <Stripes />
        <SplitWords text={story.needs_heading} className="sp-h2" />
        <Reveal delay={0.15}>
          <p className="sp-lede">{story.needs_sub}</p>
        </Reveal>
        <Stagger className="sp-needs" step={0.06}>
          {story.needs.map((n, i) => (
            <button
              key={i}
              type="button"
              className={`sp-need ${done[i] ? "is-done" : ""}`}
              aria-pressed={Boolean(done[i])}
              onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
            >
              <span className="sp-need__box" aria-hidden>
                <i className="bi-check-lg" />
              </span>
              <span>
                <b>{n.title}</b>
                <small>{n.detail}</small>
              </span>
            </button>
          ))}
        </Stagger>
        <p className="sp-fine" aria-live="polite">
          {count === 0
            ? "Tap each one as you send it. It's only a checklist for you; nothing is saved."
            : `${count} of ${story.needs.length} ticked.`}
        </p>
      </div>
    </section>
  );
}

function Close({ story }: { story: StoryData }) {
  return (
    <section className="sp-sec sp-close">
      <div className="sp-wrap">
        <Stripes />
        <SplitWords text={story.steps_heading} className="sp-h2" />
        <Stagger className="sp-steps" step={0.1}>
          {story.steps.map((s, i) => (
            <div key={i} className="sp-step">
              <em>{i + 1}</em>
              <div>
                <h3>{s.title}</h3>
                <p>{s.detail}</p>
              </div>
            </div>
          ))}
        </Stagger>

        <Reveal>
          <div className="sp-note">
            {story.note.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="sp-note__sig">Nathaniel Curran, L3ad Solutions</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="sp-cta">
            <a className="sp-btn" href={`mailto:${story.cta.email}?subject=${encodeURIComponent("Wire Link proposal")}`}>
              {story.cta.label}
            </a>
            <a className="sp-btn sp-btn--ghost" href={`sms:${story.cta.phone}`}>
              Or text {story.cta.phone_display}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function StoryProposal({ data, clientName }: { data: ProposalData; clientName: string }) {
  useSmoothScroll();
  const story = data.story;
  if (!story) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <div className={`sp ${grotesk.variable}`}>
        <div className="sp-grain" aria-hidden />
        <CableRail />
        <Hero story={story} clientName={clientName} />
        <Facts story={story} />
        <Services story={story} clientName={clientName} />
        <Loop story={story} />
        <Timeline story={story} />
        <Proof story={story} />
        <Investment story={story} />
        <Needs story={story} />
        <Close story={story} />
        <footer className="sp-foot">
          <Image src="/logowhite.png" alt="L3ad Solutions" width={120} height={28} />
          <a href="mailto:hello@l3adsolutions.com">hello@l3adsolutions.com</a>
          <a href="tel:+13212913409">(321) 291-3409</a>
          <a href="https://l3adsolutions.com" target="_blank" rel="noopener noreferrer">
            l3adsolutions.com
          </a>
        </footer>
      </div>
    </LazyMotion>
  );
}
