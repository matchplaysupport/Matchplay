import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export const metadata = { title: "Bookings · Match Play Admin" };

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: operator } = await supabase
    .from("course_operators")
    .select("course_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!operator) redirect("/admin/settings");

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id, confirmation_code, players, community_spots, status, created_at,
      tee_times!inner(starts_at, price_cents, holes, course_id),
      profiles(display_name, username)
    `)
    .eq("tee_times.course_id", operator.course_id)
    .order("created_at", { ascending: false })
    .limit(100);

  const STATUS_COLORS: Record<string, string> = {
    requested: "#D97706",
    confirmed: "var(--brand)",
    fulfilled: "var(--muted)",
    cancelled: "#DC2626",
    simulated_confirmed: "var(--muted)",
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>Bookings</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.2rem" }}>
          {bookings?.length ?? 0} total bookings
        </p>
      </div>

      {!bookings?.length ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
          <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>No bookings yet</p>
          <p style={{ fontSize: "0.875rem" }}>Bookings will appear here once golfers start reserving tee times.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                {["Confirmation", "Golfer", "Tee time", "Players", "Status", "Booked"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--muted)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const tt = b.tee_times as unknown as { starts_at: string; price_cents: number; holes: number } | null;
                const profile = b.profiles as unknown as { display_name: string; username: string } | null;
                const dt = tt ? new Date(tt.starts_at) : null;
                return (
                  <tr
                    key={b.id}
                    style={{ borderBottom: i < bookings.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 700, fontFamily: "monospace", color: "var(--brand)", fontSize: "0.8rem" }}>
                      {b.confirmation_code}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--text)" }}>
                      {profile?.display_name ?? "—"}
                      {profile?.username && (
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--muted)" }}>@{profile.username}</span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--text)", whiteSpace: "nowrap" }}>
                      {dt ? dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      {dt && (
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--muted)" }}>
                          {dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {tt?.holes}h
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--text)" }}>{b.players}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", padding: "0.2rem 0.6rem",
                        borderRadius: 99, fontSize: "0.72rem", fontWeight: 700,
                        background: `${STATUS_COLORS[b.status] ?? "var(--muted)"}18`,
                        color: STATUS_COLORS[b.status] ?? "var(--muted)",
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--muted)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                      {new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
