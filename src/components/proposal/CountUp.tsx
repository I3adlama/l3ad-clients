"use client";

import { useEffect, useRef, useState } from "react";

const NUMBER_RE = /^([^\d]*)(\d[\d,]*)(\.\d+)?(.*)$/;

interface Parsed {
  prefix: string;
  target: number;
  decimals: number;
  suffix: string;
  useCommas: boolean;
}

function parse(value: string): Parsed | null {
  const match = value.match(NUMBER_RE);
  if (!match) return null;
  const whole = parseInt(match[2].replace(/,/g, ""), 10);
  const decimals = match[3] ? match[3].length - 1 : 0;
  return {
    prefix: match[1],
    target: whole + (match[3] ? parseFloat(match[3]) : 0),
    decimals,
    suffix: match[4],
    useCommas: match[2].includes(","),
  };
}

function format(p: Parsed, n: number): string {
  const fixed = n.toFixed(p.decimals);
  if (!p.useCommas) return p.prefix + fixed + p.suffix;
  const [a, b] = fixed.split(".");
  return p.prefix + a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (b ? "." + b : "") + p.suffix;
}

/**
 * Animates the leading number in a stat string ("158", "+33%", "$1,500/mo", "4.28")
 * from 0 to its value when the element scrolls into view. Non-numeric strings
 * (like "Page 1" or "#1") render as-is. Starts at zero on both server and client
 * so hydration matches; reduced-motion users jump straight to the final value.
 */
export default function CountUp({
  value,
  duration = 1400,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => {
    const p = parse(value);
    return p ? format(p, 0) : value;
  });

  useEffect(() => {
    const p = parse(value);
    const el = ref.current;
    if (!p || !el) return;

    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = () => {
      if (reduce) {
        raf = requestAnimationFrame(() => setDisplay(format(p, p.target)));
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(format(p, p.target * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
