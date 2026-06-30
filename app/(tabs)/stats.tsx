import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Body,
  Card,
  Chip,
  Divider,
  EmptyState,
  Muted,
  Row,
  SectionHeader,
  StatItem,
  Title,
  useTheme,
} from "@/design-system/components";
import { analytics } from "@/lib/analytics";
import { env } from "@/lib/env";
import { useEntitlement } from "@/hooks/useEntitlement";
import { PaywallScreen } from "@/components/PaywallScreen";
import { calculateCareerStats } from "@/services/careerStats";
import { demoRounds } from "@/features/courses/demoData";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";

/** Formats a relative-to-par scoring average as e.g. "+4.2", "E", "-1.0". */
function formatRelative(value: number | null): string {
  if (value == null) return "—";
  if (value === 0) return "E";
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

/** Tiny inline bar chart of handicap differentials over time (lower = better). */
function TrendChart({ points }: { points: { roundId: string; differential: number }[] }) {
  const p = useTheme();
  const values = points.map((pt) => pt.differential);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  return (
    <Row align="space-between" style={{ alignItems: "flex-end", height: 96, gap: 4 }}>
      {points.map((pt) => {
        // Lower differential is better, so invert: best rounds rise tallest.
        const heightPct = 0.25 + 0.75 * (1 - (pt.differential - min) / span);
        return (
          <View key={pt.roundId} style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <View
              style={{
                width: "70%",
                height: `${heightPct * 100}%`,
                borderRadius: radii.sm,
                backgroundColor: p.primary,
              }}
            />
            <Text style={{ fontSize: 9, color: p.muted }}>{pt.differential.toFixed(0)}</Text>
          </View>
        );
      })}
    </Row>
  );
}

export default function StatsScreen() {
  const profile = useAppStore((state) => state.profile);
  const rounds = useAppStore((state) => state.rounds);
  const demoMode = useAppStore((state) => state.demoMode);
  const p = useTheme();
  const { can } = useEntitlement();

  useEffect(() => {
    analytics.track("handicap_viewed");
  }, []);

  const effectiveRounds = demoMode && rounds.length === 0 ? demoRounds : rounds;
  const stats = useMemo(() => calculateCareerStats(effectiveRounds), [effectiveRounds]);

  if (!env.EXPO_PUBLIC_USE_MOCK_AUTH && !can("handicap")) {
    return (
      <PaywallScreen
        requiredTier="plus"
        title="Stats & Handicap is a Clubhouse+ feature"
        description="Track your Clubhouse Estimate, scoring trends, and round-by-round stats with Clubhouse+."
      />
    );
  }

  const header = (
    <View style={[styles.header, { backgroundColor: p.header }]}>
      <Row gap={spacing.sm}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </Pressable>
        <Title style={styles.headerTitle}>Stats & Handicap</Title>
      </Row>
    </View>
  );

  if (!profile || stats.eligibleRounds === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
        {header}
        <View style={{ flex: 1, justifyContent: "center", padding: spacing.xl }}>
          <EmptyState
            icon={<Ionicons name="stats-chart-outline" size={32} color={p.muted} />}
            title="No stats yet"
            body="Play and submit a round to start building your Clubhouse Estimate and stats."
            actionLabel="Start a round"
            onAction={() => router.replace("/(tabs)/play")}
          />
        </View>
      </SafeAreaView>
    );
  }

  const { handicap } = stats;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      {header}
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Handicap hero */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Card elevated style={{ backgroundColor: p.primaryDark, borderColor: "transparent" }}>
            <Chip label="Clubhouse Estimate" variant="accent" />
            <Row align="space-between" style={{ marginTop: spacing.sm, alignItems: "flex-end" }}>
              <Text style={styles.heroValue}>{handicap.value?.toFixed(1) ?? "—"}</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.heroMeta}>{handicap.roundsUsed} of {stats.eligibleRounds} rounds</Text>
                <Text style={styles.heroMeta}>used in estimate</Text>
              </View>
            </Row>
            <Text style={styles.heroNote}>{handicap.explanation}</Text>
          </Card>
        </View>

        {/* Trend */}
        {stats.trend.length >= 2 && (
          <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <SectionHeader title="Handicap trend" />
            <Card elevated>
              <TrendChart points={stats.trend.slice(-10)} />
              <Muted style={{ marginTop: spacing.sm }}>
                Differential per round (taller is better). Newest on the right.
              </Muted>
            </Card>
          </View>
        )}

        {/* Stat grid */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <SectionHeader title="Your numbers" />
          <Card elevated>
            <Row align="space-between">
              <StatItem value={formatRelative(stats.scoringAverage)} label="Scoring avg" />
              <Divider style={{ width: 1, height: 48 }} />
              <StatItem value={stats.averagePutts?.toFixed(1) ?? "—"} label="Putts/hole" />
              <Divider style={{ width: 1, height: 48 }} />
              <StatItem value={String(stats.roundsPlayed)} label="Rounds" />
            </Row>
            <Divider style={{ marginVertical: spacing.md }} />
            <Row align="space-between">
              <StatItem
                value={stats.fairwaysHitPct != null ? `${stats.fairwaysHitPct}%` : "—"}
                label="Fairways"
              />
              <Divider style={{ width: 1, height: 48 }} />
              <StatItem
                value={stats.greensInRegulationPct != null ? `${stats.greensInRegulationPct}%` : "—"}
                label="GIR"
                valueColor={p.primary}
              />
              <Divider style={{ width: 1, height: 48 }} />
              <StatItem value={stats.bestGross ? String(stats.bestGross.grossScore) : "—"} label="Best round" />
            </Row>
          </Card>
        </View>

        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Card elevated>
            <Row gap={spacing.sm} style={{ alignItems: "flex-start" }}>
              <Ionicons name="information-circle-outline" size={16} color={p.muted} />
              <Body color={p.muted} style={{ flex: 1, fontSize: fontSizes.small, lineHeight: 19 }}>
                The Clubhouse Estimate is calculated from your submitted rounds and is not an official USGA
                Handicap Index. Verify rounds with partners to qualify for leaderboards.
              </Body>
            </Row>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 24 },
  heroValue: { color: "#FFFFFF", fontSize: 56, fontWeight: fontWeights.heavy, lineHeight: 60 },
  heroMeta: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.tiny },
  heroNote: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.small, lineHeight: 18, marginTop: spacing.md },
});
