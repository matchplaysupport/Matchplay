import AdminLoginForm from "./AdminLoginForm";

export const metadata = { title: "Operator Sign In · The Clubhouse" };

export default function AdminLoginPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "1.5rem",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⛳</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.375rem" }}>
            Course operator portal
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Sign in to manage your tee sheet and bookings.
          </p>
        </div>
        <AdminLoginForm />
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--muted)" }}>
          Not yet a partner?{" "}
          <a href="/#waitlist" style={{ color: "var(--brand)", fontWeight: 600 }}>
            Apply for early access
          </a>
        </p>
      </div>
    </div>
  );
}
