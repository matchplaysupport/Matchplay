import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { demoCourses } from "@/features/courses/demoData";
import { getLiveScoringProvider, type ScoreInput } from "@/integrations/liveScoring/LiveScoringProvider";
import {
  computeScoreboard,
  formatPosition,
  formatThru,
  formatToPar,
  holeParsFrom,
  type HolePars,
} from "@/services/liveEvents";
import { flushQueue, getPendingCount, startQueueFlusher, submitScores } from "@/lib/offlineQueue";
import { useAppStore } from "@/stores/appStore";
import type { EventParticipant, LiveEvent, LiveScore } from "@/types/domain";

const DEFAULT_SLUG = "riverbend-junior-open";

export default function GroupScoringScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const eventSlug = slug ?? DEFAULT_SLUG;
  const profileId = useAppStore((s) => s.profile?.id ?? null);
  const p = useTheme();

  const provider = useMemo(() => getLiveScoringProvider(), []);

  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [field, setField] = useState<EventParticipant[]>([]);
  const [group, setGroup] = useState<EventParticipant[]>([]);
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [currentHole, setCurrentHole] = useState(1);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const [showBoard, setShowBoard] = useState(true);

  // Par lookup (mock mode has the course locally; live falls back to par 4).
  const pars: HolePars = useMemo(() => {
    const course = demoCourses.find((c) => c.id === event?.courseId);
    return course ? holeParsFrom(course.holes) : {};
  }, [event?.courseId]);

  const par = pars[currentHole] ?? 4;
  const holes = event?.holes ?? 18;

  // Merge a single live score into local state (last-write-wins per cell).
  const mergeScore = useCallback((incoming: LiveScore) => {
    setScores((prev) => {
      const next = prev.filter(
        (s) => !(s.participantId === incoming.participantId && s.holeNumber === incoming.holeNumber),
      );
      next.push(incoming);
      return next;
    });
  }, []);

  // Initial load.
  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      const evt = await provider.getEventBySlug(eventSlug);
      if (!active) return;
      if (!evt) {
        setAccessError("Event not found.");
        setLoading(false);
        return;
      }
      const my = profileId ? await provider.getMyScorerGroup(evt.id, profileId) : null;
      if (!active) return;
      if (!my) {
        setEvent(evt);
        setAccessError("You're not assigned as a scorer for this event.");
        setLoading(false);
        return;
      }
      const [allParticipants, groupParticipants, liveScores] = await Promise.all([
        provider.listParticipants(evt.id),
        provider.listParticipants(evt.id, my.groupNo ?? undefined),
        provider.getLiveScores(evt.id),
      ]);
      if (!active) return;
      setEvent(evt);
      setField(allParticipants);
      setGroup(groupParticipants);
      setScores(liveScores);
      setAccessError(null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [provider, eventSlug, profileId]);

  // Live subscription + offline-queue flusher.
  useEffect(() => {
    if (!event) return;
    const unsubscribe = provider.subscribe(event.id, mergeScore);
    const stopFlusher = startQueueFlusher(provider);
    return () => {
      unsubscribe();
      stopFlusher();
    };
  }, [provider, event, mergeScore]);

  // Seed the draft for the current hole from whatever's already recorded.
  const groupRef = useRef(group);
  groupRef.current = group;
  useEffect(() => {
    const seeded: Record<string, number> = {};
    for (const member of groupRef.current) {
      const existing = scores.find(
        (s) => s.participantId === member.id && s.holeNumber === currentHole,
      );
      seeded[member.id] = existing?.strokes ?? pars[currentHole] ?? 4;
    }
    setDraft(seeded);
    // Re-seed only when the hole changes or the group loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHole, group]);

  const refreshPending = useCallback(() => {
    void getPendingCount().then(setPending);
  }, []);
  useEffect(refreshPending, [refreshPending]);

  const adjust = (participantId: string, delta: number) => {
    setDraft((d) => {
      const next = Math.max(1, Math.min(20, (d[participantId] ?? par) + delta));
      return { ...d, [participantId]: next };
    });
  };

  const saveHole = async () => {
    if (!event) return;
    const inputs: ScoreInput[] = group.map((m) => ({
      participantId: m.id,
      holeNumber: currentHole,
      strokes: draft[m.id] ?? par,
    }));
    // Optimistic local update so the board moves instantly.
    for (const i of inputs) {
      mergeScore({ participantId: i.participantId, holeNumber: i.holeNumber, strokes: i.strokes });
    }
    const reached = await submitScores(provider, event.id, profileId, inputs);
    if (!reached) refreshPending();
    else void flushQueue(provider).then(refreshPending);
    if (currentHole < holes) setCurrentHole((h) => h + 1);
  };

  const board = useMemo(
    () => computeScoreboard(field, scores, pars),
    [field, scores, pars],
  );

  const groupIds = useMemo(() => new Set(group.map((g) => g.id)), [group]);
  const holeComplete = (hole: number) =>
    group.length > 0 && group.every((m) => scores.some((s) => s.participantId === m.id && s.holeNumber === hole));

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: p.primaryDark, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  if (accessError) {
    return (
      <View style={{ flex: 1, backgroundColor: p.primaryDark }}>
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, padding: spacing.xl }}>
          <Ionicons name="lock-closed-outline" size={48} color="rgba(255,255,255,0.7)" />
          <Text style={{ color: "#FFFFFF", fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, textAlign: "center" }}>
            {event?.name ?? "Live event"}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: fontSizes.body, textAlign: "center", lineHeight: 22 }}>
            {accessError}
          </Text>
          <Pressable onPress={() => router.back()} style={{ backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radii.md }}>
            <Text style={{ color: "#FFFFFF", fontWeight: fontWeights.bold }}>Go back</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: p.primaryDark }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-down" size={24} color="rgba(255,255,255,0.85)" />
          </Pressable>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={styles.eventName} numberOfLines={1}>{event?.name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE · Group {group[0]?.groupNo ?? "—"}</Text>
            </View>
          </View>
          <View style={{ width: 24, alignItems: "flex-end" }}>
            {pending > 0 && (
              <View style={styles.offlinePill}>
                <Ionicons name="cloud-offline-outline" size={12} color="#FFFFFF" />
                <Text style={styles.offlineText}>{pending}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Hole strip */}
        <View style={styles.holeStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}>
            {Array.from({ length: holes }, (_, i) => i + 1).map((h) => {
              const isCurrent = h === currentHole;
              const done = holeComplete(h);
              return (
                <Pressable key={h} onPress={() => setCurrentHole(h)} style={[
                  styles.holeChip,
                  isCurrent && { backgroundColor: "#FFFFFF" },
                  !isCurrent && done && { backgroundColor: "rgba(255,255,255,0.28)" },
                ]}>
                  <Text style={[styles.holeChipText, isCurrent && { color: p.primaryDark }]}>{h}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
          {/* Hole header */}
          <View style={styles.holeHeader}>
            <Text style={styles.holeLabel}>HOLE {currentHole}</Text>
            <Text style={styles.parLabel}>Par {par}</Text>
          </View>

          {/* Per-player entry */}
          <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
            {group.map((member) => {
              const val = draft[member.id] ?? par;
              const rel = val - par;
              return (
                <View key={member.id} style={styles.playerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.playerName} numberOfLines={1}>{member.displayName}</Text>
                    <Text style={styles.playerRel}>{rel === 0 ? "Par" : formatToPar(rel)}</Text>
                  </View>
                  <Pressable onPress={() => adjust(member.id, -1)} style={styles.stepBtn}>
                    <Text style={styles.stepText}>−</Text>
                  </Pressable>
                  <Text style={styles.stepValue}>{val}</Text>
                  <Pressable onPress={() => adjust(member.id, 1)} style={[styles.stepBtn, { backgroundColor: p.primary }]}>
                    <Text style={[styles.stepText, { color: p.primaryText }]}>+</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Save */}
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <Pressable onPress={saveHole} style={[styles.saveBtn, { backgroundColor: p.accent }]}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveText}>
                {currentHole < holes ? "SAVE & NEXT HOLE" : "SAVE FINAL HOLE"}
              </Text>
            </Pressable>
          </View>

          {/* Live leaderboard */}
          <Pressable onPress={() => setShowBoard((s) => !s)} style={styles.boardToggle}>
            <Text style={styles.boardToggleText}>Live leaderboard · {field.length} players</Text>
            <Ionicons name={showBoard ? "chevron-up" : "chevron-down"} size={16} color="rgba(255,255,255,0.6)" />
          </Pressable>

          {showBoard && (
            <View style={styles.board}>
              {board.map((row) => {
                const mine = groupIds.has(row.participantId);
                return (
                  <View key={row.participantId} style={[styles.boardRow, mine && { backgroundColor: "rgba(255,255,255,0.10)" }]}>
                    <Text style={styles.boardPos}>{formatPosition(row, board)}</Text>
                    <Text style={styles.boardName} numberOfLines={1}>{row.displayName}</Text>
                    <Text style={styles.boardThru}>{formatThru(row.thru, holes)}</Text>
                    <Text style={[styles.boardToPar, row.toPar < 0 && { color: "#7CE2A6" }]}>{formatToPar(row.toPar)}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  eventName: { color: "#FFFFFF", fontSize: fontSizes.body, fontWeight: fontWeights.bold },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#7CE2A6" },
  liveText: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, letterSpacing: 0.5 },
  offlinePill: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.full },
  offlineText: { color: "#FFFFFF", fontSize: fontSizes.micro, fontWeight: fontWeights.bold },
  holeStrip: { paddingVertical: spacing.sm },
  holeChip: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  holeChipText: { color: "#FFFFFF", fontSize: fontSizes.small, fontWeight: fontWeights.bold },
  holeHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  holeLabel: { color: "#FFFFFF", fontSize: fontSizes.title, fontWeight: fontWeights.heavy, letterSpacing: -0.3 },
  parLabel: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.body },
  playerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  playerName: { color: "#FFFFFF", fontSize: fontSizes.body, fontWeight: fontWeights.semibold },
  playerRel: { color: "rgba(255,255,255,0.55)", fontSize: fontSizes.tiny, marginTop: 1 },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  stepText: { color: "#FFFFFF", fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, lineHeight: 26 },
  stepValue: { color: "#FFFFFF", fontSize: fontSizes.subheading, fontWeight: fontWeights.heavy, minWidth: 32, textAlign: "center" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md, borderRadius: radii.full },
  saveText: { color: "#FFFFFF", fontSize: fontSizes.body, fontWeight: fontWeights.bold, letterSpacing: 0.5 },
  boardToggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.lg, marginTop: spacing.sm },
  boardToggleText: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.small, fontWeight: fontWeights.semibold },
  board: { paddingHorizontal: spacing.lg, gap: 2 },
  boardRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radii.sm },
  boardPos: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.small, fontWeight: fontWeights.bold, width: 36 },
  boardName: { color: "#FFFFFF", fontSize: fontSizes.body, fontWeight: fontWeights.medium, flex: 1 },
  boardThru: { color: "rgba(255,255,255,0.55)", fontSize: fontSizes.tiny, width: 32, textAlign: "center" },
  boardToPar: { color: "#FFFFFF", fontSize: fontSizes.body, fontWeight: fontWeights.heavy, width: 44, textAlign: "right" },
});
