// Shared scoreboard math for the public live page. Mirrors the app's
// src/services/liveEvents.ts so phone and web rank identically.

export type HolePars = Record<number, number>;

export interface BoardParticipant {
  id: string;
  displayName: string;
  groupNo?: number | null;
  status?: string;
}

export interface BoardScore {
  participantId: string;
  holeNumber: number;
  strokes: number;
}

export interface BoardRow {
  participantId: string;
  displayName: string;
  groupNo?: number | null;
  toPar: number;
  thru: number;
  grossStrokes: number;
  position: number;
}

export function computeScoreboard(
  participants: BoardParticipant[],
  scores: BoardScore[],
  pars: HolePars,
  defaultPar = 4,
): BoardRow[] {
  const byParticipant = new Map<string, BoardScore[]>();
  for (const s of scores) {
    const arr = byParticipant.get(s.participantId);
    if (arr) arr.push(s);
    else byParticipant.set(s.participantId, [s]);
  }

  const rows: BoardRow[] = participants
    .filter((p) => (p.status ?? "active") === "active")
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

  const rankKey = (r: BoardRow) => (r.thru === 0 ? Number.POSITIVE_INFINITY : r.toPar);

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

export function formatToPar(toPar: number): string {
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}

export function formatPosition(row: BoardRow, rows: BoardRow[]): string {
  const tied = rows.filter((r) => r.position === row.position).length > 1;
  return tied ? `T${row.position}` : `${row.position}`;
}

export function formatThru(thru: number, holes: number): string {
  if (thru === 0) return "—";
  return thru >= holes ? "F" : `${thru}`;
}
