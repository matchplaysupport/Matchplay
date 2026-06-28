import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Body,
  Card,
  Chip,
  Muted,
  PillSelector,
  Row,
  Subheading,
  Title,
  useTheme,
} from "@/design-system/components";
import { demoCourses } from "@/features/courses/demoData";
import { SimulatedTeeTimeProvider } from "@/integrations/tee-times/SimulatedTeeTimeProvider";
import { SupabaseTeeTimeProvider } from "@/integrations/tee-times/SupabaseTeeTimeProvider";
import { analytics } from "@/lib/analytics";
import { env } from "@/lib/env";
import { fontSizes, fontWeights, radii, shadows, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import type { TeeTime } from "@/types/domain";

type SortOption = "earliest" | "lowest_price" | "recommended";
type HoleFilter = "all" | 9 | 18;

const provider = env.EXPO_PUBLIC_USE_MOCK_AUTH
  ? new SimulatedTeeTimeProvider()
  : new SupabaseTeeTimeProvider();

export default function TeeTimesScreen() {
  const [query, setQuery] = useState("Nashville");
  const [players, setPlayers] = useState(2);
  const [sortBy, setSortBy] = useState<SortOption>("earliest");
  const [holeFilter, setHoleFilter] = useState<HoleFilter>("all");
  const [results, setResults] = useState<TeeTime[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const recordMetric = useAppStore((state) => state.recordMetric);
  const p = useTheme();

  const filtered = useMemo(() => {
    if (holeFilter === "all") return results;
    return results.filter((t) => t.holes === holeFilter);
  }, [results, holeFilter]);

  const runSearch = async () => {
    setLoading(true);
    try {
      const res = await provider.search({ query, minPlayers: players, sortBy });
      setResults(res);
      setSearched(true);
      recordMetric("searches");
      analytics.track("tee_time_searched", { query, count: res.length });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: p.primary }]}>
        <Title style={{ color: "#FFFFFF" }}>Tee Times</Title>
        <Muted style={{ color: "rgba(255,255,255,0.75)" }}>Demo inventory — no real booking charges</Muted>
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: p.surface, borderBottomColor: p.border }]}>
        <View style={[styles.searchBox, { backgroundColor: p.backgroundAlt, borderColor: p.border }]}>
          <Ionicons name="search-outline" size={18} color={p.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="City, ZIP, or course name"
            placeholderTextColor={p.mutedLight}
            style={{ flex: 1, color: p.text, fontSize: fontSizes.body }}
            returnKeyType="search"
            onSubmitEditing={() => void runSearch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={p.mutedLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
          <Row gap={spacing.sm} style={{ paddingBottom: spacing.xs }}>
            {/* Players picker */}
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: p.backgroundAlt, borderColor: p.border }]}
              onPress={() => setPlayers(players >= 4 ? 1 : players + 1)}
            >
              <Ionicons name="people-outline" size={14} color={p.muted} />
              <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: p.text }}>
                {players} {players === 1 ? "player" : "players"}
              </Text>
            </TouchableOpacity>

            {/* Hole filter */}
            {(["all", 9, 18] as HoleFilter[]).map((h) => (
              <TouchableOpacity
                key={String(h)}
                style={[styles.filterChip, { backgroundColor: holeFilter === h ? p.primary : p.backgroundAlt, borderColor: holeFilter === h ? p.primary : p.border }]}
                onPress={() => setHoleFilter(h)}
              >
                <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: holeFilter === h ? p.primaryText : p.text }}>
                  {h === "all" ? "All holes" : `${h} holes`}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Sort */}
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: p.backgroundAlt, borderColor: p.border }]}
              onPress={() => {
                const opts: SortOption[] = ["earliest", "lowest_price", "recommended"];
                const next = opts[(opts.indexOf(sortBy) + 1) % opts.length] ?? "earliest";
                setSortBy(next);
              }}
            >
              <Ionicons name="swap-vertical-outline" size={14} color={p.muted} />
              <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: p.text }}>
                {sortBy === "earliest" ? "Earliest" : sortBy === "lowest_price" ? "Lowest price" : "Recommended"}
              </Text>
            </TouchableOpacity>
          </Row>
        </ScrollView>

        {/* Search button */}
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: loading ? p.border : p.primary }]}
          onPress={() => void runSearch()}
          disabled={loading}
        >
          <Text style={{ color: p.primaryText, fontWeight: fontWeights.bold, fontSize: fontSizes.body }}>
            {loading ? "Searching..." : "Search tee times"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100, gap: spacing.md }}>
        {searched && filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: spacing.xxl }}>
            <Ionicons name="golf-outline" size={48} color={p.mutedLight} />
            <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, color: p.text, marginTop: spacing.md }}>
              No tee times found
            </Text>
            <Text style={{ fontSize: fontSizes.body, color: p.muted, textAlign: "center", marginTop: spacing.sm }}>
              Try a different city, date, or player count.
            </Text>
          </View>
        )}

        {!searched && (
          <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
            <View style={[styles.emptyIcon, { backgroundColor: p.successLight }]}>
              <Ionicons name="calendar-outline" size={36} color={p.primary} />
            </View>
            <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, color: p.text, marginTop: spacing.lg }}>
              Find available tee times
            </Text>
            <Text style={{ fontSize: fontSizes.body, color: p.muted, textAlign: "center", marginTop: spacing.sm, maxWidth: 280, lineHeight: 22 }}>
              Search by city, ZIP code, or course name to see demo inventory across Nashville and nearby areas.
            </Text>
          </View>
        )}

        {filtered.map((teeTime) => (
          <TeeTimeCard key={teeTime.id} teeTime={teeTime} />
        ))}

        {filtered.length > 0 && (
          <View style={{ paddingVertical: spacing.md, alignItems: "center" }}>
            <Chip label="Demo inventory — not a real reservation" variant="warning" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TeeTimeCard({ teeTime }: { teeTime: TeeTime }) {
  const course = demoCourses.find((c) => c.id === teeTime.courseId);
  const p = useTheme();
  const time = new Date(teeTime.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const price = Math.round(teeTime.priceCents / 100);
  const spotsLeft = teeTime.availableSpots;
  const teeSetColor = course?.teeSets[0]?.color ?? "#888888";

  return (
    <Link href={`/(tabs)/tee-times/${teeTime.id}` as never} asChild>
      <Card elevated onPress={() => undefined}>
        {/* Course color bar */}
        <View style={[styles.colorBar, { backgroundColor: teeSetColor }]} />

        <Row align="space-between" style={{ marginTop: spacing.xs }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Subheading numberOfLines={1}>{course?.name ?? "Course"}</Subheading>
            <Row gap={spacing.xs}>
              <Ionicons name="location-outline" size={13} color={p.muted} />
              <Text style={{ fontSize: fontSizes.small, color: p.muted }}>
                {course?.city}, {course?.state}
              </Text>
            </Row>
          </View>
          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <Text style={{ fontSize: fontSizes.title, fontWeight: fontWeights.heavy, color: p.text }}>${price}</Text>
            <Text style={{ fontSize: fontSizes.tiny, color: p.muted }}>/golfer</Text>
          </View>
        </Row>

        <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
          <Chip label={time} variant="primary" />
          <Chip label={`${teeTime.holes} holes`} variant="muted" />
          <Chip label={teeTime.cartIncluded ? "Cart incl." : "Walking"} variant="muted" />
          <Chip label={`${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""}`} variant={spotsLeft <= 1 ? "warning" : "muted"} />
        </Row>

        <Row align="space-between">
          <Text style={{ fontSize: fontSizes.tiny, color: p.mutedLight }}>{teeTime.cancellationLabel}</Text>
          <Row gap={spacing.xs}>
            <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: p.primary }}>View & book</Text>
            <Ionicons name="chevron-forward" size={14} color={p.primary} />
          </Row>
        </Row>
      </Card>
    </Link>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg, gap: spacing.xs },
  searchContainer: { padding: spacing.lg, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  searchBox: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, height: 48 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full, borderWidth: 1 },
  searchBtn: { height: 48, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  emptyIcon: { width: 80, height: 80, borderRadius: radii.xl, alignItems: "center", justifyContent: "center" },
  colorBar: { height: 4, borderRadius: radii.xs, marginBottom: spacing.xs },
});
