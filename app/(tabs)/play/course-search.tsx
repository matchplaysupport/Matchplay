import { useState, useCallback } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Body,
  Button,
  Muted,
  Row,
  Subheading,
  useTheme,
} from "@/design-system/components";
import { useCourseSearch } from "@/hooks/useCourseSearch";
import type { CourseSearchResult } from "@/hooks/useCourseSearch";
import { demoCourses } from "@/features/courses/demoData";
import { env } from "@/lib/env";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import type { Course } from "@/types/domain";

// ─── Tee + holes selector ─────────────────────────────────────────────────

function TeeSelector({ course, onDismiss }: { course: Course; onDismiss: () => void }) {
  const p = useTheme();
  const [selectedTeeId, setSelectedTeeId] = useState(course.teeSets[0]?.id ?? "");
  const [holes, setHoles] = useState<9 | 18>(course.holes.length >= 18 ? 18 : 9);
  const startRound = useAppStore((s) => s.startRound);

  const selectedTee = course.teeSets.find((t) => t.id === selectedTeeId);

  const handleStart = () => {
    if (!selectedTee) return;
    startRound(
      {
        roundId: `round-${Date.now()}`,
        courseId: course.id,
        teeSetId: selectedTeeId,
        format: "stroke_play",
        holes,
        currentHole: 1,
        scores: [],
        startedAt: new Date().toISOString(),
      },
      course,
    );
    onDismiss();
    router.replace("/(tabs)/play/scoring");
  };

  return (
    <View style={[styles.sheet, { backgroundColor: p.surface, borderTopColor: p.border }]}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md }}>
        <View>
          <Subheading>{course.name}</Subheading>
          <Body color={p.muted}>{course.city}, {course.state}</Body>
        </View>

        {/* Tee set picker */}
        <Text style={[styles.sectionLabel, { color: p.text }]}>Select tees</Text>
        {course.teeSets.length === 0 ? (
          <Muted>No tee data available for this course.</Muted>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {course.teeSets.map((ts) => {
              const selected = selectedTeeId === ts.id;
              return (
                <TouchableOpacity
                  key={ts.id}
                  onPress={() => setSelectedTeeId(ts.id)}
                  style={[styles.teeRow, { borderColor: selected ? p.primary : p.border, backgroundColor: selected ? p.successLight : p.surface }]}
                >
                  <View style={[styles.teeDot, { backgroundColor: ts.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.semibold, color: p.text }}>
                      {ts.name}
                    </Text>
                    <Text style={{ fontSize: fontSizes.small, color: p.muted }}>
                      {ts.yardage.toLocaleString()} yds · {ts.rating} / {ts.slope} · Par {ts.par}
                    </Text>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={20} color={p.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Holes */}
        <Text style={[styles.sectionLabel, { color: p.text }]}>Holes</Text>
        <Row gap={spacing.sm}>
          {([9, 18] as const).map((h) => (
            <TouchableOpacity
              key={h}
              onPress={() => setHoles(h)}
              style={[styles.holeChip, { borderColor: holes === h ? p.primary : p.border, backgroundColor: holes === h ? p.successLight : p.backgroundAlt }]}
            >
              <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.semibold, color: holes === h ? p.primary : p.text }}>
                {h} holes
              </Text>
            </TouchableOpacity>
          ))}
        </Row>

        <Button label="Start round" onPress={handleStart} size="lg" style={{ marginTop: spacing.xs }} />
        <Button label="Cancel" variant="ghost" onPress={onDismiss} size="sm" />
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────

export default function CourseSearchScreen() {
  const p = useTheme();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Course | null>(null);
  const hasApiKey = Boolean(env.EXPO_PUBLIC_GOLF_COURSE_API_KEY);

  const { results, isLoading, isDemoFallback } = useCourseSearch(query);

  const handleSelect = useCallback((item: CourseSearchResult) => {
    setSelected(item.course);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: p.primary }]}>
        <Row align="space-between">
          <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.xs }}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: fontSizes.heading, fontWeight: fontWeights.bold, color: "#FFF" }}>
            Select Course
          </Text>
          <View style={{ width: 36 }} />
        </Row>

        <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by course or city…"
            placeholderTextColor="rgba(255,255,255,0.55)"
            style={{ flex: 1, color: "#FFF", fontSize: fontSizes.body }}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>

        {!hasApiKey && (
          <View style={[styles.notice, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={{ flex: 1, fontSize: fontSizes.tiny, color: "rgba(255,255,255,0.8)" }}>
              Add EXPO_PUBLIC_GOLF_COURSE_API_KEY to .env to unlock 30,000+ real courses.
            </Text>
          </View>
        )}
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md }}>
          <ActivityIndicator size="large" color={p.primary} />
          <Muted>Searching courses…</Muted>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.course.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: 120 }}
          ListHeaderComponent={
            results.length > 0 && !isDemoFallback ? (
              <Muted style={{ marginBottom: spacing.sm }}>{results.length} course{results.length !== 1 ? "s" : ""} found</Muted>
            ) : null
          }
          ListEmptyComponent={
            query.length >= 2 ? (
              <View style={{ alignItems: "center", marginTop: spacing.xxxl, gap: spacing.md }}>
                <Ionicons name="golf-outline" size={48} color={p.mutedLight} />
                <Body color={p.muted}>No courses found for "{query}"</Body>
                <Muted>Try a different name or city</Muted>
              </View>
            ) : (
              <View style={{ alignItems: "center", marginTop: spacing.xxxl, gap: spacing.md }}>
                <Ionicons name="search-outline" size={48} color={p.mutedLight} />
                <Body color={p.muted}>Type to search courses</Body>
                {isDemoFallback && (
                  <Muted>Showing {demoCourses.length} demo courses</Muted>
                )}
              </View>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={[styles.resultCard, { backgroundColor: p.surface, borderColor: p.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.semibold, color: p.text }}>
                  {item.course.name}
                </Text>
                <Text style={{ fontSize: fontSizes.small, color: p.muted, marginTop: 2 }}>
                  {item.course.facilityName !== item.course.name ? `${item.course.facilityName} · ` : ""}
                  {item.course.city}, {item.course.state}
                </Text>
                {item.course.teeSets.length > 0 && (
                  <Text style={{ fontSize: fontSizes.tiny, color: p.mutedLight, marginTop: 3 }}>
                    {item.course.teeSets.map((ts) => ts.name).join(" · ")} · {item.course.holes.length} holes
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={p.mutedLight} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Tee selector overlay */}
      {selected && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.45)" }]}
            activeOpacity={1}
            onPress={() => setSelected(null)}
          />
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <TeeSelector course={selected} onDismiss={() => setSelected(null)} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
  searchBar: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.lg },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, padding: spacing.sm, borderRadius: radii.md },
  resultCard: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, gap: spacing.sm },
  sheet: { borderTopWidth: 1, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl },
  teeRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1.5 },
  teeDot: { width: 14, height: 14, borderRadius: 7 },
  holeChip: { flex: 1, alignItems: "center", paddingVertical: spacing.md, borderRadius: radii.lg, borderWidth: 1.5 },
  sectionLabel: { fontSize: fontSizes.small, fontWeight: fontWeights.semibold },
});
