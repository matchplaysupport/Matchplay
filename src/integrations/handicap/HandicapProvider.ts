import type { Round } from "@/types/domain";

export interface HandicapResult {
  value: number | null;
  label: string;
  source: "match_play_estimate" | "manual_unverified" | "official_unavailable";
  roundsUsed: number;
}

export interface HandicapProvider {
  getCurrent(rounds: Round[]): Promise<HandicapResult>;
}
