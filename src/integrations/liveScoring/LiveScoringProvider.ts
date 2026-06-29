import {
  demoEventParticipants,
  demoLiveEvent,
  demoLiveScores,
  demoScorerGroupNo,
} from "@/features/courses/demoData";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import type { EventParticipant, LiveEvent, LiveScore } from "@/types/domain";

/** One score the scorer is submitting (event_id + entered_by are added by the provider). */
export interface ScoreInput {
  participantId: string;
  holeNumber: number;
  strokes: number;
}

export interface LiveScoringProvider {
  getEventBySlug(slug: string): Promise<LiveEvent | null>;
  listParticipants(eventId: string, groupNo?: number): Promise<EventParticipant[]>;
  /** Which group (if any) this profile may score. null group means whole-event. */
  getMyScorerGroup(eventId: string, profileId: string): Promise<{ groupNo: number | null } | null>;
  /** Events this profile is assigned to score — drives the in-app event picker. */
  getMyScorerEvents(profileId: string): Promise<LiveEvent[]>;
  getLiveScores(eventId: string): Promise<LiveScore[]>;
  upsertScores(eventId: string, enteredBy: string | null, scores: ScoreInput[]): Promise<void>;
  /** Push live changes to the caller; returns an unsubscribe fn. */
  subscribe(eventId: string, onChange: (score: LiveScore) => void): () => void;
}

// ── Simulated (mock mode) ───────────────────────────────────────────────────────

/** Serves the seeded demo event so screens work with no backend. */
export class SimulatedLiveScoringProvider implements LiveScoringProvider {
  private scores: LiveScore[] = [...demoLiveScores];

  async getEventBySlug(slug: string): Promise<LiveEvent | null> {
    return slug === demoLiveEvent.slug ? demoLiveEvent : null;
  }

  async listParticipants(_eventId: string, groupNo?: number): Promise<EventParticipant[]> {
    return groupNo == null
      ? demoEventParticipants
      : demoEventParticipants.filter((p) => p.groupNo === groupNo);
  }

  async getMyScorerGroup(): Promise<{ groupNo: number | null }> {
    return { groupNo: demoScorerGroupNo };
  }

  async getMyScorerEvents(): Promise<LiveEvent[]> {
    return [demoLiveEvent];
  }

  async getLiveScores(): Promise<LiveScore[]> {
    return [...this.scores];
  }

  async upsertScores(_eventId: string, enteredBy: string | null, scores: ScoreInput[]): Promise<void> {
    for (const s of scores) {
      const next: LiveScore = { ...s, enteredBy: enteredBy ?? undefined, updatedAt: new Date().toISOString() };
      const i = this.scores.findIndex(
        (x) => x.participantId === s.participantId && x.holeNumber === s.holeNumber,
      );
      if (i >= 0) this.scores[i] = next;
      else this.scores.push(next);
    }
  }

  subscribe(): () => void {
    // No realtime in mock mode; the screen keeps optimistic local state.
    return () => {};
  }
}

// ── Supabase (live) ─────────────────────────────────────────────────────────────

type EventRow = {
  id: string;
  name: string;
  slug: string;
  event_type: LiveEvent["eventType"];
  organizer_id: string;
  course_id: string | null;
  tee_set_id: string | null;
  holes: 9 | 18;
  scoring_mode: LiveEvent["scoringMode"];
  status: LiveEvent["status"];
  public_scoreboard: boolean;
  free_for_participants: boolean;
  starts_at: string | null;
};

type ParticipantRow = {
  id: string;
  event_id: string;
  profile_id: string | null;
  display_name: string;
  group_no: number | null;
  starting_hole: number;
  tee_set_id: string | null;
  status: EventParticipant["status"];
};

type LiveScoreRow = {
  participant_id: string;
  hole_number: number;
  strokes: number;
  entered_by: string | null;
  updated_at: string | null;
};

const toEvent = (r: EventRow): LiveEvent => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  eventType: r.event_type,
  organizerId: r.organizer_id,
  courseId: r.course_id ?? undefined,
  teeSetId: r.tee_set_id ?? undefined,
  holes: r.holes,
  scoringMode: r.scoring_mode,
  status: r.status,
  publicScoreboard: r.public_scoreboard,
  freeForParticipants: r.free_for_participants,
  startsAt: r.starts_at ?? undefined,
});

const toParticipant = (r: ParticipantRow): EventParticipant => ({
  id: r.id,
  eventId: r.event_id,
  profileId: r.profile_id ?? undefined,
  displayName: r.display_name,
  groupNo: r.group_no ?? undefined,
  startingHole: r.starting_hole,
  teeSetId: r.tee_set_id ?? undefined,
  status: r.status,
});

const toScore = (r: LiveScoreRow): LiveScore => ({
  participantId: r.participant_id,
  holeNumber: r.hole_number,
  strokes: r.strokes,
  enteredBy: r.entered_by ?? undefined,
  updatedAt: r.updated_at ?? undefined,
});

export class SupabaseLiveScoringProvider implements LiveScoringProvider {
  async getEventBySlug(slug: string): Promise<LiveEvent | null> {
    const { data, error } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
    if (error || !data) return null;
    return toEvent(data as EventRow);
  }

  async listParticipants(eventId: string, groupNo?: number): Promise<EventParticipant[]> {
    let query = supabase.from("event_participants").select("*").eq("event_id", eventId);
    if (groupNo != null) query = query.eq("group_no", groupNo);
    const { data, error } = await query.order("display_name", { ascending: true });
    if (error || !data) return [];
    return (data as ParticipantRow[]).map(toParticipant);
  }

  async getMyScorerGroup(eventId: string, profileId: string): Promise<{ groupNo: number | null } | null> {
    const { data, error } = await supabase
      .from("event_scorers")
      .select("group_no")
      .eq("event_id", eventId)
      .eq("profile_id", profileId)
      .order("group_no", { ascending: true, nullsFirst: true })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return { groupNo: (data as { group_no: number | null }).group_no };
  }

  async getMyScorerEvents(profileId: string): Promise<LiveEvent[]> {
    const { data, error } = await supabase
      .from("event_scorers")
      .select("events(*)")
      .eq("profile_id", profileId);
    if (error || !data) return [];
    return (data as unknown as { events: EventRow | null }[])
      .map((r) => r.events)
      .filter((e): e is EventRow => e != null)
      .map(toEvent);
  }

  async getLiveScores(eventId: string): Promise<LiveScore[]> {
    const { data, error } = await supabase
      .from("live_scores")
      .select("participant_id, hole_number, strokes, entered_by, updated_at")
      .eq("event_id", eventId);
    if (error || !data) return [];
    return (data as LiveScoreRow[]).map(toScore);
  }

  async upsertScores(eventId: string, enteredBy: string | null, scores: ScoreInput[]): Promise<void> {
    if (scores.length === 0) return;
    const rows = scores.map((s) => ({
      event_id: eventId,
      participant_id: s.participantId,
      hole_number: s.holeNumber,
      strokes: s.strokes,
      entered_by: enteredBy,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("live_scores")
      .upsert(rows, { onConflict: "participant_id,hole_number" });
    if (error) {
      logger.error("live_scores upsert failed", error);
      throw error;
    }
  }

  subscribe(eventId: string, onChange: (score: LiveScore) => void): () => void {
    const channel = supabase
      .channel(`live_scores:${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_scores", filter: `event_id=eq.${eventId}` },
        (payload) => {
          const row = payload.new as LiveScoreRow | null;
          if (row?.participant_id) onChange(toScore(row));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }
}

export function getLiveScoringProvider(): LiveScoringProvider {
  return env.EXPO_PUBLIC_USE_MOCK_AUTH
    ? new SimulatedLiveScoringProvider()
    : new SupabaseLiveScoringProvider();
}
