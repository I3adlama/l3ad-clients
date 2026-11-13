"use client";

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

const VIEW_MARGIN = "-10% 0px -5% 0px";

/** Adds `is-in` to the element the first time it scrolls into view. CSS does the rest. */
export function useInViewClass<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: VIEW_MARGIN }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useInViewClass<HTMLDivElement>();
  return (
    <div ref={ref} className={`sp-rv ${className}`} style={{ "--rv-d": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}

export function Stagger({
  children: raw,
  className = "",
  step = 0.08,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
}) {
  const ref = useInViewClass<HTMLDivElement>();
  const children = Children.toArray(raw);
  return (
    <div ref={ref} className={`sp-st ${className}`}>
      {children.map((child, i) => (
        <div key={i} className="sp-st-item" style={{ "--st-d": `${(i * step).toFixed(2)}s` } as CSSProperties}>
          {child}
        </div>
      ))}
    </div>
  );
}

/** Headline that rises word by word out of a mask. Pure CSS, plays at first paint or on view. */
export function SplitWords({
  text,
  className = "",
  as: Tag = "h2",
  onView = true,
  baseDelay = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  onView?: boolean;
  baseDelay?: number;
}) {
  const ref = useInViewClass<HTMLHeadingElement>();
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={`sp-split ${onView ? "sp-split--view" : "is-in"} ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="sp-mask" aria-hidden>
          <span className="sp-word" style={{ animationDelay: `${(baseDelay + i * 0.05).toFixed(2)}s` }}>
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

/** Counts from 0 to `value` once in view. Tabular numerals keep the width steady. */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1.6,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    if (reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className="sp-num">
      {prefix}
      {n.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/** The four cable colors as a small mark. Wire Link's own stripe, used as the section marker. */
export function Stripes({ className = "" }: { className?: string }) {
  const ref = useInViewClass<HTMLDivElement>();
  return (
    <div ref={ref} className={`sp-stripes ${className}`} aria-hidden>
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
