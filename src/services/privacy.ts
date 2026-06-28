import type { Profile } from "@/types/domain";

export interface PublicProfile {
  id: string;
  displayName: string;
  username: string;
  locationLabel: string | null;
  handicapLabel: string | null;
  skillLevel: Profile["skillLevel"];
  reliabilityLabel: Profile["reliabilityLabel"];
}

export const projectPublicProfile = (profile: Profile): PublicProfile | null => {
  if (profile.privacy.hideProfileDiscovery) {
    return null;
  }
  return {
    id: profile.id,
    displayName: profile.displayName,
    username: profile.username,
    locationLabel: profile.privacy.hideApproximateLocation ? null : `${profile.city}, ${profile.state}`,
    handicapLabel:
      profile.privacy.hideHandicap || profile.handicapValue === undefined
        ? null
        : `${profile.handicapValue.toFixed(1)} ${
            profile.handicapSource === "match_play_estimate" ? "Clubhouse Estimate" : "Official, unverified"
          }`,
    skillLevel: profile.skillLevel,
    reliabilityLabel: profile.reliabilityLabel,
  };
};
