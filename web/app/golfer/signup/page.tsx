import GolferSignupForm from "./GolferSignupForm";

export const metadata = { title: "Create Account · The Clubhouse" };

export default function GolferSignupPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "1.5rem",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⛳</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.375rem" }}>
            Create your account
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Track your rounds, handicap, and stats.
          </p>
        </div>
        <GolferSignupForm />
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--muted)" }}>
          Already have an account?{" "}
          <a href="/golfer/login" style={{ color: "var(--brand)", fontWeight: 600 }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
