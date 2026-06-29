"use client";

import { useState } from "react";
import { IconChevron } from "./icons";

const ITEMS = [
  {
    q: "How much does The Clubhouse cost golfers?",
    a: "Browsing tee times is free. To book and play, subscribe to Clubhouse+ ($9.99/mo) for booking, scoring, handicap tracking, and leaderboards, or Clubhouse Pro ($19.99/mo) for competitive play, advanced stats, and event hosting. You only ever pay the course's green fee on top of your plan -- no per-booking fees or markups.",
  },
  {
    q: "What is the catch with zero commission for courses?",
    a: "There is not one. Instead of taking a cut of every booking like legacy tee-time sites, The Clubhouse charges courses a simple flat monthly subscription. You keep 100% of your green fees and own your golfer relationships.",
  },
  {
    q: "Does The Clubhouse replace my existing tee-sheet or POS?",
    a: "No -- it works alongside it. The Clubhouse is a direct booking channel you control. Sync availability, set your own pricing rules, and fill last-minute gaps without disrupting your current setup. Deeper POS integrations (foreUP, Lightspeed) are on the roadmap.",
  },
  {
    q: "How do payouts work?",
    a: "Payments run through Stripe Connect. Golfers pay securely in-app and funds land in your account in about two business days -- no invoicing, no chasing.",
  },
  {
    q: "What is the scoring side about?",
    a: "Every round you book can be played in-app: match-play and stroke-play scoring, automatic handicap tracking, and live leaderboards with your regular group. It is the reason golfers keep the app on their home screen between bookings.",
  },
  {
    q: "When can I actually use it?",
    a: "We are onboarding courses and golfers region by region right now. Join the waitlist and we will reach out the moment we are live near you -- early members get priority access.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-3">
      {ITEMS.map((item, i) => {
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
