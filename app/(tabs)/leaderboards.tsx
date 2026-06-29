import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Avatar,
  Body,
  Button,
  Card,
  Chip,
  PillSelector,
  Row,
  SectionHeader,
  Title,
  useTheme,
} from "@/design-system/components";
import { useQuery } from "@tanstack/react-query";
import { analytics } from "@/lib/analytics";
import { env } from "@/lib/env";
import { router } from "expo-router";
import { getLeaderboardProvider } from "@/integrations/leaderboard/LeaderboardProvider";
import { useEntitlement } from "@/hooks/useEntitlement";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import type { LeaderboardEntry } from "@/types/domain";

const provider = getLeaderboardProvider();

type Scope = "local" | "state" | "national" | "friends";
type Period = "weekly" | "monthly" | "seasonal";

const SCOPE_OPTIONS: { label: string; value: Scope }[] = [
  { label: "Nashville", value: "local" },
  { label: "Tennessee", value: "state" },
  { label: "National", value: "national" },
  { label: "Friends", value: "friends" },
];

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Seasonal", value: "seasonal" },
];

function MovementIndicator({ movement }: { movement: number }) {
  const p = useTheme();
  if (movement === 0) return <Text style={{ fontSize: fontSizes.tiny, color: p.muted }}>—</Text>;
  const up = movement > 0;
  return (
    <Row gap={2}>
      <Ionicons name={up ? "arrow-up" : "arrow-down"} size={12} color={up ? p.success : p.danger} />
      <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: up ? p.success : p.danger }}>
        {Math.abs(movement)}
      </Text>
    </Row>
  );
}

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardsScreen() {
  const [scope, setScope] = useState<Scope>("local");
  const [period, setPeriod] = useState<Period>("seasonal");
  const profile = useAppStore((state) => state.profile);
  const rounds = useAppStore((state) => state.rounds);
  const p = useTheme();

  useEffect(() => {
    analytics.track("leaderboard_viewed", { scope, period });
  }, [period, scope]);

  const submittedRounds = rounds.filter((r) => r.verificationState !== "draft").length;
  const bonusPoints = submittedRounds * 30;

  const { can } = useEntitlement();
  const localLocked = !env.EXPO_PUBLIC_USE_MOCK_AUTH && !can("local_leaderboards");
  const scopeLocked =
    localLocked ||
    ((scope === "state" || scope === "national") && !can("state_national_leaderboards"));

  const { data: liveEntries = [], isLoading } = useQuery({
    queryKey: ["leaderboard", scope, period],
    queryFn: () => provider.list(scope, period),
    enabled: !scopeLocked,
  });

  const entries: LeaderboardEntry[] = useMemo(() => {
    // In demo mode, anchor the local user at the top so there's always a "you" row.
    if (env.EXPO_PUBLIC_USE_MOCK_AUTH && profile && !profile.privacy.hideLeaderboards) {
      const me: LeaderboardEntry = {
        rank: 1,
        playerId: profile.id,
        displayName: profile.displayName,
        location: `${profile.city}, ${profile.state}`,
        metricLabel: profile.handicapValue ? `${profile.handicapValue.toFixed(1)} HCP` : "No handicap",
        points: 540 + bonusPoints,
        verified: false,
        movement: submittedRounds > 0 ? 3 : 1,
      };
      return [
        me,
        ...liveEntries.filter((e) => e.playerId !== profile.id).map((e, i) => ({ ...e, rank: i + 2 })),
      ];
    }
    return liveEntries;
  }, [liveEntries, profile, bonusPoints, submittedRounds]);

  const topThree = entries.slice(0, 3);

  const scopeLabel = SCOPE_OPTIONS.find((o) => o.value === scope)?.label ?? "Local";
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "Seasonal";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: p.primary }]}>
        <Row align="space-between">
          <View style={{ gap: 4 }}>
            <Title style={{ color: "#FFFFFF" }}>Leaderboards</Title>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.body }}>
              {scopeLabel} · {periodLabel} Clubhouse points
            </Text>
          </View>
          <Ionicons name="podium" size={36} color="rgba(255,255,255,0.3)" />
        </Row>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Scope + Period selectors */}
        <View style={[{ backgroundColor: p.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: p.border, padding: spacing.lg, gap: spacing.sm }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <PillSelector options={SCOPE_OPTIONS} selected={scope} onSelect={setScope} />
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <PillSelector options={PERIOD_OPTIONS} selected={period} onSelect={setPeriod} />
          </ScrollView>
        </View>

        {/* Disclaimer */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <View style={[styles.disclaimer, { backgroundColor: p.accentBg }]}>
            <Ionicons name="information-circle-outline" size={16} color={p.accentText} />
            <Text style={{ flex: 1, fontSize: fontSizes.tiny, color: p.accentText, lineHeight: 17 }}>
              {profile?.privacy.hideLeaderboards
                ? "Your leaderboard privacy setting is on, so your profile is hidden from public rankings."
                : env.EXPO_PUBLIC_USE_MOCK_AUTH
                  ? "Points are based on demo activity. Users who hide leaderboard participation are not shown publicly."
                : "Points reflect verified and self-reported rounds. Users who hide leaderboard participation aren't shown publicly."}
            </Text>
          </View>
        </View>

        {scopeLocked && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <Card>
              <View style={{ alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg }}>
                <Ionicons name="lock-closed-outline" size={34} color={p.mutedLight} />
                <Body color={p.muted} style={{ textAlign: "center" }}>
                  {localLocked
                    ? "Leaderboards are included with Match Play+."
                    : "State and national leaderboards are included with Match Play Pro."}
                </Body>
                <Button
                  label={localLocked ? "Upgrade to Match Play+" : "Upgrade to Pro"}
                  size="sm"
                  onPress={() => router.push("/(tabs)/upgrade")}
                />
              </View>
            </Card>
          </View>
        )}

        {isLoading && !scopeLocked && (
          <View style={{ paddingVertical: spacing.xxl, alignItems: "center" }}>
            <ActivityIndicator color={p.primary} />
          </View>
        )}

        {/* Top 3 podium */}
        {!isLoading && !scopeLocked && topThree.length > 0 && (
          <View style={[styles.podium, { marginHorizontal: spacing.lg, marginTop: spacing.lg }]}>
          {topThree.map((entry) => {
            const medal = RANK_MEDALS[entry.rank] ?? `#${entry.rank}`;
            const isMe = profile && entry.playerId === profile.id;
            return (
              <View key={entry.playerId} style={[styles.podiumCard, { backgroundColor: p.surface, borderColor: isMe ? p.primary : p.border, borderWidth: isMe ? 2 : StyleSheet.hairlineWidth }]}>
                <Text style={{ fontSize: 22 }}>{medal}</Text>
                <Avatar name={entry.displayName} size={44} />
                <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.bold, color: p.text, textAlign: "center" }} numberOfLines={1}>
                  {entry.displayName.split(" ")[0]}
                </Text>
                <Text style={{ fontSize: fontSizes.tiny, color: p.muted, textAlign: "center" }} numberOfLines={1}>
                  {entry.metricLabel}
                </Text>
                <View style={[styles.pointsBadge, { backgroundColor: p.successLight }]}>
                  <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.heavy, color: p.primary }}>
                    {entry.points} pts
                  </Text>
                </View>
              </View>
            );
          })}
          </View>
        )}

        {/* Rest of leaderboard */}
        {!isLoading && !scopeLocked && entries.length > 0 && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm }}>
          <SectionHeader title={`Rankings — ${scopeLabel}`} />
          {entries.map((entry) => {
            const isMe = profile && entry.playerId === profile.id;
            return (
              <View
                key={entry.playerId}
                style={[
                  styles.rankRow,
                  {
                    backgroundColor: isMe ? p.successLight : p.surface,
                    borderColor: isMe ? p.primary : p.border,
                    borderWidth: isMe ? 1.5 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                {/* Rank */}
                <View style={styles.rankBadge}>
                  <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.heavy, color: entry.rank <= 3 ? p.primary : p.muted }}>
                    {RANK_MEDALS[entry.rank] ?? `#${entry.rank}`}
                  </Text>
                </View>

                {/* Avatar + info */}
                <Row gap={spacing.md} style={{ flex: 1 }}>
                  <Avatar name={entry.displayName} size={40} />
                  <View style={{ flex: 1 }}>
                    <Row align="space-between">
                      <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.semibold, color: p.text }}>
                        {entry.displayName} {isMe && <Text style={{ color: p.primary }}>(you)</Text>}
                      </Text>
                      <MovementIndicator movement={entry.movement} />
                    </Row>
                    <Row gap={spacing.xs}>
                      <Text style={{ fontSize: fontSizes.tiny, color: p.muted }}>{entry.location}</Text>
                    </Row>
                    <Row align="space-between" style={{ marginTop: spacing.xs }}>
                      <Row gap={spacing.xs}>
                        <Chip label={entry.metricLabel} variant="muted" size="xs" />
                        {entry.verified && <Chip label="Verified" variant="success" size="xs" />}
                      </Row>
                      <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.heavy, color: p.primary }}>
                        {entry.points} pts
                      </Text>
                    </Row>
                  </View>
                </Row>
              </View>
            );
          })}
          </View>
        )}

        {!isLoading && !scopeLocked && entries.length === 0 && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <Card>
              <View style={{ alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg }}>
                <Ionicons name="podium-outline" size={36} color={p.mutedLight} />
                <Body color={p.muted} style={{ textAlign: "center" }}>No rankings yet for this scope and period.</Body>
              </View>
            </Card>
          </View>
        )}

        {/* Points explanation */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Card>
            <SectionHeader title="How points work" />
            <View style={{ gap: spacing.sm }}>
              {[
                ["Complete eligible round", "+15 pts"],
                ["Partner-verified round", "+25 pts"],
                ["Match play win", "+20 pts"],
                ["New personal best", "+30 pts"],
                ["Consistent reliability", "+10 pts/round"],
              ].map(([label, pts]) => (
                <Row key={label} align="space-between">
                  <Body color={p.muted}>{label}</Body>
                  <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.bold, color: p.primary }}>{pts}</Text>
                </Row>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xs },
  disclaimer: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderRadius: radii.md },
  podium: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  podiumCard: { flex: 1, alignItems: "center", gap: spacing.xs, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1 },
  pointsBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  rankRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1 },
  rankBadge: { width: 36, alignItems: "center" },
});
