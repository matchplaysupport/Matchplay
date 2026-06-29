import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
        {label}
      </p>
      <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.375rem" }}>{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: operator } = await supabase
    .from("course_operators")
    .select("course_id, courses(id, name, city, state)")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // No course yet → the operator is mid-application. Show its status.
  if (!operator) {
    const { data: application } = await supabase
      .from("course_applications")
      .select("course_name, status, review_notes, created_at")
      .eq("auth_user_id", user.id)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (application?.status === "pending") {
      return (
        <div style={{ padding: "3rem 2rem", maxWidth: 600 }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⏳</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Application under review</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            Thanks for applying{application.course_name ? ` for ${application.course_name}` : ""}! Our team is
            reviewing your course. We&apos;ll email you as soon as your tee-sheet portal is unlocked — usually
            within a couple of business days.
          </p>
        </div>
      );
    }

    if (application?.status === "rejected") {
      return (
        <div style={{ padding: "3rem 2rem", maxWidth: 600 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Application not approved</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: application.review_notes ? "1rem" : 0 }}>
            We weren&apos;t able to approve this application right now.
          </p>
          {application.review_notes && (
            <p style={{ color: "var(--text-2)", fontSize: "0.9rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.75rem 1rem" }}>
              {application.review_notes}
            </p>
          )}
        </div>
      );
    }

    return (
      <div style={{ padding: "3rem 2rem", maxWidth: 600 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Welcome to The Clubhouse</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          Your account isn&apos;t linked to a course yet. Apply for early access to set up your tee sheet.
        </p>
        <Link href="/signup/course" className="btn btn-primary">Apply for early access →</Link>
      </div>
    );
  }

  const courseId = operator.course_id;

  // Today's date range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [teeTimes, bookingsToday, upcomingSlots] = await Promise.all([
    supabase
      .from("tee_times")
      .select("id, starts_at, price_cents, available_spots, holes")
      .eq("course_id", courseId)
      .gte("starts_at", todayStart.toISOString())
      .lte("starts_at", todayEnd.toISOString())
      .order("starts_at"),

    supabase
      .from("bookings")
      .select("id, players, tee_times!inner(course_id, starts_at)")
      .eq("tee_times.course_id", courseId)
      .gte("tee_times.starts_at", todayStart.toISOString())
      .lte("tee_times.starts_at", todayEnd.toISOString()),

    supabase
      .from("tee_times")
      .select("id, starts_at, price_cents, available_spots, holes")
      .eq("course_id", courseId)
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(6),
  ]);

  const slotsToday = teeTimes.data?.length ?? 0;
  const bookingsCount = bookingsToday.data?.length ?? 0;
  const revenueCents = bookingsToday.data?.reduce((sum, b) => sum + (b.players ?? 0) * 0, 0) ?? 0;
  const nextSlots = upcomingSlots.data ?? [];

  const course = operator.courses as unknown as { name: string; city: string; state: string } | null;

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>
          {course?.name ?? "Dashboard"}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          {course?.city}, {course?.state} · Today is {todayStart.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard label="Slots today" value={slotsToday} />
        <StatCard label="Bookings today" value={bookingsCount} />
        <StatCard label="Revenue today" value={`$${Math.round(revenueCents / 100)}`} sub="Via Stripe (coming soon)" />
        <StatCard label="Upcoming slots" value={nextSlots.length} sub="Next 6 tee times" />
      </div>

      {/* Upcoming tee times */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Upcoming tee times</h2>
          <Link href="/admin/tee-sheet" style={{ fontSize: "0.8rem", color: "var(--brand)", fontWeight: 600 }}>
            Manage tee sheet →
          </Link>
        </div>

        {nextSlots.length === 0 ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            <p style={{ marginBottom: "1rem" }}>No upcoming tee times. Add some to start taking bookings.</p>
            <Link href="/admin/tee-sheet" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>
              Add tee times
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {nextSlots.map((slot) => {
              const dt = new Date(slot.starts_at);
              return (
                <div
                  key={slot.id}
                  className="card"
                  style={{ padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>
                      {dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      {" · "}
                      {dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.125rem" }}>
                      {slot.holes} holes · {slot.available_spots} spot{slot.available_spots !== 1 ? "s" : ""} available
                    </p>
                  </div>
                  <p style={{ fontWeight: 700, color: "var(--brand)", fontSize: "1rem" }}>
                    ${Math.round(slot.price_cents / 100)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
