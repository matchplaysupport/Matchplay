import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { BoardParticipant, BoardScore, HolePars } from "@/lib/scoreboard";
import Scoreboard from "./Scoreboard";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("name").eq("slug", slug).maybeSingle();
  const name = data?.name ?? "Live scoreboard";
  return {
    title: `${name} — Live Scores`,
    description: `Live leaderboard for ${name}. Scores update in real time.`,
  };
}

export default async function LiveEventPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name, holes, status, course_id, public_scoreboard")
    .eq("slug", slug)
    .maybeSingle();

  if (!event || !event.public_scoreboard) notFound();

  const [participantsRes, scoresRes, holesRes] = await Promise.all([
    supabase
      .from("event_participants")
      .select("id, display_name, group_no, status")
      .eq("event_id", event.id),
    supabase
      .from("live_scores")
      .select("participant_id, hole_number, strokes")
      .eq("event_id", event.id),
    event.course_id
      ? supabase.from("course_holes").select("hole_number, par").eq("course_id", event.course_id)
      : Promise.resolve({ data: [] as { hole_number: number; par: number }[] }),
  ]);

  const participants: BoardParticipant[] = (participantsRes.data ?? []).map((p) => ({
    id: p.id,
    displayName: p.display_name,
    groupNo: p.group_no,
    status: p.status,
  }));

  const initialScores: BoardScore[] = (scoresRes.data ?? []).map((s) => ({
    participantId: s.participant_id,
    holeNumber: s.hole_number,
    strokes: s.strokes,
  }));

  const pars: HolePars = {};
  for (const h of holesRes.data ?? []) pars[h.hole_number] = h.par;

  return (
    <Scoreboard
      eventId={event.id}
      eventName={event.name}
      status={event.status}
      holes={event.holes}
      participants={participants}
      pars={pars}
      initialScores={initialScores}
    />
  );
}
