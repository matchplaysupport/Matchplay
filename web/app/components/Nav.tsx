"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { IconMenu, IconX } from "./icons";
import { track } from "../../lib/track";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#golfers", label: "For Golfers" },
  { href: "#courses", label: "For Courses" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(250,252,249,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <div className="container flex items-center justify-between h-16 sm:h-[68px]">
        <a href="#top" aria-label="Match Play home"><Logo size={30} /></a>

        <div className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium transition-colors hover:text-[var(--brand)]" style={{ color: "var(--text-2)" }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#waitlist"
            onClick={() => track("nav_cta_click")}
            className="btn btn-primary hidden sm:inline-flex"
            style={{ padding: "0.6rem 1.15rem", fontSize: "0.875rem" }}
          >
            Join the waitlist
          </a>
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden fixed inset-0 top-16 z-40" style={{ background: "var(--bg)" }}>
          <div className="container py-6 flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3.5 text-lg font-semibold border-b"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#waitlist"
              onClick={() => { setOpen(false); track("nav_cta_click", { source: "mobile" }); }}
              className="btn btn-primary mt-5 w-full"
            >
              Join the waitlist
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
