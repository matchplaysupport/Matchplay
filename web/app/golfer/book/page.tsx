import { PortalShell, Notice, ProfileSetupNotice } from "../_components/PortalShell";
import { loadGolfer, hasPlus } from "@/lib/golfer-session";
import BookButton from "./BookButton";

export const metadata = { title: "Book a tee time · The Clubhouse" };

type TeeRow = {
  id: string;
  starts_at: string;
  price_cents: number;
  available_spots: number;
  holes: number;
  cart_included: boolean;
  walking_allowed: boolean;
  courses: { name: string; city: string; state: string } | null;
};

export default async function BookPage() {
  const { supabase, profile, tier } = await loadGolfer();

  if (!profile) {
    return <PortalShell active="/golfer/book"><ProfileSetupNotice /></PortalShell>;
  }
  if (!hasPlus(tier)) {
    return (
      <PortalShell active="/golfer/book">
        <Notice
          title="Booking is a Clubhouse+ feature"
          body="Upgrade to Clubhouse+ to book tee times right from the web — no per-booking fees, ever."
          cta={{ href: "/golfer#pricing", label: "See plans" }}
        />
      </PortalShell>
    );
  }

  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("tee_times")
    .select("id, starts_at, price_cents, available_spots, holes, cart_included, walking_allowed, courses(name, city, state)")
    .gt("available_spots", 0)
    .gt("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(40);

  const tees = ((data ?? []) as unknown as TeeRow[]).filter((t) => t.courses);

  return (
    <PortalShell active="/golfer/book">
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>Book a tee time</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem", marginBottom: "1.75rem" }}>
        Live availability near you. You only ever pay the course&apos;s green fee — no per-booking fees.
      </p>

      {tees.length === 0 ? (
        <Notice title="No open tee times right now" body="Check back soon — new availability is added throughout the day." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {tees.map((t) => {
            const dt = new Date(t.starts_at);
            return (
              <div key={t.id} className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{t.courses?.name}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.15rem" }}>
                    {t.courses?.city}, {t.courses?.state} · {dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <p style={{ fontSize: "0.74rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    {t.holes} holes · {t.available_spots} spot{t.available_spots !== 1 ? "s" : ""} left · {t.cart_included ? "cart included" : t.walking_allowed ? "walking ok" : "cart"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text)" }}>${(t.price_cents / 100).toFixed(0)}</p>
                  <p style={{ fontSize: "0.68rem", color: "var(--muted)" }}>per player</p>
                </div>
                <BookButton teeTimeId={t.id} maxPlayers={t.available_spots} />
              </div>
            );
          })}
        </div>
      )}
    </PortalShell>
  );
}
