import Link from "next/link";
import GolferSignupForm from "./GolferSignupForm";

export const metadata = { title: "Create your golfer account" };

export default function GolferSignupPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem 1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⛳</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.375rem" }}>
            Join The Clubhouse
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Create your account to book tee times and track your game.
          </p>
        </div>

        <GolferSignupForm />

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/golfer/login" style={{ color: "var(--brand)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
