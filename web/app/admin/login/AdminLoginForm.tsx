"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-2)" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@yourcourse.com"
            style={{
              padding: "0.65rem 0.875rem", borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text)", fontSize: "0.9rem", outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-2)" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              padding: "0.65rem 0.875rem", borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text)", fontSize: "0.9rem", outline: "none",
            }}
          />
        </div>
        {error && (
          <p style={{ fontSize: "0.8rem", color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "0.5rem 0.75rem" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}
