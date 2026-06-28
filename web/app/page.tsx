import Image from "next/image";
import { Nav } from "./components/Nav";
import { Reveal, Counter } from "./components/motion";
import { WaitlistForm } from "./components/WaitlistForm";
import { Faq } from "./components/Faq";
import { PhoneMockup, DashboardMockup } from "./components/Mockups";
import { SavingsCalculator } from "./components/SavingsCalculator";
import { Logo } from "./components/Logo";
import {
  IconCalendar, IconDollar, IconChart, IconSearch, IconTrophy,
  IconCheck, IconBell, IconMapPin, IconShield, IconCard, IconFlag, IconZap,
  IconArrow, IconStar, IconX, IconUsers,
} from "./components/icons";
import type { ReactNode } from "react";

// ── Small presentational helpers ─────────────────────────────────────────────

function FeatureCard({ icon, title, description, delay = 0 }: {
  icon: ReactNode; title: string; description: string; delay?: number;
}) {
  return (
    <Reveal delay={delay} className="card card-hover p-6 flex flex-col gap-3.5">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-3)", color: "var(--brand)" }}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg" style={{ color: "var(--text)" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{description}</p>
    </Reveal>
  );
}

function Step({ n, title, body, icon }: { n: string; title: string; body: string; icon: ReactNode }) {
  return (
    <div className="relative flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: "var(--grad-brand)" }}>
          {icon}
        </span>
        <span className="text-xs font-bold tracking-widest" style={{ color: "var(--muted)" }}>STEP {n}</span>
      </div>
      <h4 className="font-semibold text-lg" style={{ color: "var(--text)" }}>{title}</h4>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{body}</p>
    </div>
  );
}

function AppBadges() {
  const Pill = ({ glyph, top, bottom }: { glyph: ReactNode; top: string; bottom: string }) => (
    <span className="inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{ background: "#0B0F0C", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
      {glyph}
      <span className="flex flex-col leading-tight text-left">
        <span className="text-[10px] opacity-80">{top}</span>
        <span className="text-sm font-semibold -mt-0.5">{bottom}</span>
      </span>
    </span>
  );
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Pill
        top="Coming soon to the"
        bottom="App Store"
        glyph={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.36 1.43c.07 1-.32 1.96-.94 2.66-.65.74-1.7 1.31-2.71 1.23-.09-.97.37-1.98.96-2.62.66-.72 1.79-1.26 2.69-1.27zM19.9 17.2c-.52 1.2-.77 1.73-1.44 2.79-.94 1.48-2.26 3.32-3.9 3.33-1.45.01-1.83-.95-3.8-.94-1.97.01-2.38.96-3.84.95-1.64-.02-2.89-1.68-3.83-3.16-2.62-4.13-2.9-8.98-1.28-11.56 1.15-1.83 2.97-2.9 4.68-2.9 1.74 0 2.84.96 4.28.96 1.4 0 2.25-.96 4.27-.96 1.52 0 3.13.83 4.28 2.26-3.76 2.06-3.15 7.43.6 9.18z" /></svg>}
      />
      <Pill
        top="Coming soon to"
        bottom="Google Play"
        glyph={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.6 2.2c-.3.3-.5.7-.5 1.3v17c0 .6.2 1 .5 1.3l9.2-9.8L3.6 2.2zm12.3 6.2L5.3 2.3 14.9 8l1 0.4zm3.4 2.3-2.6-1.5-2.4 2.5 2.4 2.5 2.7-1.5c.8-.5.8-1.9-.1-2.5zM5.3 21.7l10.6-6.1-1.9-2-8.7 8.1z" /></svg>}
      />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div id="top" className="theme-club flex flex-col min-h-screen">
      <Nav />

      {/* ── Hero (cinematic full-bleed) ──────────────────────── */}
      <header className="relative overflow-hidden">
        {/* golden-hour imagery with a slow ken-burns drift */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 kenburns">
            <Image
              src="/hero-course.png"
              alt="A private golf course fairway glowing at golden hour"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center 45%" }}
            />
          </div>
          {/* cinematic overlays for depth + legibility */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,13,9,0.62) 0%, rgba(6,13,9,0.30) 42%, rgba(6,13,9,0.88) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(96deg, rgba(6,13,9,0.86) 0%, rgba(6,13,9,0.25) 52%, transparent 100%)" }} />
        </div>

        <div className="container relative z-10 flex flex-col justify-center" style={{ minHeight: "92vh", paddingTop: "6rem", paddingBottom: "5rem" }}>
          <div className="max-w-2xl">
            <Reveal>
              <div className="flex items-center gap-3.5 mb-7">
                <span className="gold-rule" />
                <span className="text-[0.72rem] font-semibold uppercase" style={{ color: "var(--gold)", letterSpacing: "0.22em" }}>
                  By invitation · Now accepting early access
                </span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-[2.9rem] sm:text-7xl lg:text-[5rem] leading-[1.02]" style={{ color: "#F6F1E6" }}>
                Book the tee&nbsp;time.<br />
                <span className="grad-text" style={{ fontStyle: "italic" }}>Keep the&nbsp;score.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 text-lg sm:text-xl leading-relaxed max-w-xl" style={{ color: "rgba(244,239,227,0.82)" }}>
                A members-grade booking experience for golfers and the courses they love — match-play
                scoring, handicaps, and leaderboards built in. Zero commission, always.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <a href="#waitlist" className="btn btn-gold">Request early access <IconArrow size={18} /></a>
                <a href="#how" className="btn btn-light">See how it works</a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.82rem]" style={{ color: "rgba(244,239,227,0.64)" }}>
                {["Free to browse", "Zero commission for courses", "Founding pricing for life"].map((t, i) => (
                  <span key={t} className="inline-flex items-center gap-4">
                    {i > 0 && <span aria-hidden style={{ width: 4, height: 4, borderRadius: 99, background: "var(--gold)", opacity: 0.85 }} />}
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2.5" aria-hidden style={{ color: "rgba(244,239,227,0.5)" }}>
          <span className="text-[0.6rem] tracking-[0.24em] uppercase">Scroll</span>
          <span style={{ width: 1, height: 34, background: "linear-gradient(var(--gold), transparent)" }} />
        </div>
      </header>

      {/* ── Category marquee ─────────────────────────────────── */}
      <section className="py-14 border-y" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <p className="text-center text-[0.7rem] font-semibold tracking-[0.24em] uppercase mb-9" style={{ color: "var(--gold)" }}>
          Built for every kind of course
        </p>
        <div className="marquee-mask overflow-hidden">
          <div className="marquee-track">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center" style={{ gap: "2.75rem" }} aria-hidden={dup === 1}>
                {["Independent courses", "Municipals", "Resort & destination", "Private clubs", "9-hole tracks", "Driving ranges", "University courses", "Links & heathland"].map((t) => (
                  <span key={t} className="inline-flex items-center whitespace-nowrap" style={{ gap: "2.75rem" }}>
                    <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.4rem", color: "var(--text-2)" }}>{t}</span>
                    <span aria-hidden style={{ width: 5, height: 5, borderRadius: 99, background: "var(--gold)", opacity: 0.55 }} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="section" style={{ paddingBlock: "4.5rem" }}>
        <div className="container grid grid-cols-2 lg:grid-cols-4 gap-y-10">
          {[
            { v: <Counter to={0} suffix="%" />, l: "Commission on bookings" },
            { v: <Counter to={5} prefix="<" suffix=" min" />, l: "To set up a course" },
            { v: <Counter to={2} suffix="-day" />, l: "Stripe payouts" },
            { v: <span className="whitespace-nowrap" style={{ fontSize: "clamp(1.6rem, 4vw, 2.1rem)" }}>iOS + Android</span>, l: "Native golfer app" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80} className={`text-center px-4 lg:px-6 ${i > 0 ? "lg:border-l" : ""}`} style={i > 0 ? { borderColor: "var(--border)" } : undefined}>
              <p className="text-4xl sm:text-5xl font-extrabold grad-text leading-none" style={{ fontFamily: "var(--font-sora)" }}>{s.v}</p>
              <p className="text-[0.78rem] mt-3 font-medium uppercase" style={{ color: "var(--muted)", letterSpacing: "0.08em" }}>{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              Two sides. One seamless round.
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Golfers find and play in a few taps. Courses fill tee sheets and get paid — without lifting a finger or losing a cut.
            </p>
          </Reveal>

          <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-16">
            <Reveal className="rounded-3xl p-7 sm:p-9" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <span className="chip mb-7" style={{ background: "var(--surface)", color: "var(--brand)", border: "1px solid var(--border)" }}>For golfers</span>
              <div className="flex flex-col gap-8">
                <Step n="1" icon={<IconSearch size={18} />} title="Search nearby courses" body="Filter by date, time, players, and price. Compare live availability and sort by distance — all in one feed." />
                <Step n="2" icon={<IconCard size={18} />} title="Book & pay in two taps" body="Reserve your slot and pay securely in-app. No phone calls, no booking fees, no surprises at the counter." />
                <Step n="3" icon={<IconFlag size={18} />} title="Play & track the match" body="Keep score in match or stroke play, update your handicap automatically, and settle it on the leaderboard." />
              </div>
            </Reveal>

            <Reveal delay={120} className="rounded-3xl p-7 sm:p-9" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <span className="chip mb-7" style={{ background: "var(--surface)", color: "var(--gold)", border: "1px solid var(--border)" }}>For courses</span>
              <div className="flex flex-col gap-8">
                <Step n="1" icon={<IconCalendar size={18} />} title="Set your tee sheet" body="Add availability, pricing rules, and blocks from one simple dashboard. Live in minutes, no training required." />
                <Step n="2" icon={<IconUsers size={18} />} title="Fill every slot" body="Reach golfers actively searching your area, push last-minute deals, and clear waitlists automatically." />
                <Step n="3" icon={<IconDollar size={18} />} title="Get paid — keep it all" body="Stripe Connect deposits land in ~2 days. Flat monthly subscription means you keep 100% of every green fee." />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── For Golfers ──────────────────────────────────────── */}
      <section id="golfers" className="section">
        <div className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <Reveal>
              <span className="eyebrow">For golfers</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
                Your next round, <span className="grad-text">three taps away</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--muted)" }}>
                One app for the whole round — discover courses, lock in the time, and settle the match. It stays on your home screen because it does more than book.
              </p>
            </Reveal>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <FeatureCard icon={<IconSearch size={20} />} title="Smart tee-time search" description="Filter by date, time, players, and price. Sort by distance or availability and book in seconds." />
              <FeatureCard icon={<IconTrophy size={20} />} title="Match-play scoring" description="Match and stroke play, automatic handicap tracking, and live leaderboards with your regular group." delay={80} />
              <FeatureCard icon={<IconBell size={20} />} title="Last-minute alerts" description="Get pinged when a slot opens at a course you love — and grab the deal before anyone else." delay={160} />
              <FeatureCard icon={<IconMapPin size={20} />} title="Courses near you" description="Discover new tracks while you travel, with real availability and transparent green-fee pricing." delay={240} />
            </div>
          </div>
          <Reveal delay={120} className="order-1 lg:order-2 flex justify-center">
            <div className="theme-light"><PhoneMockup /></div>
          </Reveal>
        </div>
      </section>

      {/* ── For Courses ──────────────────────────────────────── */}
      <section id="courses" className="section" style={{ background: "var(--surface)" }}>
        <div className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal className="flex justify-center">
            <div className="w-full max-w-md theme-light">
              <DashboardMockup />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <span className="eyebrow" style={{ color: "var(--gold)" }}>For course operators</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
                Stop leaving tee&nbsp;times empty
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--muted)" }}>
                A direct booking channel with zero commission. Set your own pricing, control availability, and get paid instantly through Stripe — while keeping every golfer relationship.
              </p>
            </Reveal>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <FeatureCard icon={<IconCalendar size={20} />} title="Tee-sheet management" description="Set times, block hours, and manage walk-ins from one dashboard. No training required." />
              <FeatureCard icon={<IconDollar size={20} />} title="Zero commission" description="A flat monthly subscription — never a cut of every booking. Keep 100% of your green fees." delay={80} />
              <FeatureCard icon={<IconChart size={20} />} title="Booking analytics" description="See which times fill fastest, track revenue trends, and understand your golfer mix at a glance." delay={160} />
              <FeatureCard icon={<IconShield size={20} />} title="Works with your POS" description="Run Match Play alongside your existing system. PMS integrations are on the roadmap." delay={240} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Match Play (comparison) ──────────────────────── */}
      <section className="section">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Why Match Play</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              The math the legacy sites don&apos;t want you to do
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Tee-time middlemen take a cut of every booking and own your golfers. We flipped the model.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-12 mx-auto max-w-3xl grid grid-cols-[1.4fr_1fr_1fr] overflow-hidden card">
            {/* header row */}
            <div className="p-5 sm:p-6" />
            <div className="p-5 sm:p-6 text-center" style={{ background: "var(--surface-2)" }}>
              <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>Legacy sites</span>
            </div>
            <div className="p-5 sm:p-6 text-center" style={{ background: "var(--grad-brand)" }}>
              <span className="text-sm font-bold text-white">Match Play</span>
            </div>

            {[
              ["Per-booking commission", "3–5% + fees", "$0"],
              ["Who owns the golfer", "The platform", "You do"],
              ["Set your own pricing", false, true],
              ["Payouts", "Net terms", "~2 days"],
              ["Last-minute fills", true, true],
              ["Scoring & handicaps", false, true],
            ].map(([label, legacy, mp], i) => (
              <Row key={i} label={label as string} legacy={legacy} mp={mp} last={i === 5} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Savings calculator ───────────────────────────────── */}
      <section id="savings" className="section">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Savings calculator</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              See what you&apos;re really paying
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Drag the sliders to match your course. We&apos;ll show what a commission-based platform costs you
              today versus a flat Match Play subscription.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-12 max-w-4xl mx-auto">
            <SavingsCalculator />
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Pricing</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>Simple, honest pricing</h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Browse every tee time free. Subscribe to book and play. Courses pay one flat rate — never commission.
            </p>
          </Reveal>

          <p className="mt-10 text-center text-xs font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>For golfers</p>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Reveal className="card p-8 flex flex-col">
              <span className="chip self-start" style={{ background: "var(--surface-3)", color: "var(--brand)" }}>Free · Browse</span>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ fontFamily: "var(--font-sora)" }}>$0</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>forever</span>
              </div>
              <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>See every tee time near you. Subscribe when you&apos;re ready to play.</p>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {["Live tee times & green fees", "Course profiles & info", "Search by date, time & players"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
              <a href="#waitlist" className="btn btn-ghost mt-8 w-full">Join free</a>
            </Reveal>

            <Reveal delay={80} className="card p-8 flex flex-col relative overflow-hidden" style={{ borderColor: "var(--brand)", boxShadow: "var(--shadow-lg)" }}>
              <span className="absolute top-5 right-5 chip" style={{ background: "var(--grad-brand)", color: "#fff" }}>Most popular</span>
              <span className="chip self-start" style={{ background: "var(--surface-3)", color: "var(--brand)" }}>Match Play+ · Play</span>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-5xl font-extrabold grad-text" style={{ fontFamily: "var(--font-sora)" }}>$9.99</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>/mo</span>
              </div>
              <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Your whole golf app — book, score, and track every round.</p>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {["Book tee times in two taps", "Match & stroke-play scoring", "Handicap tracking & round stats", "Local leaderboards", "Find partners & deal alerts"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
              <a href="#waitlist" className="btn btn-primary mt-8 w-full">Get early access</a>
            </Reveal>

            <Reveal delay={160} className="card p-8 flex flex-col">
              <span className="chip self-start" style={{ background: "var(--surface-3)", color: "var(--gold)" }}>Match Play Pro · Compete</span>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ fontFamily: "var(--font-sora)" }}>$19.99</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>/mo</span>
              </div>
              <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>For competitors and organizers who live on the leaderboard.</p>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {["Everything in Match Play+", "State & national leaderboards", "Ranked matches & private groups", "Advanced analytics & GHIN sync", "Host games & run tournaments"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
              <a href="#waitlist" className="btn btn-ghost mt-8 w-full">Go Pro</a>
            </Reveal>
          </div>

          <p className="mt-12 text-center text-xs font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>For courses</p>
          <Reveal delay={120} className="mt-5 max-w-5xl mx-auto card p-8 relative overflow-hidden" style={{ borderColor: "var(--gold)" }}>
            <span className="absolute top-6 right-6 chip" style={{ background: "var(--grad-gold)", color: "#3a2c05" }}>Founding pricing</span>
            <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 items-center">
              <div>
                <span className="chip self-start" style={{ background: "var(--grad-brand)", color: "#fff" }}>Courses</span>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-5xl font-extrabold grad-text" style={{ fontFamily: "var(--font-sora)" }}>From $99</span>
                  <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>/mo · founding</span>
                </div>
                <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>One predictable subscription, never a cut of your bookings. Keep 100% of every green fee — early partners lock in founding rates for life.</p>
                <a href="#waitlist" className="btn btn-primary mt-7">Request early access</a>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {["0% commission on bookings", "Full tee-sheet & pricing control", "Stripe Connect payouts (~2 days)", "Booking & revenue analytics", "Waitlist & last-minute fills", "Group & tournament bookings (soon)"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Founding members band ────────────────────────────── */}
      <section className="section">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Founding members</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>Get in before the first tee</h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              We&apos;re onboarding region by region. Early members shape the product and lock in perks for good.
            </p>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <IconZap size={20} />, t: "Priority onboarding", d: "Skip the line when we launch in your area." },
              { icon: <IconDollar size={20} />, t: "Founding pricing", d: "Lock in early-partner rates for life." },
              { icon: <IconUsers size={20} />, t: "A direct line", d: "Talk to the team building it, not a ticket queue." },
              { icon: <IconStar size={20} />, t: "Shape the roadmap", d: "Vote on features and integrations first." },
            ].map((p, i) => (
              <FeatureCard key={p.t} icon={p.icon} title={p.t} description={p.d} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>Questions, answered</h2>
          </Reveal>
          <Reveal delay={80}><Faq /></Reveal>
        </div>
      </section>

      {/* ── Waitlist CTA ─────────────────────────────────────── */}
      <section id="waitlist" className="section">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl mesh-deep noise" style={{ boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-strong)" }}>
            <div className="relative grid lg:grid-cols-2 gap-10 p-8 sm:p-12 lg:p-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-5xl font-bold text-white">Be first on the tee</h2>
                <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
                  Join the waitlist and we&apos;ll reach out the moment we&apos;re live near you. Tell us whether you play or run a course.
                </p>
                <div className="mt-7 flex flex-col gap-3 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {["Browse tee times free — subscribe to play", "Zero commission for courses", "Founding members lock in perks"].map((t) => (
                    <span key={t} className="inline-flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}><IconCheck size={13} /></span>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-8">
                  <AppBadges />
                </div>
              </div>
              <div className="theme-light rounded-2xl p-6 sm:p-7" style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)" }}>
                <WaitlistForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t mt-auto" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="container py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size={30} />
            <p className="mt-4 text-sm max-w-xs" style={{ color: "var(--muted)" }}>
              Zero-commission golf booking and match-play scoring, built for modern courses and the golfers who love them.
            </p>
          </div>
          <FooterCol title="Product" links={[["For Golfers", "#golfers"], ["For Courses", "#courses"], ["Pricing", "#pricing"], ["How it works", "#how"]]} />
          <FooterCol title="Company" links={[["FAQ", "#faq"], ["Join waitlist", "#waitlist"]]} />
          <FooterCol title="Legal" links={[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]]} />
        </div>
        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "var(--muted)" }}>© {new Date().getFullYear()} Match Play. All rights reserved.</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Made for golfers, by golfers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── More helpers (kept below for readability) ────────────────────────────────

function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-2)" }}>
      <span className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }}><IconCheck size={16} /></span>
      {children}
    </li>
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
      <div className="p-5 sm:p-6 flex items-center text-sm font-medium" style={{ ...border, color: "var(--text)" }}>{label}</div>
      <div className="p-5 sm:p-6 flex items-center justify-center text-center" style={{ ...border, background: "var(--surface-2)" }}><Cell value={legacy} /></div>
      <div className="p-5 sm:p-6 flex items-center justify-center text-center" style={{ ...border, background: "var(--grad-brand)" }}><Cell value={mp} accent /></div>
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
