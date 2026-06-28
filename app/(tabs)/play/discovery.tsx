import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Body,
  Chip,
  Muted,
  Row,
  Subheading,
  Title,
  useTheme,
} from "@/design-system/components";
import { discoveryProfiles } from "@/features/courses/demoData";
import { analytics } from "@/lib/analytics";
import { fontSizes, fontWeights, radii, shadows, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import type { DiscoveryProfile } from "@/types/domain";

const SKILL_COLORS: Record<string, string> = {
  new: "#4A7080",
  casual: "#486A40",
  recreational: "#2C5F8A",
  competitive: "#7A3B8A",
  elite: "#B07030",
};

export default function DiscoveryScreen() {
  const [index, setIndex] = useState(0);
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const recordMetric = useAppStore((state) => state.recordMetric);
  const p = useTheme();

  const available = discoveryProfiles.filter((dp) => !passedIds.includes(dp.id) && !matchedIds.includes(dp.id));
  const current = available[index % (available.length || 1)];

  const handlePass = (profile: DiscoveryProfile) => {
    recordMetric("passActions");
    analytics.track("discovery_swipe", { action: "pass", playerId: profile.id });
    setPassedIds((ids) => [...ids, profile.id]);
    setIndex((i) => (i + 1) % Math.max(1, available.length - 1));
  };

  const handleInterested = (profile: DiscoveryProfile) => {
    recordMetric("interestedActions");
    analytics.track("discovery_swipe", { action: "interested", playerId: profile.id });
    // 50% simulated mutual match
    const isMutual = Math.random() > 0.5;
    if (isMutual) {
      setMatchedIds((ids) => [...ids, profile.id]);
      Alert.alert(
        "⛳ It's a match!",
        `You and ${profile.displayName} are both interested. A conversation has been started.`,
        [{ text: "Great!" }],
      );
    } else {
      setIndex((i) => (i + 1) % Math.max(1, available.length));
      Alert.alert("Interested!", `${profile.displayName} will be notified. If they're interested too, you'll match.`);
    }
  };

  if (available.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.lg }}>
          <Ionicons name="people-outline" size={64} color={p.mutedLight} />
          <Title style={{ textAlign: "center" }}>You've seen everyone nearby</Title>
          <Body color={p.muted} style={{ textAlign: "center", lineHeight: 22 }}>
            Match Play will surface new golfers as more players join in your area. Expand your search radius in Settings.
          </Body>
        </View>
      </SafeAreaView>
    );
  }

  if (!current) return null;
  const accentColor = SKILL_COLORS[current.skillLevel] ?? "#2C5F8A";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: spacing.lg, gap: spacing.lg, minHeight: 600 }}>
          {/* Counter */}
          <Muted style={{ textAlign: "center" }}>
            {available.length} golfer{available.length !== 1 ? "s" : ""} nearby · {matchedIds.length} match{matchedIds.length !== 1 ? "es" : ""}
          </Muted>

          {/* Profile card */}
          <View style={[styles.profileCard, { backgroundColor: accentColor, ...shadows.lg }]}>
            {/* Avatar */}
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {current.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </Text>
            </View>

            {/* Name + location */}
            <View style={{ alignItems: "center", gap: spacing.xs }}>
              <Text style={styles.playerName}>{current.displayName}</Text>
              <Row gap={spacing.xs}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.75)" />
                <Text style={styles.playerLocation}>{current.approximateLocation} · {current.distanceMiles} mi away</Text>
              </Row>
            </View>

            {/* Handicap */}
            {current.handicapValue != null && (
              <View style={styles.handicapBadge}>
                <Text style={styles.handicapValue}>{current.handicapValue.toFixed(1)}</Text>
                <Text style={styles.handicapLabel}>
                  {current.handicapSource === "official_unverified" ? "Self-reported HCP" : "Est. HCP"}
                </Text>
              </View>
            )}

            {/* Stats row */}
            <View style={[styles.statsRow, { backgroundColor: "rgba(0,0,0,0.2)" }]}>
              <StatBadge value={String(current.roundsPlayed)} label="Rounds" />
              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.2)", height: "100%" }} />
              <StatBadge value={`${current.matchPlayRecord.wins}–${current.matchPlayRecord.losses}`} label="Match record" />
              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.2)", height: "100%" }} />
              <StatBadge value={current.reliabilityLabel === "Highly reliable" ? "⭐" : current.reliabilityLabel === "Reliable player" ? "✓" : "New"} label="Reliability" />
            </View>

            {/* Tags */}
            <Row gap={spacing.sm} style={{ flexWrap: "wrap", justifyContent: "center" }}>
              {current.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </Row>

            {/* Bio */}
            {current.bio && (
              <Text style={styles.bio} numberOfLines={3}>{current.bio}</Text>
            )}
          </View>

          {/* Action buttons */}
          <Row gap={spacing.lg} style={{ justifyContent: "center", paddingHorizontal: spacing.xl }}>
            <Pressable
              onPress={() => handlePass(current)}
              style={[styles.actionBtn, styles.passBtn, { borderColor: p.border, backgroundColor: p.surface }]}
            >
              <Ionicons name="close" size={28} color={p.danger} />
              <Text style={{ color: p.danger, fontSize: fontSizes.small, fontWeight: fontWeights.bold }}>PASS</Text>
            </Pressable>

            <Pressable
              onPress={() => handleInterested(current)}
              style={[styles.actionBtn, styles.interestedBtn, { backgroundColor: p.primary }]}
            >
              <Ionicons name="golf" size={28} color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF", fontSize: fontSizes.small, fontWeight: fontWeights.bold }}>INTERESTED</Text>
            </Pressable>
          </Row>

          {/* Matches section */}
          {matchedIds.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.heavy, color: p.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                Your matches
              </Text>
              {matchedIds.map((id) => {
                const matched = discoveryProfiles.find((dp) => dp.id === id);
                if (!matched) return null;
                return (
                  <Pressable
                    key={id}
                    onPress={() => Alert.alert("Messages", "Messaging coming in Phase 5.")}
                    style={[styles.matchRow, { backgroundColor: p.surface, borderColor: p.border }]}
                  >
                    <View style={[styles.matchAvatar, { backgroundColor: SKILL_COLORS[matched.skillLevel] ?? "#888" }]}>
                      <Text style={{ color: "#FFF", fontWeight: fontWeights.bold, fontSize: fontSizes.body }}>
                        {matched.displayName.split(" ").map((n) => n[0]).join("")}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.semibold, color: p.text }}>{matched.displayName}</Text>
                      <Text style={{ fontSize: fontSizes.small, color: p.muted }}>{matched.approximateLocation}</Text>
                    </View>
                    <Chip label="Matched" variant="success" size="xs" />
                    <Ionicons name="chatbubble-outline" size={18} color={p.primary} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1, paddingVertical: spacing.sm }}>
      <Text style={{ color: "#FFFFFF", fontSize: fontSizes.subheading, fontWeight: fontWeights.heavy }}>{value}</Text>
      <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: fontSizes.micro, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { borderRadius: radii.xl, padding: spacing.xl, alignItems: "center", gap: spacing.lg },
  avatarLarge: { width: 96, height: 96, borderRadius: 48, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontSize: fontSizes.title, fontWeight: fontWeights.heavy },
  playerName: { color: "#FFFFFF", fontSize: fontSizes.title, fontWeight: fontWeights.heavy, textAlign: "center" },
  playerLocation: { color: "rgba(255,255,255,0.75)", fontSize: fontSizes.small },
  handicapBadge: { backgroundColor: "rgba(0,0,0,0.2)", borderRadius: radii.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: "center" },
  handicapValue: { color: "#FFFFFF", fontSize: fontSizes.display, fontWeight: fontWeights.heavy },
  handicapLabel: { color: "rgba(255,255,255,0.65)", fontSize: fontSizes.tiny },
  statsRow: { flexDirection: "row", alignItems: "center", borderRadius: radii.md, width: "100%" },
  tag: { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  tagText: { color: "#FFFFFF", fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold },
  bio: { color: "rgba(255,255,255,0.75)", fontSize: fontSizes.small, lineHeight: 19, textAlign: "center" },
  actionBtn: { alignItems: "center", justifyContent: "center", gap: spacing.xs, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, borderRadius: radii.xl },
  passBtn: { borderWidth: 1.5 },
  interestedBtn: { flex: 1 },
  matchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1 },
  matchAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
