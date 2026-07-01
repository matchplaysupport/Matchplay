import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Card,
  Chip,
  Row,
  Subheading,
} from "@/design-system/components";
import { demoCourses, demoTeeTimes } from "@/features/courses/demoData";
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
  const [results, setResults] = useState<TeeTime[]>(
    env.EXPO_PUBLIC_USE_MOCK_AUTH ? demoTeeTimes : [],
  );
  const [searched, setSearched] = useState(env.EXPO_PUBLIC_USE_MOCK_AUTH);
  const [loading, setLoading] = useState(false);
  const recordMetric = useAppStore((state) => state.recordMetric);
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
    } catch (err) {
      setResults([]);
      setSearched(true);
      Alert.alert("Search failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // In live mode, load real availability immediately on mount.
  useEffect(() => {
    if (!env.EXPO_PUBLIC_USE_MOCK_AUTH) void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Row align="space-between">
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text style={styles.headerTitle}>Tee Times</Text>
            <Text style={styles.headerSubtitle}>
              {env.EXPO_PUBLIC_USE_MOCK_AUTH ? "Demo inventory. No real booking charges." : "Live availability near you."}
            </Text>
          </View>
          <View style={styles.headerGlyph}>
            <Ionicons name="flag-outline" size={25} color="#E6D9B7" />
          </View>
        </Row>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#52695C" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="City, ZIP, or course name"
            placeholderTextColor="#879188"
            style={{ flex: 1, color: "#0D2F27", fontSize: fontSizes.body }}
            returnKeyType="search"
            onSubmitEditing={() => void runSearch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#879188" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
          <Row gap={spacing.sm} style={{ paddingBottom: spacing.xs }}>
            {/* Players picker */}
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setPlayers(players >= 4 ? 1 : players + 1)}
            >
              <Ionicons name="people-outline" size={14} color="#52695C" />
              <Text style={styles.filterText}>
                {players} {players === 1 ? "player" : "players"}
              </Text>
            </TouchableOpacity>

            {/* Hole filter */}
            {(["all", 9, 18] as HoleFilter[]).map((h) => (
              <TouchableOpacity
                key={String(h)}
                style={[styles.filterChip, holeFilter === h && styles.filterChipActive]}
                onPress={() => setHoleFilter(h)}
              >
                <Text style={[styles.filterText, holeFilter === h && styles.filterTextActive]}>
                  {h === "all" ? "All holes" : `${h} holes`}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Sort */}
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => {
                const opts: SortOption[] = ["earliest", "lowest_price", "recommended"];
                const next = opts[(opts.indexOf(sortBy) + 1) % opts.length] ?? "earliest";
                setSortBy(next);
              }}
            >
              <Ionicons name="swap-vertical-outline" size={14} color="#52695C" />
              <Text style={styles.filterText}>
                {sortBy === "earliest" ? "Earliest" : sortBy === "lowest_price" ? "Lowest price" : "Recommended"}
              </Text>
            </TouchableOpacity>
          </Row>
        </ScrollView>

        {/* Search button */}
        <TouchableOpacity
          style={[styles.searchBtn, loading && { opacity: 0.58 }]}
          onPress={() => void runSearch()}
          disabled={loading}
        >
          <Text style={styles.searchBtnText}>
            {loading ? "Searching..." : "Search tee times"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsContent}>
        {searched && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="golf-outline" size={48} color="#BFD2C4" />
            <Text style={styles.emptyTitle}>
              No tee times found
            </Text>
            <Text style={styles.emptyBody}>
              Try a different city, date, or player count.
            </Text>
          </View>
        )}

        {!searched && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={36} color="#E6D9B7" />
            </View>
            <Text style={styles.emptyTitle}>
              Find available tee times
            </Text>
            <Text style={styles.emptyBody}>
              Search by city, ZIP code, or course name to see available tee times near you.
            </Text>
          </View>
        )}

        {filtered.map((teeTime) => (
          <TeeTimeCard key={teeTime.id} teeTime={teeTime} />
        ))}

        {filtered.length > 0 && env.EXPO_PUBLIC_USE_MOCK_AUTH && (
          <View style={{ paddingVertical: spacing.md, alignItems: "center" }}>
            <Chip label="Demo inventory - not a real reservation" variant="warning" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TeeTimeCard({ teeTime }: { teeTime: TeeTime }) {
  // Prefer the course summary embedded by the provider (works in live mode);
  // fall back to demo data only for the cosmetic tee-set color bar.
  const demo = demoCourses.find((c) => c.id === teeTime.courseId);
  const courseName = teeTime.course?.name ?? demo?.name ?? "Course";
  const courseCity = teeTime.course?.city ?? demo?.city ?? "";
  const courseState = teeTime.course?.state ?? demo?.state ?? "";
  const time = new Date(teeTime.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const price = Math.round(teeTime.priceCents / 100);
  const spotsLeft = teeTime.availableSpots;
  const teeSetColor = demo?.teeSets[0]?.color ?? "#3F7A4F";

  return (
    <Link href={`/(tabs)/tee-times/${teeTime.id}` as never} asChild>
      <Card elevated style={styles.resultCard} onPress={() => undefined}>
        {/* Course color bar */}
        <View style={[styles.colorBar, { backgroundColor: teeSetColor }]} />

        <Row align="space-between" style={{ marginTop: spacing.xs }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Subheading numberOfLines={1} style={styles.resultTitle}>{courseName}</Subheading>
            <Row gap={spacing.xs}>
              <Ionicons name="location-outline" size={13} color="#6F746E" />
              <Text style={styles.resultMeta}>
                {courseCity}, {courseState}
              </Text>
            </Row>
          </View>
          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <Text style={styles.resultPrice}>${price}</Text>
            <Text style={styles.resultPer}>/golfer</Text>
          </View>
        </Row>

        <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
          <Chip label={time} variant="primary" />
          <Chip label={`${teeTime.holes} holes`} variant="muted" />
          <Chip label={teeTime.cartIncluded ? "Cart incl." : "Walking"} variant="muted" />
          <Chip label={`${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""}`} variant={spotsLeft <= 1 ? "warning" : "muted"} />
        </Row>

        <Row align="space-between">
          <Text style={{ fontSize: fontSizes.tiny, color: "#879188" }}>{teeTime.cancellationLabel}</Text>
          <Row gap={spacing.xs}>
            <Text style={styles.bookLink}>View & book</Text>
            <Ionicons name="chevron-forward" size={14} color="#416D51" />
          </Row>
        </Row>
      </Card>
    </Link>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#062B24",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    color: "#F7F3E8",
    fontFamily: "Georgia",
    fontSize: 34,
    fontWeight: fontWeights.bold,
    lineHeight: 40,
  },
  headerSubtitle: {
    color: "rgba(247,243,232,0.72)",
    fontSize: fontSizes.body,
    lineHeight: 22,
  },
  headerGlyph: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(230,217,183,0.26)",
  },
  searchContainer: {
    marginHorizontal: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    backgroundColor: "#FFFDF7",
    borderColor: "#E2DCCF",
    ...shadows.md,
  },
  searchBox: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E0D8CA", borderRadius: radii.full, paddingHorizontal: spacing.md, height: 48, backgroundColor: "#F7F3E8" },
  filterChip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full, borderWidth: 1, borderColor: "#D9D0BF", backgroundColor: "#FFFDF7" },
  filterChipActive: { backgroundColor: "#07372D", borderColor: "#07372D" },
  filterText: { fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: "#0D2F27" },
  filterTextActive: { color: "#F7F3E8" },
  searchBtn: { height: 48, borderRadius: radii.full, alignItems: "center", justifyContent: "center", backgroundColor: "#2D6A50" },
  searchBtnText: { color: "#F7F3E8", fontWeight: fontWeights.bold, fontSize: fontSizes.body },
  resultsContent: { padding: spacing.lg, paddingBottom: 112, gap: spacing.md },
  emptyState: { alignItems: "center", paddingVertical: spacing.xl },
  emptyTitle: { fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, color: "#F7F3E8", marginTop: spacing.lg },
  emptyBody: { fontSize: fontSizes.body, color: "rgba(247,243,232,0.70)", textAlign: "center", marginTop: spacing.sm, maxWidth: 280, lineHeight: 22 },
  emptyIcon: { width: 80, height: 80, borderRadius: radii.xl, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(230,217,183,0.26)" },
  resultCard: { backgroundColor: "#FFFDF7", borderColor: "#E2DCCF" },
  resultTitle: { color: "#0D2F27", fontFamily: "Georgia" },
  resultMeta: { fontSize: fontSizes.small, color: "#6F746E" },
  resultPrice: { fontSize: fontSizes.title, fontWeight: fontWeights.heavy, color: "#0D2F27" },
  resultPer: { fontSize: fontSizes.tiny, color: "#6F746E" },
  bookLink: { fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: "#416D51" },
  colorBar: { height: 4, borderRadius: radii.xs, marginBottom: spacing.xs },
});
