import type { EventParticipant, LiveScore, ScoreboardRow } from "@/types/domain";

/** Map of hole number → par. */
export type HolePars = Record<number, number>;

/** Build a par lookup from a course's holes (or DB course_holes rows). */
export function holeParsFrom(holes: { number: number; par: number }[]): HolePars {
  const pars: HolePars = {};
  for (const h of holes) pars[h.number] = h.par;
  return pars;
}

/**
 * Compute live standings from the field, the scores entered so far, and the
 * hole pars. Pure + synchronous so both the app and the web scoreboard share
 * the exact same ranking logic, and so it's trivially testable.
 *
 * Ordering: players who have started rank by to-par (ascending); ties share a
 * position (competition "1224" ranking). Players who haven't teed off sort to
 * the bottom together. Within a tie, the player further along is shown first.
 */
export function computeScoreboard(
  participants: EventParticipant[],
  scores: LiveScore[],
  pars: HolePars,
  defaultPar = 4,
): ScoreboardRow[] {
  const byParticipant = new Map<string, LiveScore[]>();
  for (const s of scores) {
    const arr = byParticipant.get(s.participantId);
    if (arr) arr.push(s);
    else byParticipant.set(s.participantId, [s]);
  }

  const rows: ScoreboardRow[] = participants
    .filter((p) => p.status === "active")
    .map((p) => {
      const playerScores = byParticipant.get(p.id) ?? [];
      let toPar = 0;
      let grossStrokes = 0;
      for (const s of playerScores) {
        const par = pars[s.holeNumber] ?? defaultPar;
        toPar += s.strokes - par;
        grossStrokes += s.strokes;
      }
      return {
        participantId: p.id,
        displayName: p.displayName,
        groupNo: p.groupNo,
        toPar,
        thru: playerScores.length,
        grossStrokes,
        position: 0,
      };
    });

  // Not-started players sort/rank below everyone who has teed off.
  const rankKey = (r: ScoreboardRow) => (r.thru === 0 ? Number.POSITIVE_INFINITY : r.toPar);

  rows.sort((a, b) => {
    const ka = rankKey(a);
    const kb = rankKey(b);
    if (ka !== kb) return ka - kb;
    if (a.thru !== b.thru) return b.thru - a.thru;
    return a.displayName.localeCompare(b.displayName);
  });

  let lastKey: number | null = null;
  let lastPosition = 0;
  rows.forEach((r, i) => {
    const key = rankKey(r);
    if (lastKey === null || key !== lastKey) {
      lastPosition = i + 1;
      lastKey = key;
    }
    r.position = lastPosition;
  });

  return rows;
}

/** "E", "+3", "-2" — the standard golf to-par label. */
export function formatToPar(toPar: number): string {
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}

/** "T2" when tied with another player at that position, otherwise "2". */
export function formatPosition(row: ScoreboardRow, rows: ScoreboardRow[]): string {
  const tied = rows.filter((r) => r.position === row.position).length > 1;
  return tied ? `T${row.position}` : `${row.position}`;
}

/** "F" once the round is complete, otherwise the holes-completed count. */
export function formatThru(thru: number, holes: number): string {
  if (thru === 0) return "—";
  return thru >= holes ? "F" : `${thru}`;
}
