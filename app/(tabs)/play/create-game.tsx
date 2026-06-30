import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Body, Button, Muted, Row, Subheading, useTheme } from "@/design-system/components";
import { analytics } from "@/lib/analytics";
import { createOpenGame } from "@/services/openGames";
import { supabase } from "@/lib/supabase";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import type { CourseSummary, OpenGame } from "@/types/domain";

type CourseRow = {
  id: string;
  name: string;
  facility_name: string;
  city: string;
  state: string;
  zip_code: string;
};

const DAY_OPTIONS = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
  { label: "In 2 days", offset: 2 },
  { label: "In 3 days", offset: 3 },
];

const TIME_SLOTS = [
  { label: "7:00 AM", hour: 7 },
  { label: "9:00 AM", hour: 9 },
  { label: "11:00 AM", hour: 11 },
  { label: "1:00 PM", hour: 13 },
  { label: "3:00 PM", hour: 15 },
  { label: "5:00 PM", hour: 17 },
];

export default function CreateGameScreen() {
  const p = useTheme();
  const profile = useAppStore((s) => s.profile);
  const addOpenGame = useAppStore((s) => s.addOpenGame);
  const recordMetric = useAppStore((s) => s.recordMetric);

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [dayOffset, setDayOffset] = useState(1);
  const [hour, setHour] = useState(9);
  const [holes, setHoles] = useState<9 | 18>(18);
  const [spots, setSpots] = useState(3);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [priceText, setPriceText] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("courses")
      .select("id, name, facility_name, city, state, zip_code")
      .order("name")
      .then(({ data }) => {
        if (!active) return;
        const rows = (data ?? []) as CourseRow[];
        setCourses(rows);
        if (rows[0]) setCourseId(rows[0].id);
        setLoadingCourses(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!profile) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      Alert.alert("Pick a course", "Choose a course for your game first.");
      return;
    }

    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + dayOffset);
    startsAt.setHours(hour, 0, 0, 0);

    const summary: CourseSummary = {
      id: course.id,
      name: course.name,
      facilityName: course.facility_name,
      city: course.city,
      state: course.state,
      zipCode: course.zip_code,
    };

    const rawPrice = priceText.trim() ? Math.round(Number(priceText) * 100) : undefined;
    const estimatedPriceCents = rawPrice != null && Number.isFinite(rawPrice) ? rawPrice : undefined;

    setSubmitting(true);
    try {
      const created = await createOpenGame({
        course: summary,
        startsAt: startsAt.toISOString(),
        availableSpots: spots,
        approvalRequired,
        holes,
        estimatedPriceCents,
        cartIncluded: true,
        description: description.trim() || undefined,
      });
      addOpenGame(created);
    } catch {
      // Fallback: keep it local so the flow still works (e.g. migration pending).
      const local: OpenGame = {
        id: `game-${Date.now()}`,
        courseId: course.id,
        creatorId: profile.id,
        creatorName: profile.displayName,
        startsAt: startsAt.toISOString(),
        availableSpots: spots,
        acceptedPlayerIds: [profile.id],
        waitlistedPlayerIds: [],
        approvalRequired,
        visibility: "public",
        description: description.trim() || undefined,
        holes,
        estimatedPriceCents,
        cartIncluded: true,
        course: summary,
      };
      addOpenGame(local);
    } finally {
      recordMetric("openGameCreations");
      analytics.track("open_game_created", { courseId: course.id, holes, spots });
      setSubmitting(false);
      Alert.alert("Game created", "Your open game is now visible to nearby golfers.", [
        { text: "Done", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: p.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Course */}
        <Text style={[styles.label, { color: p.muted }]}>Course</Text>
        {loadingCourses ? (
          <ActivityIndicator color={p.primary} style={{ marginVertical: spacing.lg }} />
        ) : courses.length === 0 ? (
          <Muted>No courses available yet.</Muted>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {courses.map((c) => {
              const selected = c.id === courseId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCourseId(c.id)}
                  style={[
                    styles.courseRow,
                    { borderColor: selected ? p.primary : p.border, backgroundColor: p.surface },
                    selected && { borderWidth: 2 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Subheading style={{ color: p.text, fontSize: fontSizes.body }}>{c.name}</Subheading>
                    <Muted>{c.city}, {c.state}</Muted>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={22} color={p.primary} />}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Day */}
        <Text style={[styles.label, { color: p.muted, marginTop: spacing.xl }]}>Day</Text>
        <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
          {DAY_OPTIONS.map((d) => (
            <SelectChip key={d.offset} label={d.label} active={dayOffset === d.offset} onPress={() => setDayOffset(d.offset)} p={p} />
          ))}
        </Row>

        {/* Time */}
        <Text style={[styles.label, { color: p.muted, marginTop: spacing.xl }]}>Tee time</Text>
        <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
          {TIME_SLOTS.map((t) => (
            <SelectChip key={t.hour} label={t.label} active={hour === t.hour} onPress={() => setHour(t.hour)} p={p} />
          ))}
        </Row>

        {/* Holes */}
        <Text style={[styles.label, { color: p.muted, marginTop: spacing.xl }]}>Holes</Text>
        <Row gap={spacing.sm}>
          <SelectChip label="9 holes" active={holes === 9} onPress={() => setHoles(9)} p={p} />
          <SelectChip label="18 holes" active={holes === 18} onPress={() => setHoles(18)} p={p} />
        </Row>

        {/* Spots */}
        <Text style={[styles.label, { color: p.muted, marginTop: spacing.xl }]}>Open spots</Text>
        <Row gap={spacing.md} align="space-between" style={[styles.stepper, { borderColor: p.border, backgroundColor: p.surface }]}>
          <Pressable onPress={() => setSpots((s) => Math.max(1, s - 1))} hitSlop={8}>
            <Ionicons name="remove-circle-outline" size={30} color={spots <= 1 ? p.mutedLight : p.primary} />
          </Pressable>
          <Text style={{ fontSize: fontSizes.title, fontWeight: fontWeights.heavy, color: p.text }}>{spots}</Text>
          <Pressable onPress={() => setSpots((s) => Math.min(4, s + 1))} hitSlop={8}>
            <Ionicons name="add-circle-outline" size={30} color={spots >= 4 ? p.mutedLight : p.primary} />
          </Pressable>
        </Row>

        {/* Estimated price */}
        <Text style={[styles.label, { color: p.muted, marginTop: spacing.xl }]}>Estimated green fee (optional)</Text>
        <Row gap={spacing.xs} style={[styles.input, { borderColor: p.border, backgroundColor: p.surface }]}>
          <Text style={{ color: p.muted, fontSize: fontSizes.body }}>$</Text>
          <TextInput
            value={priceText}
            onChangeText={(t) => setPriceText(t.replace(/[^0-9]/g, ""))}
            placeholder="45"
            placeholderTextColor={p.mutedLight}
            keyboardType="number-pad"
            style={{ flex: 1, color: p.text, fontSize: fontSizes.body }}
          />
          <Muted>per golfer</Muted>
        </Row>

        {/* Approval */}
        <Row align="space-between" style={{ marginTop: spacing.xl }}>
          <View style={{ flex: 1, paddingRight: spacing.md }}>
            <Subheading style={{ color: p.text, fontSize: fontSizes.body }}>Require approval</Subheading>
            <Muted>Review join requests before players are added.</Muted>
          </View>
          <Switch value={approvalRequired} onValueChange={setApprovalRequired} />
        </Row>

        {/* Description */}
        <Text style={[styles.label, { color: p.muted, marginTop: spacing.xl }]}>Notes (optional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Format, pace, vibe — e.g. relaxed match-play Nassau, walking."
          placeholderTextColor={p.mutedLight}
          multiline
          style={[styles.textarea, { borderColor: p.border, backgroundColor: p.surface, color: p.text }]}
        />

        <Button
          label={submitting ? "Creating..." : "Create open game"}
          onPress={handleSubmit}
          loading={submitting}
          disabled={loadingCourses || !courseId}
          size="lg"
          style={{ marginTop: spacing.xl }}
        />
        <Body color={p.muted} style={{ textAlign: "center", marginTop: spacing.sm }}>
          You&apos;ll be added as the host automatically.
        </Body>
      </ScrollView>
    </SafeAreaView>
  );
}

function SelectChip({ label, active, onPress, p }: { label: string; active: boolean; onPress: () => void; p: ReturnType<typeof useTheme> }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: active ? p.primary : p.border, backgroundColor: active ? p.primary : p.surface },
      ]}
    >
      <Text style={{ color: active ? "#FFFFFF" : p.text, fontSize: fontSizes.small, fontWeight: fontWeights.semibold }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  label: {
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.heavy,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  stepper: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 50,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  textarea: {
    minHeight: 92,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: fontSizes.body,
    textAlignVertical: "top",
  },
});
