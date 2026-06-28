"use client";

import { useState } from "react";

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function IconCalendar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconDollar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" />
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4" /><path d="M18 9h2a2 2 0 0 0 2-2V5h-4" /><path d="M12 17v4" /><path d="M8 21h8" /><path d="M6 5v4a6 6 0 0 0 12 0V5H6z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Waitlist form ────────────────────────────────────────────────────────────

type Audience = "golfer" | "course";

function WaitlistForm({ audience }: { audience: Audience }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, audience }),
      });
      if (!res.ok) throw new Error("Something went wrong.");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
        <div className="text-3xl mb-2">⛳️</div>
        <p className="font-semibold text-lg" style={{ color: "var(--primary)" }}>You're on the list!</p>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>We'll reach out soon with early access details.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder={audience === "course" ? "Course name" : "Your name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full rounded-xl px-4 py-3 text-sm outline-none border focus:border-[var(--primary)]"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
      />
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded-xl px-4 py-3 text-sm outline-none border focus:border-[var(--primary)]"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
        style={{ background: "var(--primary)", color: "#fff" }}
      >
        {loading ? "Joining…" : audience === "course" ? "Request Early Access" : "Join the Waitlist"}
      </button>
    </form>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 p-6 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-alt)", color: "var(--primary)" }}>
        {icon}
      </div>
      <h3 className="font-semibold text-base" style={{ color: "var(--text)" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{description}</p>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-bold" style={{ color: "var(--primary)" }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [tab, setTab] = useState<Audience>("golfer");

  return (
    <div className="flex flex-col min-h-screen">

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(244,246,241,0.92)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛳</span>
            <span className="font-bold text-lg tracking-tight" style={{ color: "var(--primary)" }}>Match Play</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#courses" className="hidden sm:block text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>For Courses</a>
            <a href="#golfers" className="hidden sm:block text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>For Golfers</a>
            <a href="#waitlist" className="text-sm font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-80" style={{ background: "var(--primary)", color: "#fff" }}>
              Join Waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--primary-dark)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #27904F 0%, transparent 60%), radial-gradient(circle at 80% 20%, #C8981E 0%, transparent 50%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6" style={{ background: "rgba(200,152,30,0.2)", color: "var(--accent-light)", border: "1px solid rgba(200,152,30,0.3)" }}>
            ⚡ Now accepting early access applications
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight tracking-tight text-white max-w-3xl mx-auto">
            Golf booking,<br />
            <span style={{ color: "var(--accent-light)" }}>built for modern clubs</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
            Match Play connects golfers to tee times at their favourite courses — and gives course operators a simple, powerful tool to manage availability, pricing, and bookings.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#waitlist" className="px-8 py-4 rounded-full font-semibold text-base transition-opacity hover:opacity-90" style={{ background: "var(--accent)", color: "#fff" }}>
              Get Early Access
            </a>
            <a href="#courses" className="px-8 py-4 rounded-full font-semibold text-base transition-opacity hover:opacity-80" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <Stat value="0 fees" label="No booking commissions" />
          <Stat value="< 5 min" label="Setup for courses" />
          <Stat value="Stripe" label="Secure payouts" />
          <Stat value="iOS + Android" label="Golfer app" />
        </div>
      </section>

      {/* For Courses */}
      <section id="courses" className="py-20 sm:py-28" style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>For Course Operators</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Stop leaving tee times empty
            </h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              Match Play gives your course a direct booking channel with zero commission. Set your own pricing, control availability, and get paid instantly through Stripe.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={<IconCalendar />} title="Tee sheet management" description="Set available times, block hours, and manage walk-ins — all from one simple dashboard. No training required." />
            <FeatureCard icon={<IconDollar />} title="Zero commission" description="Keep 100% of your green fees. Match Play charges courses a flat monthly subscription — not a cut of every booking." />
            <FeatureCard icon={<IconChart />} title="Booking analytics" description="See which times fill fastest, track revenue trends, and understand your golfer mix without spreadsheets." />
          </div>
          <ul className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-8">
            {["Works alongside your existing POS", "Stripe Connect payouts in 2 days", "Waitlist & last-minute fills", "Group and tournament bookings (coming soon)"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--primary)" }}><IconCheck /></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* For Golfers */}
      <section id="golfers" className="py-20 sm:py-28" style={{ background: "var(--bg-alt)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl ml-auto text-right">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>For Golfers</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Find a tee time in seconds
            </h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              Search nearby courses, compare availability, and book your round in the Match Play app. Track your handicap, compete with friends, and never miss a last-minute deal.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={<IconSearch />} title="Smart tee time search" description="Filter by date, time, players, and price. Sort by distance or availability. Book in two taps." />
            <FeatureCard icon={<IconPhone />} title="Mobile-first app" description="Native iOS and Android app built for golfers. Your bookings, rounds, and scores — all in one place." />
            <FeatureCard icon={<IconTrophy />} title="Match play scoring" description="Built-in match play and stroke play scoring, handicap tracking, and leaderboards with your regular group." />
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="py-20 sm:py-28" style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Be first on the tee
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--muted)" }}>
              Join the waitlist and we'll reach out when we're ready to onboard in your area.
            </p>

            {/* Audience toggle */}
            <div className="mt-8 inline-flex rounded-xl p-1 gap-1" style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
              {(["golfer", "course"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setTab(a)}
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                  style={
                    tab === a
                      ? { background: "var(--primary)", color: "#fff" }
                      : { color: "var(--muted)" }
                  }
                >
                  {a === "golfer" ? "I'm a Golfer" : "I Run a Course"}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <WaitlistForm audience={tab} />
            </div>

            <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>
              No spam. Unsubscribe any time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-auto py-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⛳</span>
            <span className="font-bold" style={{ color: "var(--primary)" }}>Match Play</span>
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            © {new Date().getFullYear()} Match Play. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
