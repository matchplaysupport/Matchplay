"use client";

import { useRef, useState } from "react";
import { track } from "../../../lib/track";

const fieldStyle: React.CSSProperties = {
  padding: "0.65rem 0.875rem",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-2)" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function CourseSignupForm() {
  const [form, setForm] = useState({
    contactName: "", email: "", password: "",
    courseName: "", facilityName: "", city: "", state: "", zip: "", phone: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hp = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/signup/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company: hp.current?.value ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      track("signup_submit", { audience: "course" });
      setNeedsConfirm(data.needsConfirmation !== false);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{needsConfirm ? "📩" : "✅"}</div>
        <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", marginBottom: "0.5rem" }}>
          {needsConfirm ? "Check your email to confirm" : "Application received"}
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.5 }}>
          {needsConfirm ? (
            <>
              We sent a confirmation link to <strong>{form.email}</strong>. Confirm it, then sign in — your
              application for <strong>{form.courseName}</strong> is in review and we&apos;ll unlock your portal
              once it&apos;s approved.
            </>
          ) : (
            <>
              Your application for <strong>{form.courseName}</strong> is in review. We&apos;ll email{" "}
              <strong>{form.email}</strong> and unlock your portal once it&apos;s approved.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input ref={hp} type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

      <Field label="Your name">
        <input type="text" required value={form.contactName} onChange={set("contactName")} placeholder="Jane Smith" style={fieldStyle} />
      </Field>
      <Field label="Work email">
        <input type="email" required value={form.email} onChange={set("email")} placeholder="you@yourcourse.com" style={fieldStyle} />
      </Field>
      <Field label="Password">
        <input type="password" required value={form.password} onChange={set("password")} placeholder="At least 8 characters" style={fieldStyle} />
      </Field>
      <Field label="Course name">
        <input type="text" required value={form.courseName} onChange={set("courseName")} placeholder="Pebble Creek Golf Club" style={fieldStyle} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
        <Field label="City">
          <input type="text" required value={form.city} onChange={set("city")} style={fieldStyle} />
        </Field>
        <Field label="State">
          <input type="text" required value={form.state} onChange={set("state")} placeholder="CA" style={fieldStyle} />
        </Field>
        <Field label="ZIP">
          <input type="text" required value={form.zip} onChange={set("zip")} style={fieldStyle} />
        </Field>
      </div>
      <Field label="Phone (optional)">
        <input type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 123-4567" style={fieldStyle} />
      </Field>

      {error && (
        <p style={{ fontSize: "0.8rem", color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "0.5rem 0.75rem" }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Submitting…" : "Apply for early access"}
      </button>
      <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center" }}>
        We&apos;ll review your course and email you when your portal is ready.
      </p>
    </form>
  );
}
