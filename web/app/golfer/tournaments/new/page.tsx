import Link from "next/link";
import { PortalShell, Notice, ProfileSetupNotice } from "../../_components/PortalShell";
import { loadGolfer, hasPro } from "@/lib/golfer-session";
import CreateTournamentForm from "./CreateTournamentForm";

export const metadata = { title: "Host an event · The Clubhouse" };

export default async function NewTournamentPage() {
  const { profile, tier } = await loadGolfer();
  if (!profile) {
    return <PortalShell active="/golfer/tournaments"><ProfileSetupNotice /></PortalShell>;
  }
  if (!hasPro(tier)) {
    return (
      <PortalShell active="/golfer/tournaments">
        <Notice
          title="Hosting events is a Clubhouse Pro feature"
          body="Upgrade to Clubhouse Pro to create tournaments and scrambles, invite players, and run the leaderboard."
          cta={{ href: "/golfer#pricing", label: "See plans" }}
        />
      </PortalShell>
    );
  }

  return (
    <PortalShell active="/golfer/tournaments">
      <Link href="/golfer/tournaments" style={{ fontSize: "0.82rem", color: "var(--muted)" }}>← Back to tournaments</Link>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", margin: "0.5rem 0 1.5rem" }}>Host an event</h1>
      <CreateTournamentForm />
    </PortalShell>
  );
}
