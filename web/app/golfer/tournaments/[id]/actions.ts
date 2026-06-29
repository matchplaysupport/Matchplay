"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

type Result = { ok: true } | { ok: false; error: string };

/** Registers the signed-in golfer as a player in an open tournament. */
export async function joinTournament(tournamentId: string): Promise<Result> {
  if (!tournamentId) return { ok: false, error: "Missing tournament." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!profile) return { ok: false, error: "Finish setting up your profile first." };

  const { data: t } = await supabase
    .from("tournaments")
    .select("status, max_players, tournament_players(count)")
    .eq("id", tournamentId)
    .maybeSingle();
  if (!t) return { ok: false, error: "Tournament not found." };
  if (t.status !== "open") return { ok: false, error: "This event isn't open for registration." };

  const count = (t.tournament_players as { count: number }[] | undefined)?.[0]?.count ?? 0;
  if (count >= t.max_players) return { ok: false, error: "This event is full." };

  const { error } = await supabase
    .from("tournament_players")
    .insert({ tournament_id: tournamentId, player_id: profile.id, payment_status: "registered" });
  // 23505 = already registered → treat as success.
  if (error && error.code !== "23505") return { ok: false, error: "Couldn't join. Please try again." };

  revalidatePath(`/golfer/tournaments/${tournamentId}`);
  revalidatePath("/golfer/tournaments");
  return { ok: true };
}
