"use client";

import Image from "next/image";
import { Nav } from "../components/Nav";
import { Reveal } from "../components/motion";
import { WaitlistForm } from "../components/WaitlistForm";
import { PhoneMockup } from "../components/Mockups";
import { Logo } from "../components/Logo";
import { ThemeProvider } from "../components/ThemeProvider";
import {
  IconSearch, IconTrophy, IconBell, IconMapPin, IconFlag,
  IconCard, IconCheck, IconArrow, IconStar, IconZap, IconUsers, IconChevron,
} from "../components/icons";
import { useState } from "react";
import type { ReactNode } from "react";

// ── Shared helpers ────────────────────────────────────────────────────────────

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
          style={{ background: "var(--grad-brand)" }}
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
      <Pill top="Coming soon to the" bottom="App Store"
        glyph={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.36 1.43c.07 1-.32 1.96-.94 2.66-.65.74-1.7 1.31-2.71 1.23-.09-.97.37-1.98.96-2.62.66-.72 1.79-1.26 2.69-1.27zM19.9 17.2c-.52 1.2-.77 1.73-1.44 2.79-.94 1.48-2.26 3.32-3.9 3.33-1.45.01-1.83-.95-3.8-.94-1.97.01-2.38.96-3.84.95-1.64-.02-2.89-1.68-3.83-3.16-2.62-4.13-2.9-8.98-1.28-11.56 1.15-1.83 2.97-2.9 4.68-2.9 1.74 0 2.84.96 4.28.96 1.4 0 2.25-.96 4.27-.96 1.52 0 3.13.83 4.28 2.26-3.76 2.06-3.15 7.43.6 9.18z" /></svg>}
      />
      <Pill top="Coming soon to" bottom="Google Play"
        glyph={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.6 2.2c-.3.3-.5.7-.5 1.3v17c0 .6.2 1 .5 1.3l9.2-9.8L3.6 2.2zm12.3 6.2L5.3 2.3 14.9 8l1 0.4zm3.4 2.3-2.6-1.5-2.4 2.5 2.4 2.5 2.7-1.5c.8-.5.8-1.9-.1-2.5zM5.3 21.7l10.6-6.1-1.9-2-8.7 8.1z" /></svg>}
      />
    </div>
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

// ── Nav links for this page ───────────────────────────────────────────────────

const GOLFER_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "/course", label: "For Courses" },
];

const GOLFER_FAQ = [
  {
    q: "How much does The Clubhouse cost golfers?",
    a: "Browsing tee times is completely free. To book and play, subscribe to Clubhouse+ ($9.99/mo) — that gives you booking, match-play scoring, handicap tracking, and local leaderboards. Clubhouse Pro ($19.99/mo) adds state and national leaderboards, private groups, and tournament hosting. You only ever pay the course's green fee on top of your plan — no per-booking fees.",
  },
  {
    q: "What scoring formats does the app support?",
    a: "Match play and stroke play are both built in, with automatic handicap adjustment. Live leaderboards update hole by hole so your group can see who's up and by how much.",
  },
  {
    q: "Can I browse courses without subscribing?",
    a: "Yes — you can see live tee-time availability and green fees near you with a free account. Subscribing unlocks booking and the scoring/handicap features.",
  },
  {
    q: "When is the app available?",
    a: "We're rolling out region by region right now. Join the waitlist and we'll reach out the moment we're live in your area. Early members get priority access.",
  },
  {
    q: "Does it track my GHIN handicap?",
    a: "GHIN sync is on the roadmap for Clubhouse Pro. Until then, the app maintains its own handicap index based on every round you record.",
  },
];

// ── The page ─────────────────────────────────────────────────────────────────

function GolferFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-3">
      {GOLFER_FAQ.map((item, i) => {
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

function GolferPage() {
  return (
    <>
      <Nav
        links={GOLFER_LINKS}
        ctaLabel="Join the waitlist"
        ctaHref="#waitlist"
        logoHref="/golfer"
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 kenburns">
            <Image
              src="/hero-course.png"
              alt="A golf course fairway at golden hour"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center 45%" }}
            />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,13,9,0.62) 0%, rgba(6,13,9,0.30) 42%, rgba(6,13,9,0.88) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(96deg, rgba(6,13,9,0.86) 0%, rgba(6,13,9,0.25) 52%, transparent 100%)" }} />
        </div>

        <div className="container relative z-10 flex flex-col justify-center" style={{ minHeight: "88vh", paddingTop: "5rem", paddingBottom: "5rem" }}>
          <div className="max-w-2xl">
            <Reveal>
              <div className="flex items-center gap-3.5 mb-7">
                <span className="gold-rule" />
                <span className="text-[0.72rem] font-semibold uppercase" style={{ color: "var(--gold)", letterSpacing: "0.22em" }}>
                  For golfers · Free to browse
                </span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-[2.7rem] sm:text-6xl lg:text-[4.5rem] leading-[1.04]" style={{ color: "#F6F1E6" }}>
                Find your round.<br />
                <span className="grad-text" style={{ fontStyle: "italic" }}>Win the match.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-lg sm:text-xl leading-relaxed max-w-xl" style={{ color: "rgba(244,239,227,0.82)" }}>
                Browse courses near you, book in two taps, and track every score
                with your group — match play, stroke play, handicaps, and
                leaderboards built in.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#waitlist" className="btn btn-gold">Join the waitlist <IconArrow size={18} /></a>
                <a href="#how" className="btn btn-light">See how it works</a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.82rem]" style={{ color: "rgba(244,239,227,0.64)" }}>
                {["Free to browse", "No per-booking fees", "iOS & Android"].map((t, i) => (
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

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="section" style={{ background: "var(--surface)", scrollMarginTop: "72px" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              On the course in three steps
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              From discovery to the first tee — all in the app.
            </p>
          </Reveal>

          <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal className="rounded-3xl p-7 sm:p-9" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex flex-col gap-8">
                <Step n="1" icon={<IconSearch size={18} />} title="Search nearby courses" body="Filter by date, time, players, and price. Compare live availability and sort by distance — all in one feed." />
                <Step n="2" icon={<IconCard size={18} />} title="Book & pay in two taps" body="Reserve your slot and pay securely in-app. No phone calls, no booking fees, no surprises at the counter." />
                <Step n="3" icon={<IconFlag size={18} />} title="Play & track the match" body="Keep score in match or stroke play, update your handicap automatically, and settle it on the leaderboard." />
              </div>
            </Reveal>

            <Reveal delay={120} className="flex justify-center">
              <div className="relative" style={{ transform: "scale(0.9)", transformOrigin: "center" }}>
                <div
                  aria-hidden
                  className="absolute -inset-8 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)" }}
                />
                <div className="theme-light relative">
                  <PhoneMockup />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="section" style={{ scrollMarginTop: "72px" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Features</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              Your whole golf life, one app
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              The app stays on your home screen because it does far more than book a tee time.
            </p>
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={<IconSearch size={20} />} title="Smart tee-time search" description="Filter by date, time, players, and price. Sort by distance or availability and book in seconds." />
            <FeatureCard icon={<IconTrophy size={20} />} title="Match-play scoring" description="Match and stroke play, automatic handicap tracking, and live leaderboards with your regular group." delay={80} />
            <FeatureCard icon={<IconBell size={20} />} title="Last-minute alerts" description="Get pinged when a slot opens at a course you love — and grab the deal before anyone else." delay={160} />
            <FeatureCard icon={<IconMapPin size={20} />} title="Courses near you" description="Discover new tracks while you travel, with real availability and transparent green-fee pricing." delay={240} />
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="section" style={{ background: "var(--surface)", scrollMarginTop: "72px" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Pricing</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              Free to explore. Subscribe to play.
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Browse every tee time for free. Subscribe when you&apos;re ready to book.
            </p>
          </Reveal>

          <div className="mt-10 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free tier */}
            <Reveal className="card p-7 flex flex-col">
              <span
                className="chip self-start"
                style={{ background: "var(--surface-3)", color: "var(--brand)" }}
              >
                Free · Browse
              </span>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}>$0</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>forever</span>
              </div>
              <p className="mt-3 min-h-10 text-sm" style={{ color: "var(--muted)" }}>
                See every tee time near you — subscribe when you&apos;re ready.
              </p>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {["Live tee times & green fees", "Course profiles & info", "Search by date, time & players"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
              <a href="#waitlist" className="btn btn-ghost mt-7 w-full">Join free</a>
            </Reveal>

            {/* Clubhouse+ */}
            <Reveal delay={80} className="card p-7 flex flex-col" style={{ borderColor: "var(--gold)", boxShadow: "var(--shadow-lg)" }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <span className="chip" style={{ background: "var(--surface-3)", color: "var(--gold)" }}>Clubhouse+</span>
                <span className="chip" style={{ background: "var(--grad-gold)", color: "#1A1206" }}>Most popular</span>
              </div>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ fontFamily: "var(--font-sora)", background: "var(--grad-gold)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>$9.99</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>/mo</span>
              </div>
              <p className="mt-3 min-h-10 text-sm" style={{ color: "var(--muted)" }}>
                Your whole golf app — book, score, and track every round.
              </p>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {["Book tee times in two taps", "Match & stroke-play scoring", "Handicap tracking & round stats", "Local leaderboards", "Find partners & deal alerts"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
              <a href="#waitlist" className="btn btn-gold mt-7 w-full">Get early access</a>
            </Reveal>

            {/* Clubhouse Pro */}
            <Reveal delay={160} className="card p-7 flex flex-col">
              <span
                className="chip self-start"
                style={{ background: "var(--surface-3)", color: "var(--gold)" }}
              >
                Clubhouse Pro
              </span>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}>$19.99</span>
                <span className="text-sm mb-2" style={{ color: "var(--muted)" }}>/mo</span>
              </div>
              <p className="mt-3 min-h-10 text-sm" style={{ color: "var(--muted)" }}>
                For competitors and organizers who live on the leaderboard.
              </p>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {["Everything in Clubhouse+", "State & national leaderboards", "Ranked matches & private groups", "Advanced analytics & GHIN sync", "Host games & run tournaments"].map((f) => (
                  <Check key={f}>{f}</Check>
                ))}
              </ul>
              <a href="#waitlist" className="btn btn-ghost mt-7 w-full">Go Pro</a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Founding perks ───────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Early access</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              Get in before the first tee
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              We&apos;re onboarding region by region. Early members shape the product and lock in perks for good.
            </p>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <IconZap size={20} />, t: "Priority onboarding", d: "Skip the line when we launch in your area." },
              { icon: <IconStar size={20} />, t: "Founding member rate", d: "Lock in the lowest price — no increases as we grow." },
              { icon: <IconUsers size={20} />, t: "Direct line to the team", d: "Talk to the people building it, not a ticket queue." },
              { icon: <IconTrophy size={20} />, t: "Shape the roadmap", d: "Vote on features and integrations first." },
            ].map((p, i) => (
              <FeatureCard key={p.t} icon={p.icon} title={p.t} description={p.d} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="section" style={{ background: "var(--surface)", scrollMarginTop: "72px" }}>
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold" style={{ color: "var(--text)" }}>
              Questions, answered
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <GolferFaq />
          </Reveal>
        </div>
      </section>

      {/* ── Waitlist CTA ─────────────────────────────────────── */}
      <section id="waitlist" className="section" style={{ scrollMarginTop: "72px" }}>
        <div className="container">
          <div
            className="relative overflow-hidden rounded-3xl mesh-deep noise"
            style={{ boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-strong)" }}
          >
            <div className="relative grid lg:grid-cols-2 gap-10 p-8 sm:p-12 lg:p-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-5xl font-bold text-white">Be first on the tee</h2>
                <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
                  Join the waitlist and we&apos;ll reach out the moment we&apos;re live near you.
                </p>
                <div className="mt-7 flex flex-col gap-3 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {["Browse tee times free — subscribe to play", "No per-booking fees, ever", "Founding members lock in the lowest rate"].map((t) => (
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
                <div className="mt-8">
                  <AppBadges />
                </div>
              </div>
              <div
                className="theme-light rounded-2xl p-6 sm:p-7"
                style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
              >
                <WaitlistForm defaultAudience="golfer" />
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
            <Logo size={30} />
            <p className="mt-4 text-sm max-w-xs" style={{ color: "var(--muted)" }}>
              Zero-commission golf booking and match-play scoring, built for modern courses and the golfers who love them.
            </p>
          </div>
          <FooterCol title="Golfer" links={[["How it works", "#how"], ["Features", "#features"], ["Pricing", "#pricing"], ["FAQ", "#faq"]]} />
          <FooterCol title="Platform" links={[["For Courses", "/course"], ["Join waitlist", "#waitlist"]]} />
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

export default function GolferLandingPage() {
  return (
    <ThemeProvider>
      <GolferPage />
    </ThemeProvider>
  );
}
