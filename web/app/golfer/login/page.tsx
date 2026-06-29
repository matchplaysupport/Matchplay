import GolferLoginForm from "./GolferLoginForm";

export const metadata = { title: "Sign In · The Clubhouse" };

export default function GolferLoginPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "1.5rem",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⛳</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.375rem" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Sign in to view your stats and handicap.
          </p>
        </div>
        <GolferLoginForm />
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--muted)" }}>
          New here?{" "}
          <a href="/golfer/signup" style={{ color: "var(--brand)", fontWeight: 600 }}>
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
