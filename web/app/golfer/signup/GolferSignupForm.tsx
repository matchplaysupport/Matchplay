"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { ensureGolferProfile } from "@/lib/golfer-profile";

const inputStyle: React.CSSProperties = {
  padding: "0.65rem 0.875rem", borderRadius: 10, border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontSize: "0.9rem", outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-2)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function GolferSignupForm() {
  const [form, setForm] = useState({
    email: "", password: "", displayName: "", username: "", city: "", state: "", zipCode: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          display_name: form.displayName,
          username: form.username,
          city: form.city,
          state: form.state,
          zip_code: form.zipCode,
        },
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    // Session present → email confirmation is disabled, so create the profile now.
    if (data.session && data.user) {
      await ensureGolferProfile(supabase, data.user);
      router.push("/golfer/stats");
      router.refresh();
      return;
    }
    // Otherwise the user must confirm their email; the profile is created on
    // first sign-in via ensureGolferProfile.
    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="card" style={{ padding: "1.75rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📧</p>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
          Check your email
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>
          We sent a confirmation link to <strong>{form.email}</strong>. Confirm it, then{" "}
          <a href="/golfer/login" style={{ color: "var(--brand)", fontWeight: 600 }}>sign in</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Field label="Email">
          <input type="email" value={form.email} onChange={set("email")} required placeholder="you@example.com" style={inputStyle} />
        </Field>
        <Field label="Password">
          <input type="password" value={form.password} onChange={set("password")} required minLength={6} placeholder="At least 6 characters" style={inputStyle} />
        </Field>
        <Field label="Display name">
          <input value={form.displayName} onChange={set("displayName")} required placeholder="Jordan Smith" style={inputStyle} />
        </Field>
        <Field label="Username">
          <input value={form.username} onChange={set("username")} required placeholder="jsmith" style={inputStyle} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px", gap: "0.75rem" }}>
          <Field label="City">
            <input value={form.city} onChange={set("city")} required placeholder="Nashville" style={inputStyle} />
          </Field>
          <Field label="State">
            <input value={form.state} onChange={set("state")} required maxLength={2} placeholder="TN" style={inputStyle} />
          </Field>
          <Field label="ZIP">
            <input value={form.zipCode} onChange={set("zipCode")} required placeholder="37212" style={inputStyle} />
          </Field>
        </div>
        {error && (
          <p style={{ fontSize: "0.8rem", color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "0.5rem 0.75rem" }}>
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </div>
    </form>
  );
}
