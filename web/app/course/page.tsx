"use client";

import Image from "next/image";
import { useState } from "react";
import { Nav } from "../components/Nav";
import { Reveal, Counter } from "../components/motion";
import { WaitlistForm } from "../components/WaitlistForm";
import { DashboardMockup } from "../components/Mockups";
import { SavingsCalculator } from "../components/SavingsCalculator";
import { Logo } from "../components/Logo";
import { ThemeProvider } from "../components/ThemeProvider";
import {
  IconCalendar, IconDollar, IconChart, IconShield, IconUsers,
  IconCheck, IconArrow, IconX, IconChevron, IconZap, IconStar, IconBell,
} from "../components/icons";
import type { ReactNode } from "react";

// ── Small helpers ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description, delay = 0 }: {
  icon: ReactNode; title: string; description: string; delay?: number;
}) {
  return (
    <Reveal delay={delay} className="card card-hover p-6 flex flex-col gap-3">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "var(--surface-3)", color: "var(--brand)" }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-base" style={{ color: "var(--text)" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{description}</p>
    </Reveal>
  );
}

function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-2)" }}>
      <span className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }}><IconCheck size={16} /></span>
      {children}
    </li>
  );
}

function Step({ n, title, body, icon }: { n: string; title: string; body: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ background: "var(--grad-gold)", color: "#1A1206" }}
        >
          {icon}
        </span>
        <span className="inline-flex items-baseline gap-1.5">
          <span className="text-[0.62rem] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>Step</span>
          <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.55rem", fontStyle: "italic", color: "var(--gold)", lineHeight: 1 }}>{n}</span>
        </span>
      </div>
      <h4 className="font-semibold text-base" style={{ color: "var(--text)" }}>{title}</h4>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{body}</p>
    </div>
  );
}

function Cell({ value, accent }: { value: string | boolean; accent?: boolean }) {
  if (typeof value === "boolean") {
    return value
      ? <span className="inline-flex" style={{ color: accent ? "#fff" : "var(--brand)" }}><IconCheck size={18} /></span>
      : <span className="inline-flex" style={{ color: "var(--muted)", opacity: 0.6 }}><IconX size={18} /></span>;
  }
  return <span className={`text-sm font-semibold ${accent ? "text-white" : ""}`} style={accent ? {} : { color: "var(--text-2)" }}>{value}</span>;
}

function Row({ label, legacy, mp, last }: { label: string; legacy: string | boolean; mp: string | boolean; last?: boolean }) {
  const border = last ? {} : { borderBottom: "1px solid var(--border)" };
  return (
    <>
      <div className="p-4 sm:p-5 flex items-center text-sm font-medium" style={{ ...border, color: "var(--text)" }}>{label}</div>
      <div className="p-4 sm:p-5 flex items-center justify-center text-center" style={{ ...border, background: "var(--surface-2)" }}><Cell value={legacy} /></div>
      <div className="p-4 sm:p-5 flex items-center justify-center text-center" style={{ ...border, background: "var(--grad-brand)" }}><Cell value={mp} accent /></div>
    </>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-bold mb-4" style={{ color: "var(--text)" }}>{title}</h4>
      <ul className="flex flex-col gap-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-sm transition-colors hover:text-[var(--brand)]" style={{ color: "var(--muted)" }}>{label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Nav links ─────────────────────────────────────────────────────────────────

const COURSE_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#savings", label: "Savings" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

// ── Inline FAQ (course-specific) ──────────────────────────────────────────────

const COURSE_FAQ = [
  {
    q: "What does \"zero commission\" actually mean?",
    a: "We charge courses a flat monthly subscription — never a percentage of each booking. Every dollar a golfer pays for your green fee goes directly to you through Stripe Connect. No cuts, no surprises.",
  },
  {
    q: "Does The Clubhouse replace my existing tee-sheet or POS?",
    a: "No — it works alongside it. The Clubhouse is a direct booking channel you control. Set your availability, pricing rules, and blocks from our dashboard. Deeper POS integrations (foreUP, Lightspeed) are on the roadmap.",
  },
  {
    q: "How do payouts work?",
    a: "Payments run through Stripe Connect. Golfers pay securely in-app and funds land in your account in about two business days — no invoicing, no chasing, no net terms.",
  },
  {
    q: "How long does it take to get set up?",
    a: "Under five minutes. Add your tee times, set pricing, and connect Stripe. We've designed the dashboard to require zero training — if you can use a calendar app, you can use The Clubhouse.",
  },
  {
    q: "What are the founding pricing tiers?",
    a: "Courses that join early lock in founding rates — starting at $99/mo for independent and municipal courses, $199/mo for resort and destination properties, and $399/mo for private clubs. These rates are locked in for life as long as your subscription remains active.",
  },
  {
    q: "When can we go live?",
    a: "We're onboarding courses region by region right now. Request early access and we'll reach out with next steps as soon as we're ready for your area.",
  },
];

function CourseFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-3">
      {COURSE_FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="card overflow-hidden">
            <button
              className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-5"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-base" style={{ color: "var(--text)" }}>{item.q}</span>
              <span
                className="shrink-0 transition-transform duration-300"
                style={{ color: "var(--brand)", transform: isOpen ? "rotate(180deg)" : "none" }}
              >
                <IconChevron size={20} />
              </span>
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 sm:px-6 pb-5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function CoursePage() {
  return (
    <>
      <Nav
        audience="course"
        links={COURSE_LINKS}
        ctaLabel="Request early access"
        ctaHref="#waitlist"
        logoHref="/course"
      />

      {/* ── Hero (always cinematic-dark, regardless of body theme) ── */}
      <header className="relative overflow-hidden theme-club" style={{ marginTop: "-68px" }}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 kenburns">
            <Image
              src="/hero-course.png"
              alt="A golf course fairway"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center 35%" }}
            />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,13,9,0.7) 0%, rgba(6,13,9,0.35) 42%, rgba(6,13,9,0.92) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(96deg, rgba(6,13,9,0.88) 0%, rgba(6,13,9,0.3) 52%, transparent 100%)" }} />
        </div>

        <div className="container relative z-10 flex flex-col justify-center" style={{ minHeight: "88vh", paddingTop: "5rem", paddingBottom: "5rem" }}>
          <div className="max-w-2xl">
            <Reveal>
              <div className="flex items-center gap-3.5 mb-7">
                <span className="gold-rule" />
                <span className="text-[0.72rem] font-semibold uppercase" style={{ color: "var(--gold)", letterSpacing: "0.22em" }}>
                  For course operators · Founding pricing now open
                </span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-[2.7rem] sm:text-6xl lg:text-[4.5rem] leading-[1.04]" style={{ color: "#F6F1E6" }}>
                Fill your tee sheet.<br />
                <span className="grad-text" style={{ fontStyle: "italic" }}>Keep every dollar.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-lg sm:text-xl leading-relaxed max-w-xl" style={{ color: "rgba(244,239,227,0.82)" }}>
                A direct booking channel with zero commission. Set your own pricing,
                manage availability, and get paid in two days — while keeping every
                golfer relationship.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#waitlist" className="btn btn-gold">Request early access <IconArrow size={18} /></a>
                <a href="#savings" className="btn btn-light">See the savings</a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.82rem]" style={{ color: "rgba(244,239,227,0.64)" }}>
                {["0% commission on bookings", "~2-day Stripe payouts", "Founding pricing locked for life"].map((t, i) => (
                  <span key={t} className="inline-flex items-center gap-4">
                    {i > 0 && <span aria-hidden style={{ width: 4, height: 4, borderRadius: 99, background: "var(--gold)", opacity: 0.85 }} />}
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section style={{ paddingBlock: "4rem", background: "var(--surface)" }}>
        <div className="container grid grid-cols-2 lg:grid-cols-4 gap-y-8">
          {[
            { v: <Counter to={0} suffix="%" />, l: "Commission on bookings" },
            { v: <Counter to={5} prefix="<" suffix=" min" />, l: "To set up a course" },
            { v: <Counter to={2} suffix="-day" />, l: "Stripe payouts" },
            { v: <span style={{ fontSize: "clamp(1.6rem, 4vw, 2.1rem)" }}>iOS + Android</span>, l: "Native golfer app" },
          ].map((s, i) => (
            <Reveal
              key={i}
              delay={i * 80}
              className={`text-center px-4 lg:px-6 ${i > 0 ? "lg:border-l" : ""}`}
              style={i > 0 ? { borderColor: "var(--border)" } : undefined}
            >
              <p className="text-4xl sm:text-5xl font-extrabold grad-text leading-none" style={{ fontFamily: "var(--font-sora)" }}>{s.v}</p>
              <p className="text-[0.78rem] mt-3 font-medium uppercase" style={{ color: "var(--muted)", letterSpacing: "0.08em" }}>{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="section" style={{ scrollMarginTop: "72px" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              Live in minutes, not months
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Set up your tee sheet once. Golfers in your area start finding and booking you automatically.
            </p>
          </Reveal>

          <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div
                  aria-hidden
                  className="absolute -inset-8 rounded-3xl pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(216,179,106,0.13), transparent 70%)" }}
                />
                {/* color set so the bright mockup stays crisp in dark mode */}
                <div className="theme-light relative" style={{ color: "var(--text)" }}>
                  <DashboardMockup />
                </div>
              </div>
            </Reveal>

            <Reveal delay={120} className="rounded-3xl p-7 sm:p-9" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex flex-col gap-8">
                <Step n="1" icon={<IconCalendar size={18} />} title="Set your tee sheet" body="Add availability, pricing rules, and blocks from one simple dashboard. Live in minutes, no training required." />
                <Step n="2" icon={<IconUsers size={18} />} title="Fill every slot" body="Reach golfers actively searching your area, push last-minute deals, and clear waitlists automatically." />
                <Step n="3" icon={<IconDollar size={18} />} title="Get paid — keep it all" body="Stripe Connect deposits land in ~2 days. Flat monthly subscription means you keep 100% of every green fee." />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="section" style={{ background: "var(--surface)", scrollMarginTop: "72px" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Features</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              Everything you need to run bookings
            </h2>
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={<IconCalendar size={20} />} title="Tee-sheet management" description="Set times, block hours, and manage walk-ins from one dashboard. No training required." />
            <FeatureCard icon={<IconDollar size={20} />} title="Zero commission" description="A flat monthly subscription — never a cut of every booking. Keep 100% of your green fees." delay={80} />
            <FeatureCard icon={<IconChart size={20} />} title="Booking analytics" description="See which times fill fastest, track revenue trends, and understand your golfer mix at a glance." delay={160} />
            <FeatureCard icon={<IconBell size={20} />} title="Last-minute fills" description="Automatically surface open slots to golfers nearby who&apos;ve opted in to last-minute deals." delay={240} />
          </div>
        </div>
      </section>

      {/* ── Comparison ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Why The Clubhouse</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              The math legacy sites don&apos;t want you to do
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Tee-time middlemen take a cut of every booking and own your golfers. We flipped the model.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-12 mx-auto max-w-3xl overflow-x-auto">
            <div className="min-w-[480px] grid grid-cols-[1.4fr_1fr_1fr] overflow-hidden card">
              {/* Header row */}
              <div className="p-4 sm:p-5" />
              <div className="p-4 sm:p-5 text-center" style={{ background: "var(--surface-2)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>Legacy sites</span>
              </div>
              <div className="p-4 sm:p-5 text-center" style={{ background: "var(--grad-brand)" }}>
                <span className="text-sm font-bold text-white">The Clubhouse</span>
              </div>

              {[
                ["Per-booking commission", "3–5% + fees", "$0"],
                ["Who owns the golfer", "The platform", "You do"],
                ["Set your own pricing", false, true],
                ["Payouts", "Net terms", "~2 days"],
                ["Last-minute fills", true, true],
                ["Scoring & handicaps for golfers", false, true],
              ].map(([label, legacy, mp], i) => (
                <Row key={i} label={label as string} legacy={legacy} mp={mp} last={i === 5} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Savings calculator ───────────────────────────────── */}
      <section id="savings" className="section" style={{ background: "var(--surface)", scrollMarginTop: "72px" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Savings calculator</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              See what you&apos;re really paying
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Drag the sliders to match your course. We&apos;ll show what a commission-based platform
              costs you today versus a flat Clubhouse subscription.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-12 max-w-4xl mx-auto">
            <SavingsCalculator />
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="section" style={{ scrollMarginTop: "72px" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Pricing</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              One flat rate. Keep everything else.
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Founding partners lock in these rates for life.
            </p>
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Independent / Muni */}
            <Reveal className="card p-7 flex flex-col">
              <span className="chip self-start" style={{ background: "var(--surface-3)", color: "var(--brand)" }}>Starter</span>
              <p className="mt-3 min-h-10 text-sm font-medium" style={{ color: "var(--muted)" }}>Independent & municipal courses</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}>$99</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>/mo founding</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {["0% commission, always", "Tee-sheet & pricing control", "Stripe Connect payouts (~2 days)", "Booking analytics dashboard", "Waitlist & last-minute fills"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
              <a href="#waitlist" className="btn btn-ghost mt-7 w-full">Request access</a>
            </Reveal>

            {/* Resort / Destination */}
            <Reveal delay={80} className="card p-7 flex flex-col" style={{ borderColor: "var(--gold)", boxShadow: "var(--shadow-lg)" }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="chip" style={{ background: "var(--surface-3)", color: "var(--gold)" }}>Pro</span>
                <span className="chip" style={{ background: "var(--grad-gold)", color: "#1A1206" }}>Most popular</span>
              </div>
              <p className="mt-3 min-h-10 text-sm font-medium" style={{ color: "var(--muted)" }}>Resort & destination courses</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ fontFamily: "var(--font-sora)", background: "var(--grad-gold)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>$199</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>/mo founding</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {["Everything in Starter", "Multi-course management", "Group & tournament bookings (soon)", "Priority support", "Early access to new features"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
              <a href="#waitlist" className="btn btn-gold mt-7 w-full">Request early access</a>
            </Reveal>

            {/* Private club */}
            <Reveal delay={160} className="card p-7 flex flex-col">
              <span className="chip self-start" style={{ background: "var(--surface-3)", color: "var(--gold)" }}>Premium</span>
              <p className="mt-3 min-h-10 text-sm font-medium" style={{ color: "var(--muted)" }}>Private clubs & multi-venue operators</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}>$399</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>/mo founding</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {["Everything in Pro", "Private member-only booking", "Dedicated account manager", "PMS/POS integration (roadmap)", "Custom branding options"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
              <a href="#waitlist" className="btn btn-ghost mt-7 w-full">Request access</a>
            </Reveal>
          </div>

          <Reveal delay={80} className="mt-8 max-w-4xl mx-auto rounded-2xl p-5 sm:p-6 flex flex-wrap items-center gap-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Founding partner rates are locked in for life</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Join during early access and your subscription price never increases.</p>
            </div>
            <a href="#waitlist" className="btn btn-primary shrink-0" style={{ padding: "0.6rem 1.25rem", fontSize: "0.875rem" }}>
              Lock in your rate
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Founding perks ───────────────────────────────────── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Founding partners</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              Perks for early operators
            </h2>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <IconZap size={20} />, t: "Priority onboarding", d: "Your course goes live first when we launch in your region." },
              { icon: <IconDollar size={20} />, t: "Founding pricing", d: "Lock in early-partner rates — never increases as we grow." },
              { icon: <IconUsers size={20} />, t: "A direct line", d: "Talk to the team building it, not a support ticket queue." },
              { icon: <IconStar size={20} />, t: "Shape the roadmap", d: "Vote on integrations and features before they ship." },
            ].map((p, i) => (
              <FeatureCard key={p.t} icon={p.icon} title={p.t} description={p.d} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="section" style={{ scrollMarginTop: "72px" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              Questions, answered
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <CourseFaq />
          </Reveal>
        </div>
      </section>

      {/* ── Waitlist CTA ─────────────────────────────────────── */}
      <section id="waitlist" className="section" style={{ background: "var(--surface)", scrollMarginTop: "72px" }}>
        <div className="container">
          <div
            className="relative overflow-hidden rounded-3xl mesh-deep noise"
            style={{ boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-strong)" }}
          >
            <div className="relative grid lg:grid-cols-2 gap-10 p-8 sm:p-12 lg:p-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-5xl font-bold text-white">
                  Ready to keep more of what you earn?
                </h2>
                <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
                  Request early access and we&apos;ll reach out when we&apos;re ready to onboard your course.
                </p>
                <div className="mt-7 flex flex-col gap-3 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {["Zero commission on every booking", "Founding pricing locked in for life", "Live in under 5 minutes"].map((t) => (
                    <span key={t} className="inline-flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.18)" }}
                      >
                        <IconCheck size={13} />
                      </span>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="theme-light rounded-2xl p-6 sm:p-7"
                style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)", color: "var(--text)" }}
              >
                <WaitlistForm defaultAudience="course" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="mt-auto" style={{ background: "var(--surface)" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--border-strong) 20%, var(--gold) 50%, var(--border-strong) 80%, transparent)" }} />
        <div className="container py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size={32} />
            <p className="mt-4 text-sm max-w-xs" style={{ color: "var(--muted)" }}>
              Zero-commission golf booking and match-play scoring, built for modern courses and the golfers who love them.
            </p>
          </div>
          <FooterCol title="Courses" links={[["How it works", "#how"], ["Features", "#features"], ["Savings", "#savings"], ["Pricing", "#pricing"]]} />
          <FooterCol title="Platform" links={[["For Golfers", "/golfer"], ["FAQ", "#faq"], ["Join waitlist", "#waitlist"]]} />
          <FooterCol title="Legal" links={[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]]} />
        </div>
        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "var(--muted)" }}>© {new Date().getFullYear()} The Clubhouse. All rights reserved.</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Made for golfers, by golfers.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function CourseLandingPage() {
  return (
    <ThemeProvider>
      <CoursePage />
    </ThemeProvider>
  );
}
