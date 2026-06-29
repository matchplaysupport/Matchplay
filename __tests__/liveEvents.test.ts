import {
  computeScoreboard,
  formatPosition,
  formatThru,
  formatToPar,
  holeParsFrom,
  type HolePars,
} from "@/services/liveEvents";
import type { EventParticipant, LiveScore } from "@/types/domain";

const participant = (id: string, displayName: string, groupNo = 1): EventParticipant => ({
  id,
  eventId: "evt-1",
  displayName,
  groupNo,
  startingHole: 1,
  status: "active",
});

const score = (participantId: string, holeNumber: number, strokes: number): LiveScore => ({
  participantId,
  holeNumber,
  strokes,
});

// All par 4 for holes 1..18.
const pars: HolePars = holeParsFrom(
  Array.from({ length: 18 }, (_, i) => ({ number: i + 1, par: 4 })),
);

describe("computeScoreboard", () => {
  it("computes to-par, thru, and gross from entered scores", () => {
    const rows = computeScoreboard(
      [participant("a", "Alice")],
      [score("a", 1, 3), score("a", 2, 5), score("a", 3, 4)],
      pars,
    );
    expect(rows[0]).toMatchObject({ participantId: "a", toPar: 0, thru: 3, grossStrokes: 12 });
  });

  it("orders by to-par ascending and assigns 1224 positions for ties", () => {
    const rows = computeScoreboard(
      [participant("a", "Alice"), participant("b", "Bob"), participant("c", "Cara")],
      [
        score("a", 1, 3), // -1
        score("b", 1, 3), // -1  (ties Alice)
        score("c", 1, 6), // +2
      ],
      pars,
    );
    // Two players tied for 1st (T1), next player is 3rd — not 2nd.
    expect(rows.map((r) => r.position)).toEqual([1, 1, 3]);
    expect(rows[2]?.participantId).toBe("c");
    expect(formatPosition(rows[0]!, rows)).toBe("T1");
    expect(formatPosition(rows[2]!, rows)).toBe("3");
  });

  it("ranks players who have not teed off at the bottom", () => {
    const rows = computeScoreboard(
      [participant("a", "Alice"), participant("z", "Zoe")],
      [score("a", 1, 5)], // Alice +1 thru 1; Zoe has no scores
      pars,
    );
    expect(rows[0]?.participantId).toBe("a");
    expect(rows[1]?.participantId).toBe("z");
    expect(rows[1]).toMatchObject({ toPar: 0, thru: 0, position: 2 });
  });

  it("shows the further-along player first within an equal to-par tie", () => {
    const rows = computeScoreboard(
      [participant("a", "Alice"), participant("b", "Bob")],
      [
        score("a", 1, 4),
        score("a", 2, 4), // Alice E thru 2
        score("b", 1, 4), // Bob E thru 1
      ],
      pars,
    );
    expect(rows[0]?.participantId).toBe("a");
    expect(rows.map((r) => r.position)).toEqual([1, 1]);
  });

  it("excludes withdrawn participants", () => {
    const wd: EventParticipant = { ...participant("w", "Withdrawn"), status: "withdrawn" };
    const rows = computeScoreboard([participant("a", "Alice"), wd], [score("a", 1, 4)], pars);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.participantId).toBe("a");
  });

  it("falls back to default par for unknown holes", () => {
    const rows = computeScoreboard([participant("a", "Alice")], [score("a", 99, 5)], {}, 4);
    expect(rows[0]?.toPar).toBe(1);
  });
});

describe("formatters", () => {
  it("formats to-par", () => {
    expect(formatToPar(0)).toBe("E");
    expect(formatToPar(3)).toBe("+3");
    expect(formatToPar(-2)).toBe("-2");
  });

  it("formats thru", () => {
    expect(formatThru(0, 18)).toBe("—");
    expect(formatThru(9, 18)).toBe("9");
    expect(formatThru(18, 18)).toBe("F");
  });
});
