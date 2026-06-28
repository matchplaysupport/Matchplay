"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconUsers } from "./icons";
import { track } from "../../lib/track";

type Audience = "golfer" | "course";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fireConfetti() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }

  const colors = ["#1FA055", "#15803D", "#EFC04A", "#D29B22", "#22A85B"];
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.42;
  const parts = Array.from({ length: 130 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[(Math.random() * colors.length) | 0],
      life: 1,
    };
  });

  const start = performance.now();
  function frame(now: number) {
    const elapsed = now - start;
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.vy += 0.22;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life = Math.max(0, 1 - elapsed / 1500);
      ctx!.save();
      ctx!.globalAlpha = p.life;
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    }
    if (elapsed < 1600) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}

export function WaitlistCount({ className = "" }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/waitlist/count")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && typeof d?.count === "number") setCount(d.count); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if (count === null || count < 1) return null;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <IconUsers size={15} />
      <strong>{count.toLocaleString()}</strong>&nbsp;already on the list
    </span>
  );
}

export function WaitlistForm({ defaultAudience = "golfer" }: { defaultAudience?: Audience }) {
  const [audience, setAudience] = useState<Audience>(defaultAudience);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hp = useRef<HTMLInputElement>(null); // honeypot

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (!EMAIL_RE.test(email)) return setError("Please enter a valid email address.");
    if (hp.current?.value) { setSubmitted(true); return; } // bot trap

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), audience, company: hp.current?.value ?? "" }),
      });
      if (!res.ok) throw new Error();
      track("waitlist_signup", { audience });
      setSubmitted(true);
      fireConfetti();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="card p-7 text-center" style={{ background: "var(--surface)" }}>
        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: "var(--grad-brand)" }}>
          <IconCheck size={26} />
        </div>
        <p className="mt-4 font-bold text-xl" style={{ fontFamily: "var(--font-sora)" }}>You&apos;re on the list! ⛳️</p>
        <p className="text-sm mt-1.5" style={{ color: "var(--muted)" }}>
          We&apos;ll reach out with early access as soon as we&apos;re live in your area.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          <a
            className="btn btn-ghost"
            style={{ padding: "0.6rem 1.1rem", fontSize: "0.85rem" }}
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just joined the @MatchPlay waitlist — zero-commission golf tee times 🏌️ matchplay.golf")}`}
            target="_blank" rel="noopener noreferrer"
            onClick={() => track("waitlist_share", { network: "x" })}
          >
            Share on X
          </a>
          <button className="btn btn-ghost" style={{ padding: "0.6rem 1.1rem", fontSize: "0.85rem" }} onClick={() => { setSubmitted(false); setName(""); setEmail(""); }}>
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Audience toggle */}
      <div className="inline-flex rounded-xl p-1 gap-1 mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        {(["golfer", "course"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAudience(a)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={audience === a ? { background: "var(--surface)", color: "var(--brand)", boxShadow: "var(--shadow-sm)" } : { color: "var(--muted)" }}
          >
            {a === "golfer" ? "I'm a Golfer" : "I Run a Course"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        {/* honeypot — hidden from humans */}
        <input ref={hp} type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

        <input
          type="text" placeholder={audience === "course" ? "Course name" : "Your name"}
          value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-colors"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        <input
          type="email" placeholder="Email address" inputMode="email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-colors"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        {error && <p className="text-sm font-medium" style={{ color: "#c0392b" }}>{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
          {loading ? "Joining…" : audience === "course" ? "Request early access" : "Join the waitlist"}
        </button>
      </form>
      <p className="mt-3 text-xs text-center" style={{ color: "var(--muted)" }}>No spam. Unsubscribe any time.</p>
    </div>
  );
}
