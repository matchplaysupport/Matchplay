"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { resolveTier, hasPro } from "@/lib/golfer-session";

type NewTournament = {
  name: string;
  format: string;
  startsAt: string; // ISO
  holes: number;
  maxPlayers: number;
  buyInCents: number;
  prizeDistribution: string;
  courseName: string;
  description: string;
};

const FORMATS = ["stroke_play", "match_play", "stableford", "scramble"];
const PRIZES = ["no_prize", "winner_takes_all", "top3_split"];

type Result = { ok: true; id: string } | { ok: false; error: string };

/** Creates a tournament (or scramble — same table, format='scramble') owned by
 *  the signed-in golfer and registers them as the first player. Pro-gated. */
export async function createTournament(input: NewTournament): Promise<Result> {
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Give your event a name." };
  if (!FORMATS.includes(input.format)) return { ok: false, error: "Pick a valid format." };
  if (!PRIZES.includes(input.prizeDistribution)) return { ok: false, error: "Pick a valid prize option." };
  if (![9, 18].includes(input.holes)) return { ok: false, error: "Holes must be 9 or 18." };
  if (!Number.isInteger(input.maxPlayers) || input.maxPlayers < 2 || input.maxPlayers > 144) {
    return { ok: false, error: "Max players must be between 2 and 144." };
  }
  const startsAt = new Date(input.startsAt);
  if (isNaN(startsAt.getTime())) return { ok: false, error: "Pick a valid start date and time." };
  const buyIn = Math.max(0, Math.round(input.buyInCents || 0));

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

  if (!hasPro(await resolveTier(supabase, profile.id))) {
    return { ok: false, error: "Hosting events is a Clubhouse Pro feature." };
  }

  const { data: created, error: insErr } = await supabase
    .from("tournaments")
    .insert({
      name,
      creator_id: profile.id,
      course_name: input.courseName?.trim() || null,
      starts_at: startsAt.toISOString(),
      format: input.format,
      holes: input.holes,
      max_players: input.maxPlayers,
      buy_in_cents: buyIn,
      prize_distribution: input.prizeDistribution,
      description: input.description?.trim() || null,
      status: "open",
    })
    .select("id")
    .single();
  if (insErr || !created) return { ok: false, error: "Couldn't create the event. Please try again." };

  // Register the host as the first player (ignore if it fails — event still exists).
  await supabase
    .from("tournament_players")
    .insert({ tournament_id: created.id, player_id: profile.id, payment_status: "registered" });

  revalidatePath("/golfer/tournaments");
  return { ok: true, id: created.id };
}
