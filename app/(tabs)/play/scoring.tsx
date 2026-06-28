import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Chip, Row, ScoreControl, ScoreDescriptor, useTheme } from "@/design-system/components";
import { demoCourses } from "@/features/courses/demoData";
import { analytics } from "@/lib/analytics";
import { fontSizes, fontWeights, radii, shadows, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import type { HoleScore, Round } from "@/types/domain";

type FairwayResult = HoleScore["fairway"];

const FAIRWAY_OPTIONS: { value: FairwayResult; label: string; icon: string }[] = [
  { value: "hit", label: "FIR ✓", icon: "checkmark" },
  { value: "miss_left", label: "Left", icon: "arrow-back" },
  { value: "miss_right", label: "Right", icon: "arrow-forward" },
  { value: "miss_short", label: "Short", icon: "arrow-down" },
  { value: "miss_long", label: "Long", icon: "arrow-up" },
  { value: "not_applicable", label: "N/A", icon: "remove" },
];

export default function ScoringScreen() {
  const activeRound = useAppStore((state) => state.activeRound);
  const activeCourse = useAppStore((state) => state.activeCourse);
  const scoreHole = useAppStore((state) => state.scoreHole);
  const advanceHole = useAppStore((state) => state.advanceHole);
  const abandonRound = useAppStore((state) => state.abandonRound);
  const saveRound = useAppStore((state) => state.saveRound);
  const profile = useAppStore((state) => state.profile);
  const p = useTheme();

  const [putts, setPutts] = useState(2);
  const [fairway, setFairway] = useState<FairwayResult>("hit");
  const [gir, setGir] = useState(false);
  const [penalty, setPenalty] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  if (!activeRound) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, padding: spacing.xl }}>
          <Ionicons name="golf-outline" size={56} color={p.mutedLight} />
          <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, color: p.text, textAlign: "center" }}>
            No active round
          </Text>
          <Text style={{ fontSize: fontSizes.body, color: p.muted, textAlign: "center", lineHeight: 22 }}>
            Start a round from the Play tab to begin hole-by-hole scoring.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[{ backgroundColor: p.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radii.md }]}
          >
            <Text style={{ color: p.primaryText, fontWeight: fontWeights.bold, fontSize: fontSizes.body }}>Go to Play</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Use real course from store; fall back to demo data if somehow missing
  const course = activeCourse ?? demoCourses.find((c) => c.id === activeRound.courseId);
  const currentHoleNum = activeRound.currentHole;
  const holeData = course?.holes.find((h) => h.number === currentHoleNum);
  const par = holeData?.par ?? 4;
  const yardage = holeData?.yardsByTeeSet[activeRound.teeSetId] ?? 0;
  const teeSet = course?.teeSets.find((ts) => ts.id === activeRound.teeSetId);

  const currentScore = activeRound.scores.find((s) => s.holeNumber === currentHoleNum)?.grossScore ?? par;
  const [score, setScore] = useState(currentScore);

  const runningTotal = activeRound.scores.reduce((sum, s) => {
    const holePar = course?.holes.find((h) => h.number === s.holeNumber)?.par ?? 4;
    return sum + (s.grossScore - holePar);
  }, 0);

  const isPar3 = par === 3;

  const saveCurrentHole = () => {
    const holeScore: HoleScore = {
      holeNumber: currentHoleNum,
      grossScore: score,
      putts,
      fairway: isPar3 ? "not_applicable" : fairway,
      greenInRegulation: gir,
      penaltyStrokes: penalty,
      sandSaveOpportunity: false,
      sandSaveMade: false,
      upAndDownOpportunity: false,
      upAndDownMade: false,
    };
    scoreHole(currentHoleNum, holeScore);
    analytics.track("hole_scored", { hole: currentHoleNum, score, par });
  };

  const goToHole = (holeNum: number) => {
    saveCurrentHole();
    advanceHole(holeNum);
    // Reset controls
    const existing = activeRound.scores.find((s) => s.holeNumber === holeNum);
    const nextHole = course?.holes[holeNum - 1];
    setScore(existing?.grossScore ?? (nextHole?.par ?? 4));
    setPutts(existing?.putts ?? 2);
    setFairway(existing?.fairway ?? "hit");
    setGir(existing?.greenInRegulation ?? false);
    setPenalty(existing?.penaltyStrokes ?? 0);
  };

  const handleFinish = () => {
    if (activeRound.scores.length < activeRound.holes - 1) {
      Alert.alert(
        "Finish round?",
        `You've scored ${activeRound.scores.length + 1} of ${activeRound.holes} holes. Submit anyway?`,
        [
          { text: "Keep scoring", style: "cancel" },
          { text: "Submit", style: "destructive", onPress: submitRound },
        ],
      );
    } else {
      submitRound();
    }
  };

  const submitRound = () => {
    saveCurrentHole();
    const round: Round = {
      id: activeRound.roundId,
      courseId: activeRound.courseId,
      teeSetId: activeRound.teeSetId,
      format: activeRound.format,
      holes: activeRound.holes,
      scores: activeRound.scores,
      verificationState: "self_reported",
      startedAt: activeRound.startedAt,
      submittedAt: new Date().toISOString(),
    };
    saveRound(round);
    abandonRound();
    analytics.track("round_completed", { courseId: round.courseId, grossScore: round.scores.reduce((s, h) => s + h.grossScore, 0) });
    Alert.alert(
      "Round submitted!",
      "Your round is saved as self-reported. Ask playing partners to verify to unlock leaderboard eligibility.",
      [{ text: "Done", onPress: () => router.replace("/(tabs)/play") }],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.primaryDark }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Navigation bar */}
        <View style={[styles.navBar, { borderBottomColor: "rgba(255,255,255,0.1)" }]}>
          <Pressable onPress={() => {
            Alert.alert("Leave round?", "Your progress auto-saved. You can resume from the Play tab.", [
              { text: "Stay", style: "cancel" },
              { text: "Leave", onPress: () => router.back() },
            ]);
          }}>
            <Ionicons name="chevron-down" size={24} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.courseNameText}>{course?.name ?? "Round"}</Text>
            <Text style={styles.teeSetText}>{teeSet?.name ?? "Standard"} tees · {teeSet?.rating ?? "—"} / {teeSet?.slope ?? "—"}</Text>
          </View>
          <Pressable onPress={handleFinish} style={[styles.finishBtn, { borderColor: "rgba(255,255,255,0.4)" }]}>
            <Text style={{ color: "#FFFFFF", fontSize: fontSizes.tiny, fontWeight: fontWeights.bold }}>FINISH</Text>
          </Pressable>
        </View>

        {/* Hole dots */}
        <View style={styles.holeDotsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.holeDots}>
            {Array.from({ length: activeRound.holes }, (_, i) => {
              const num = i + 1;
              const scored = activeRound.scores.find((s) => s.holeNumber === num);
              const isCurrent = num === currentHoleNum;
              const diff = scored ? scored.grossScore - (course?.holes.find((h) => h.number === num)?.par ?? 4) : null;
              return (
                <Pressable key={num} onPress={() => goToHole(num)} style={styles.holeDot}>
                  <View style={[
                    styles.dotCircle,
                    isCurrent && { backgroundColor: "#FFFFFF", transform: [{ scale: 1.3 }] },
                    !isCurrent && scored && { backgroundColor: dotColor(diff) },
                    !isCurrent && !scored && { backgroundColor: "rgba(255,255,255,0.2)" },
                  ]}>
                    <Text style={[styles.dotText, isCurrent && { color: p.primaryDark }, !isCurrent && { color: "#FFFFFF" }]}>
                      {num}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Hole header */}
        <View style={styles.holeHeader}>
          <View>
            <Text style={styles.holeLabel}>HOLE {currentHoleNum}</Text>
            <Text style={styles.parLabel}>Par {par} · {yardage > 0 ? `${yardage} yds` : "—"}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <Pressable
              onPress={() => router.push("/(tabs)/play/scorecard")}
              style={[styles.mapBtn, { borderColor: "rgba(255,255,255,0.3)" }]}
            >
              <Ionicons name="document-outline" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold }}>CARD</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/play/hole-map")}
              style={[styles.mapBtn, { borderColor: "rgba(255,255,255,0.3)" }]}
            >
              <Ionicons name="map-outline" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold }}>MAP</Text>
            </Pressable>
            <View style={styles.runningTotal}>
              <Text style={styles.runningTotalValue}>{runningTotal === 0 ? "E" : (runningTotal > 0 ? `+${runningTotal}` : String(runningTotal))}</Text>
              <Text style={styles.runningTotalLabel}>TOTAL</Text>
            </View>
          </View>
        </View>

        {/* Main score control */}
        <View style={styles.scoreArea}>
          <ScoreControl
            value={score}
            onDecrement={() => setScore((s) => Math.max(1, s - 1))}
            onIncrement={() => setScore((s) => Math.min(15, s + 1))}
          />
          <View style={{ marginTop: spacing.lg }}>
            <ScoreDescriptor score={score} par={par} />
          </View>
        </View>

        {/* Details panel toggle */}
        <Pressable onPress={() => setShowDetails(!showDetails)} style={styles.detailsToggle}>
          <Text style={styles.detailsToggleText}>
            Putts · {putts} &nbsp;|&nbsp; {isPar3 ? "N/A" : (fairway === "hit" ? "FIR ✓" : fairway.replace("miss_", "").replace("_", " "))} &nbsp;|&nbsp; GIR {gir ? "✓" : "✗"}
          </Text>
          <Ionicons name={showDetails ? "chevron-down" : "chevron-up"} size={16} color="rgba(255,255,255,0.6)" />
        </Pressable>

        {showDetails && (
          <View style={[styles.detailsPanel, { backgroundColor: "rgba(0,0,0,0.3)" }]}>
            <ScrollView>
              {/* Putts */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Putts</Text>
                <Row gap={spacing.md}>
                  <Pressable onPress={() => setPutts((p) => Math.max(0, p - 1))} style={styles.smallCounter}>
                    <Text style={styles.counterText}>−</Text>
                  </Pressable>
                  <Text style={styles.counterValue}>{putts}</Text>
                  <Pressable onPress={() => setPutts((p) => Math.min(8, p + 1))} style={styles.smallCounter}>
                    <Text style={styles.counterText}>+</Text>
                  </Pressable>
                </Row>
              </View>

              {/* Fairway */}
              {!isPar3 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fairway</Text>
                  <Row gap={spacing.xs}>
                    {FAIRWAY_OPTIONS.filter((o) => o.value !== "not_applicable").map((opt) => (
                      <Pressable
                        key={opt.value}
                        onPress={() => setFairway(opt.value)}
                        style={[styles.fairwayBtn, fairway === opt.value && { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.6)" }]}
                      >
                        <Text style={{ fontSize: fontSizes.tiny, color: "#FFFFFF", fontWeight: fontWeights.semibold }}>{opt.label}</Text>
                      </Pressable>
                    ))}
                  </Row>
                </View>
              )}

              {/* GIR */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Green in Regulation</Text>
                <Pressable onPress={() => setGir(!gir)} style={[styles.toggle, gir && { backgroundColor: p.primary }]}>
                  <Text style={{ color: "#FFFFFF", fontWeight: fontWeights.bold, fontSize: fontSizes.small }}>
                    {gir ? "Yes" : "No"}
                  </Text>
                </Pressable>
              </View>

              {/* Penalty */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Penalty strokes</Text>
                <Row gap={spacing.md}>
                  <Pressable onPress={() => setPenalty((p) => Math.max(0, p - 1))} style={styles.smallCounter}>
                    <Text style={styles.counterText}>−</Text>
                  </Pressable>
                  <Text style={styles.counterValue}>{penalty}</Text>
                  <Pressable onPress={() => setPenalty((p) => Math.min(5, p + 1))} style={styles.smallCounter}>
                    <Text style={styles.counterText}>+</Text>
                  </Pressable>
                </Row>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Hole navigation */}
        <View style={[styles.holeNav, { borderTopColor: "rgba(255,255,255,0.1)" }]}>
          <Pressable
            onPress={() => { if (currentHoleNum > 1) goToHole(currentHoleNum - 1); }}
            style={[styles.navBtn, { opacity: currentHoleNum <= 1 ? 0.3 : 1 }]}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            <Text style={styles.navBtnText}>HOLE {currentHoleNum - 1}</Text>
          </Pressable>

          <Pressable
            onPress={() => { saveCurrentHole(); }}
            style={[styles.saveBtn, { backgroundColor: p.accent }]}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontWeight: fontWeights.bold, fontSize: fontSizes.small }}>SAVE</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (currentHoleNum < activeRound.holes) {
                goToHole(currentHoleNum + 1);
              } else {
                handleFinish();
              }
            }}
            style={styles.navBtn}
          >
            <Text style={styles.navBtnText}>{currentHoleNum < activeRound.holes ? `HOLE ${currentHoleNum + 1}` : "FINISH"}</Text>
            <Ionicons name={currentHoleNum < activeRound.holes ? "chevron-forward" : "checkmark-done"} size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function dotColor(diff: number | null): string {
  if (diff == null) return "rgba(255,255,255,0.2)";
  if (diff <= -2) return "#C8981E";
  if (diff === -1) return "#2E9459";
  if (diff === 0) return "rgba(255,255,255,0.4)";
  if (diff === 1) return "#AE2119";
  return "#7A1510";
}

const styles = StyleSheet.create({
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
  courseNameText: { color: "#FFFFFF", fontSize: fontSizes.body, fontWeight: fontWeights.bold },
  teeSetText: { color: "rgba(255,255,255,0.6)", fontSize: fontSizes.tiny, marginTop: 2 },
  finishBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full, borderWidth: 1 },
  holeDotsContainer: { paddingVertical: spacing.sm },
  holeDots: { flexDirection: "row", paddingHorizontal: spacing.lg, gap: spacing.sm },
  holeDot: { alignItems: "center", justifyContent: "center" },
  dotCircle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dotText: { fontSize: fontSizes.tiny, fontWeight: fontWeights.bold },
  holeHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  holeLabel: { color: "#FFFFFF", fontSize: fontSizes.title, fontWeight: fontWeights.heavy, letterSpacing: -0.3 },
  parLabel: { color: "rgba(255,255,255,0.65)", fontSize: fontSizes.body, marginTop: 4 },
  mapBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.md, borderWidth: 1 },
  runningTotal: { alignItems: "flex-end" },
  runningTotalValue: { color: "#FFFFFF", fontSize: fontSizes.title, fontWeight: fontWeights.heavy },
  runningTotalLabel: { color: "rgba(255,255,255,0.5)", fontSize: fontSizes.micro, letterSpacing: 1, textTransform: "uppercase" },
  scoreArea: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  detailsToggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.1)" },
  detailsToggleText: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.small },
  detailsPanel: { maxHeight: 240 },
  detailRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.1)" },
  detailLabel: { color: "rgba(255,255,255,0.75)", fontSize: fontSizes.small, fontWeight: fontWeights.medium },
  smallCounter: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  counterText: { color: "#FFFFFF", fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, lineHeight: 24 },
  counterValue: { color: "#FFFFFF", fontSize: fontSizes.subheading, fontWeight: fontWeights.heavy, minWidth: 28, textAlign: "center" },
  fairwayBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.sm, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "transparent" },
  toggle: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full, backgroundColor: "rgba(255,255,255,0.15)" },
  holeNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1 },
  navBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm, minWidth: 100 },
  navBtnText: { color: "#FFFFFF", fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, letterSpacing: 0.5 },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.full },
});
