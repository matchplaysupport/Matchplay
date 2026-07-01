"use client";

import { useEffect, useRef, useState } from "react";
import { IconArrow, IconCheck, IconX, IconZap } from "./icons";
import { track } from "../../lib/track";

// ── Plans ─────────────────────────────────────────────────────────────────────
// Mirrors docs/PRICING.md: founding $99/mo locked-for-life, Pro $199/mo standard.
const PLANS = {
  founding: { label: "Founding", monthly: 99, note: "Locked for life — first 100 courses" },
  standard: { label: "Standard", monthly: 199, note: "Standard rate after founding spots fill" },
} as const;
type PlanKey = keyof typeof PLANS;

// ── Formatting ────────────────────────────────────────────────────────────────
const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ── Number that tweens to its target whenever the target changes ─────────────
function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [display, setDisplay] = useState(value);
  const liveRef = useRef(value); // last value actually painted
  const rafRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { liveRef.current = value; setDisplay(value); return; }

    const from = liveRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const duration = 480;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = from + (to - from) * eased;
      liveRef.current = cur;
      setDisplay(cur);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{format(display)}</>;
}

// ── Slider row ────────────────────────────────────────────────────────────────
function Slider({
  label, hint, value, min, max, step, onChange, format,
}: {
  label: string; hint?: string; value: number; min: number; max: number; step: number;
  onChange: (n: number) => void; format: (n: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2.5">
        <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{label}</label>
        <span className="text-lg font-bold tabular-nums" style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        className="mp-slider"
        min={min} max={max} step={step} value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(90deg, var(--brand-bright) ${pct}%, var(--surface-3) ${pct}%)` }}
      />
      {hint && <p className="mt-1.5 text-xs" style={{ color: "var(--muted)" }}>{hint}</p>}
    </div>
  );
}

// ── Comparison bar ────────────────────────────────────────────────────────────
function Bar({ label, value, widthPct, gradient, valueColor }: {
  label: string; value: number; widthPct: number; gradient: string; valueColor: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: valueColor }}>
          <AnimatedNumber value={value} format={(n) => `${usd(n)}/yr`} />
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(2, widthPct)}%`, background: gradient, transition: "width 0.5s cubic-bezier(.16,1,.3,1)" }}
        />
      </div>
    </div>
  );
}

// ── Calculator ────────────────────────────────────────────────────────────────
export function SavingsCalculator() {
  const [rounds, setRounds] = useState(300);     // bookings/mo through the channel
  const [fee, setFee] = useState(48);            // avg green fee
  const [commission, setCommission] = useState(15); // % taken now
  const [monthlySub, setMonthlySub] = useState(0);   // flat monthly fee they pay now
  const [plan, setPlan] = useState<PlanKey>("founding");
  const interacted = useRef(false);

  function onChange(setter: (n: number) => void) {
    return (n: number) => {
      if (!interacted.current) { interacted.current = true; track("calc_interact"); }
      setter(n);
    };
  }

  const currentAnnual = (rounds * fee * (commission / 100) + monthlySub) * 12;
  const mpAnnual = PLANS[plan].monthly * 12;
  const savings = currentAnnual - mpAnnual;
  const pctSaved = currentAnnual > 0 ? Math.round((savings / currentAnnual) * 100) : 0;
  const wins = savings > 0;

  const max = Math.max(currentAnnual, mpAnnual, 1);
  const feePerBooking = fee * (commission / 100);

  return (
    <div className="card overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
      <div className="grid lg:grid-cols-2">
        {/* ── Inputs ─────────────────────────────────────────── */}
        <div className="p-7 sm:p-9 flex flex-col gap-7">
          <Slider
            label="Tee times booked online / month"
            value={rounds} min={25} max={1500} step={5}
            onChange={onChange(setRounds)} format={(n) => n.toLocaleString("en-US")}
          />
          <Slider
            label="Average green fee"
            value={fee} min={15} max={150} step={1}
            onChange={onChange(setFee)} format={usd}
          />
          <Slider
            label="What your current platform takes"
            hint="Commission, barter rounds & golfer fees — combined, as a % of each booking."
            value={commission} min={0} max={30} step={1}
            onChange={onChange(setCommission)} format={(n) => `${n}%`}
          />

          {/* Current monthly software fee */}
          <div>
            <label htmlFor="mp-monthly-sub" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
              Your current monthly software fee
            </label>
            <div className="mt-2.5 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "var(--muted)" }}>$</span>
              <input
                id="mp-monthly-sub"
                type="number"
                inputMode="numeric"
                min={0}
                value={monthlySub === 0 ? "" : monthlySub}
                placeholder="0"
                onChange={(e) => {
                  if (!interacted.current) { interacted.current = true; track("calc_interact"); }
                  setMonthlySub(Math.max(0, Number(e.target.value) || 0));
                }}
                className="w-full rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>
            <p className="mt-1.5 text-xs" style={{ color: "var(--muted)" }}>Put 0 if you don&apos;t pay a subscription.</p>
          </div>

          {/* Plan toggle */}
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Your Clubhouse plan</label>
            <div className="mt-2.5 inline-flex w-full rounded-xl p-1 gap-1" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              {(Object.keys(PLANS) as PlanKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => { if (!interacted.current) { interacted.current = true; track("calc_interact"); } setPlan(k); }}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={plan === k
                    ? { background: "var(--surface)", color: "var(--brand)", boxShadow: "var(--shadow-sm)" }
                    : { color: "var(--muted)" }}
                >
                  {PLANS[k].label} · ${PLANS[k].monthly}/mo
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs" style={{ color: "var(--muted)" }}>{PLANS[plan].note} · 0% commission, always.</p>
          </div>
        </div>

        {/* ── Result ─────────────────────────────────────────── */}
        <div className="relative p-7 sm:p-9 flex flex-col justify-center mesh-deep noise text-white">
          {wins ? (
            <>
              <span className="chip self-start" style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}>
                <IconZap size={14} /> Your savings
              </span>
              <p className="mt-4 text-5xl sm:text-6xl font-extrabold" style={{ fontFamily: "var(--font-sora)" }}>
                <AnimatedNumber value={savings} format={usd} />
              </p>
              <p className="mt-2 text-base" style={{ color: "rgba(255,255,255,0.82)" }}>
                kept in your pocket every year — <strong className="text-white">{pctSaved}% less</strong> than you pay now.
              </p>
            </>
          ) : (
            <>
              <span className="chip self-start" style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}>
                <IconZap size={14} /> At this volume
              </span>
              <p className="mt-4 text-3xl sm:text-4xl font-extrabold" style={{ fontFamily: "var(--font-sora)" }}>
                A flat plan, 0% commission
              </p>
              <p className="mt-2 text-base" style={{ color: "rgba(255,255,255,0.82)" }}>
                You also keep every golfer relationship — plus scoring, alerts, and analytics a commission site never gives you.
              </p>
            </>
          )}

          {/* bars */}
          <div className="mt-7 flex flex-col gap-4 rounded-2xl p-5" style={{ background: "rgba(0,0,0,0.18)" }}>
            <Bar
              label="Current platform"
              value={currentAnnual}
              widthPct={(currentAnnual / max) * 100}
              gradient="linear-gradient(135deg, #9fb0a4, #748376)"
              valueColor="rgba(255,255,255,0.9)"
            />
            <Bar
              label="The Clubhouse"
              value={mpAnnual}
              widthPct={(mpAnnual / max) * 100}
              gradient="var(--grad-gold)"
              valueColor="#fff"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>
            <span className="inline-flex items-center gap-1.5">
              <IconX size={15} /> ${feePerBooking.toFixed(2)} in fees per booking today
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconCheck size={15} /> $0 per booking with The Clubhouse
            </span>
          </div>

          <a
            href="#waitlist"
            onClick={() => track("calc_cta_click", { plan, savings: Math.round(savings) })}
            className="btn mt-7 w-full"
            style={{ background: "#fff", color: "var(--brand-900)" }}
          >
            Lock in these savings <IconArrow size={18} />
          </a>
          <p className="mt-3 text-xs text-center" style={{ color: "rgba(255,255,255,0.6)" }}>
            Estimate only. Stripe processing (~2.9% + 30¢) is a pass-through, not a Clubhouse fee.
          </p>
        </div>
      </div>
    </div>
  );
}
