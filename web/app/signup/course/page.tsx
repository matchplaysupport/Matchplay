import Link from "next/link";
import CourseSignupForm from "./CourseSignupForm";

export const metadata = { title: "Apply for early access · Courses" };

export default function CourseSignupPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem 1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⛳</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.375rem" }}>
            Bring your course to The Clubhouse
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Apply for early access. We review every course, then unlock your zero-commission tee sheet.
          </p>
        </div>

        <CourseSignupForm />

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--muted)" }}>
          Already a partner?{" "}
          <Link href="/admin/login" style={{ color: "var(--brand)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
