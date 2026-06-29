"use client";

import Link from "next/link";
import { Logo } from "./components/Logo";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { IconSun, IconMoon, IconArrow, IconFlag, IconCalendar } from "./components/icons";

// ── Theme toggle (reads context) ─────────────────────────────────────────────

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--text-2)",
      }}
    >
      {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  );
}

// ── Chooser content ──────────────────────────────────────────────────────────

function ChooserContent() {
  const { dark } = useTheme();

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Header */}
      <header className="container py-5 flex items-center justify-between">
        <Logo size={30} />
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-16 text-center">
        <span
          className="text-[0.72rem] font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--gold)" }}
        >
          Welcome to Match Play
        </span>

        <h1
          className="mt-5 text-4xl sm:text-6xl font-bold leading-[1.05] max-w-2xl"
          style={{ color: "var(--text)" }}
        >
          Golf booking & scoring
          <br />
          <span
            style={{
              background: dark ? "var(--grad-gold)" : "var(--grad-brand)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            built for everyone
          </span>
        </h1>

        <p className="mt-5 text-lg max-w-md" style={{ color: "var(--muted)" }}>
          Whether you play rounds or run a course, Match Play has you covered.
          Choose your path:
        </p>

        {/* Choice cards */}
        <div className="mt-12 grid sm:grid-cols-2 gap-6 max-w-2xl w-full text-left">
          {/* Golfer card */}
          <Link
            href="/golfer"
            className="group card card-hover p-8 flex flex-col gap-5"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "var(--grad-brand)", color: "#fff" }}
            >
              <IconFlag size={26} />
            </div>

            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                I&apos;m a Golfer
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                Find tee times near you, book in two taps, track match-play
                scores, and compete on leaderboards with your group.
              </p>
            </div>

            <span
              className="inline-flex items-center gap-2 text-sm font-semibold mt-auto"
              style={{ color: "var(--brand)" }}
            >
              Explore for golfers <IconArrow size={16} />
            </span>
          </Link>

          {/* Course card */}
          <Link
            href="/course"
            className="group card card-hover p-8 flex flex-col gap-5"
            style={{ borderColor: "var(--gold)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "var(--grad-gold)", color: "#1A1206" }}
            >
              <IconCalendar size={26} />
            </div>

            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                I Run a Course
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                Fill your tee sheet, set your own pricing, and keep 100% of every
                booking. Zero commission — one flat subscription.
              </p>
            </div>

            <span
              className="inline-flex items-center gap-2 text-sm font-semibold mt-auto"
              style={{ color: "var(--gold)" }}
            >
              Explore for courses <IconArrow size={16} />
            </span>
          </Link>
        </div>

        <p className="mt-10 text-xs" style={{ color: "var(--muted)" }}>
          Not sure?{" "}
          <Link href="/golfer" style={{ color: "var(--brand)" }}>
            See the golfer page
          </Link>
          {" or "}
          <Link href="/course" style={{ color: "var(--gold)" }}>
            the course page
          </Link>{" "}
          to learn more.
        </p>
      </main>

      {/* Footer */}
      <footer className="container py-6 flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          © {new Date().getFullYear()} Match Play. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
          <Link href="/privacy" className="hover:text-[var(--brand)] transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--brand)] transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <ChooserContent />
    </ThemeProvider>
  );
}
