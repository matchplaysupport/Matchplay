import { calculateEstimatedHandicap } from "@/services/handicap";
import type { Round } from "@/types/domain";
import type { HandicapProvider } from "./HandicapProvider";

export class DemoHandicapProvider implements HandicapProvider {
  async getCurrent(rounds: Round[]) {
    const result = calculateEstimatedHandicap(rounds);
    return Promise.resolve({
      value: result.value,
      label: "Clubhouse Estimate",
      source: "match_play_estimate" as const,
      roundsUsed: result.roundsUsed,
    });
  }
}

export class ManualHandicapProvider implements HandicapProvider {
  constructor(private readonly value: number | null) {}

  async getCurrent() {
    return Promise.resolve({
      value: this.value,
      label: this.value === null ? "No handicap yet" : "Official handicap, manually entered - unverified",
      source: "manual_unverified" as const,
      roundsUsed: 0,
    });
  }
}

export class GhinHandicapProvider implements HandicapProvider {
  async getCurrent(_rounds: Round[]) {
    return Promise.resolve({
      value: null,
      label: "Official GHIN integration not yet available",
      source: "official_unavailable" as const,
      roundsUsed: 0,
    });
  }
}
