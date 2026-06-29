import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import type { LiveScoringProvider, ScoreInput } from "@/integrations/liveScoring/LiveScoringProvider";
import { logger } from "@/lib/logger";

// Golf courses have dead spots, so score writes must survive going offline.
// On SAVE we try the network first; anything that fails is persisted here and
// retried when the app comes back to the foreground (and on the next SAVE).
// Conflict resolution is last-write-wins per (event, participant, hole).

const KEY = "live-scores-queue-v1";

export interface PendingScore extends ScoreInput {
  eventId: string;
  enteredBy: string | null;
  queuedAt: string;
}

const keyOf = (s: { eventId: string; participantId: string; holeNumber: number }) =>
  `${s.eventId}:${s.participantId}:${s.holeNumber}`;

async function readQueue(): Promise<PendingScore[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingScore[]) : [];
  } catch (error) {
    logger.error("offlineQueue read failed", error);
    return [];
  }
}

async function writeQueue(queue: PendingScore[]): Promise<void> {
  try {
    if (queue.length === 0) await AsyncStorage.removeItem(KEY);
    else await AsyncStorage.setItem(KEY, JSON.stringify(queue));
  } catch (error) {
    logger.error("offlineQueue write failed", error);
  }
}

/** Last-write-wins merge keyed by (event, participant, hole). */
function mergeLWW(existing: PendingScore[], incoming: PendingScore[]): PendingScore[] {
  const map = new Map<string, PendingScore>();
  for (const s of existing) map.set(keyOf(s), s);
  for (const s of incoming) map.set(keyOf(s), s);
  return [...map.values()];
}

export async function enqueueScores(
  eventId: string,
  enteredBy: string | null,
  scores: ScoreInput[],
): Promise<void> {
  const queuedAt = new Date().toISOString();
  const pending: PendingScore[] = scores.map((s) => ({ ...s, eventId, enteredBy, queuedAt }));
  await writeQueue(mergeLWW(await readQueue(), pending));
}

/**
 * Submit scores, queuing for later if the write fails (e.g. offline).
 * Returns true if the scores reached the server.
 */
export async function submitScores(
  provider: LiveScoringProvider,
  eventId: string,
  enteredBy: string | null,
  scores: ScoreInput[],
): Promise<boolean> {
  try {
    await provider.upsertScores(eventId, enteredBy, scores);
    return true;
  } catch {
    logger.info("score submit failed — queued offline", { count: scores.length });
    await enqueueScores(eventId, enteredBy, scores);
    return false;
  }
}

export async function getPendingCount(): Promise<number> {
  return (await readQueue()).length;
}

/** Retry every queued score. Anything that still fails stays queued. */
export async function flushQueue(provider: LiveScoringProvider): Promise<number> {
  const queue = await readQueue();
  if (queue.length === 0) return 0;

  const groups = new Map<string, PendingScore[]>();
  for (const s of queue) {
    const k = `${s.eventId}::${s.enteredBy ?? ""}`;
    const arr = groups.get(k);
    if (arr) arr.push(s);
    else groups.set(k, [s]);
  }

  const stillPending: PendingScore[] = [];
  let flushed = 0;
  for (const items of groups.values()) {
    const first = items[0];
    if (!first) continue;
    try {
      await provider.upsertScores(
        first.eventId,
        first.enteredBy,
        items.map(({ participantId, holeNumber, strokes }) => ({ participantId, holeNumber, strokes })),
      );
      flushed += items.length;
    } catch (error) {
      logger.error("offlineQueue flush group failed", error);
      stillPending.push(...items);
    }
  }

  await writeQueue(stillPending);
  return flushed;
}

let detach: (() => void) | null = null;

/** Wire up automatic flushing on app foreground. Idempotent. */
export function startQueueFlusher(provider: LiveScoringProvider): () => void {
  if (detach) return detach;
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") void flushQueue(provider);
  });
  void flushQueue(provider);
  detach = () => {
    sub.remove();
    detach = null;
  };
  return detach;
}
