"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Renders children immediately and reliably visible.
 *
 * This used to gate content behind an IntersectionObserver-driven opacity
 * transition. That left large sections invisible in real conditions — e.g.
 * when the page loads in a background tab the fade transition freezes mid-way
 * and the hero stays blank. Reliable rendering matters far more than an
 * entrance animation, so the wrapper is now a transparent pass-through.
 */
export function Reveal({
  children, as: Tag = "div", className = "", style,
}: {
  children: ReactNode;
  as?: ElementType;
  /** Accepted for API compatibility; no longer used. */
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}

/**
 * Count-up number. Animates on mount, but always resolves to the final value:
 * a fallback timer forces `to` even if requestAnimationFrame is throttled
 * (background tab) or reduced-motion is on — so it never gets stuck showing 0.
 */
export function Counter({
  to, from = 0, duration = 1600, prefix = "", suffix = "", decimals = 0, className = "",
}: {
  to: number; from?: number; duration?: number; prefix?: string; suffix?: string;
  decimals?: number; className?: string;
}) {
  const [val, setVal] = useState(from);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVal(to); return; }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Guarantee the final value lands even if rAF never progresses.
    const fallback = setTimeout(() => setVal(to), duration + 700);

    return () => { cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [to, from, duration]);

  return (
    <span className={className}>
      {prefix}
      {val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
