import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Row, useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import { useEntitlement } from "@/hooks/useEntitlement";
import { PaywallScreen } from "@/components/PaywallScreen";
import { env } from "@/lib/env";

const COL = 40;
const LABEL_COL = 68;
const SUBTOTAL_COL = 50;

type CellVariant = "normal" | "subtotal" | "label" | "header";

function Cell({
  value,
  variant = "normal",
  highlight,
  color,
  width = COL,
  borderRight,
}: {
  value: string | number;
  variant?: CellVariant;
  highlight?: boolean;
  color?: string;
  width?: number;
  borderRight?: boolean;
}) {
  const p = useTheme();
  const bg =
    variant === "header"
      ? p.primaryDark
      : variant === "subtotal"
        ? p.backgroundAlt
        : highlight
          ? p.successLight
          : p.surface;

  const textColor =
    color ??
    (variant === "header"
      ? "#FFFFFF"
      : variant === "subtotal"
        ? p.text
        : highlight
          ? p.primary
          : p.text);

  return (
    <View
      style={[
        styles.cell,
        { width, backgroundColor: bg, borderRightColor: p.border, borderRightWidth: borderRight ? StyleSheet.hairlineWidth : 0 },
      ]}
    >
      <Text
        style={{
          fontSize: variant === "header" ? fontSizes.tiny : fontSizes.small,
          fontWeight:
            variant === "header" || variant === "subtotal" || highlight
              ? fontWeights.heavy
              : fontWeights.regular,
          color: textColor,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {String(value)}
      </Text>
    </View>
  );
}

function ScoreCell({ score, par }: { score: number | null; par: number }) {
  const p = useTheme();
  if (score === null) return <Cell value="—" color={p.mutedLight} />;

  const diff = score - par;
  let bg = "transparent";
  let textColor = p.text;
  let border: string | undefined;

  if (diff <= -2) { bg = "#C8981E"; textColor = "#FFF"; }
  else if (diff === -1) { bg = p.primary; textColor = "#FFF"; }
  else if (diff === 0) { textColor = p.text; }
  else if (diff === 1) { border = "#AE2119"; textColor = "#AE2119"; }
  else { bg = "#AE2119"; textColor = "#FFF"; }

  return (
    <View style={[styles.cell, { width: COL }]}>
      <View style={[styles.scoreCircle, { backgroundColor: bg, borderWidth: border ? 1.5 : 0, borderColor: border ?? "transparent" }]}>
        <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.heavy, color: textColor, textAlign: "center" }}>
          {score}
        </Text>
      </View>
    </View>
  );
}

export default function ScorecardScreen() {
  const { can } = useEntitlement();
  if (!env.EXPO_PUBLIC_USE_MOCK_AUTH && !can("scoring")) {
    return <PaywallScreen requiredTier="plus" title="Scorecard is a Match Play+ feature" description="View your full scorecard with hole-by-hole stats and shot tracking." />;
  }

  const p = useTheme();
  const activeCourse = useAppStore((s) => s.activeCourse);
  const activeRound = useAppStore((s) => s.activeRound);
  const [selectedTeeId, setSelectedTeeId] = useState(activeRound?.teeSetId ?? activeCourse?.teeSets[0]?.id ?? "");

  const course = activeCourse;
  const teeSet = course?.teeSets.find((ts) => ts.id === selectedTeeId) ?? course?.teeSets[0];

  const getScore = (holeNum: number): number | null =>
    activeRound?.scores.find((s) => s.holeNumber === holeNum)?.grossScore ?? null;

  const getYards = (holeNum: number): number => {
    const hole = course?.holes.find((h) => h.number === holeNum);
    if (!hole || !teeSet) return 0;
    return hole.yardsByTeeSet[teeSet.id] ?? 0;
  };

  const frontHoles = Array.from({ length: 9 }, (_, i) => i + 1);
  const backHoles = Array.from({ length: 9 }, (_, i) => i + 10);

  const frontPar = frontHoles.reduce((s, n) => s + (course?.holes.find((h) => h.number === n)?.par ?? 0), 0);
  const backPar = backHoles.reduce((s, n) => s + (course?.holes.find((h) => h.number === n)?.par ?? 0), 0);
  const totalPar = frontPar + backPar;

  const frontYards = frontHoles.reduce((s, n) => s + getYards(n), 0);
  const backYards = backHoles.reduce((s, n) => s + getYards(n), 0);
  const totalYards = frontYards + backYards;

  const frontScore = frontHoles.reduce<number | null>((s, n) => {
    const sc = getScore(n);
    return sc != null ? (s ?? 0) + sc : s;
  }, null);
  const backScore = backHoles.reduce<number | null>((s, n) => {
    const sc = getScore(n);
    return sc != null ? (s ?? 0) + sc : s;
  }, null);
  const totalScore = frontScore != null && backScore != null ? frontScore + backScore : (frontScore ?? backScore);

  if (!course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md }}>
          <Ionicons name="document-outline" size={48} color={p.mutedLight} />
          <Text style={{ color: p.muted }}>No active course</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: p.primary }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderHalfCard = (holeNums: number[], label: "OUT" | "IN") => {
    const isOut = label === "OUT";
    const subtotalYards = isOut ? frontYards : backYards;
    const subtotalPar = isOut ? frontPar : backPar;
    const subtotalScore = isOut ? frontScore : backScore;

    return (
      <View style={[styles.halfCard, { backgroundColor: p.surface, borderColor: p.border }]}>
        {/* Column headers */}
        <View style={styles.row}>
          <Cell value="HOLE" variant="header" width={LABEL_COL} borderRight />
          {holeNums.map((n) => <Cell key={n} value={n} variant="header" />)}
          <Cell value={label} variant="header" width={SUBTOTAL_COL} color="#FFE066" />
        </View>

        {/* Tee selector row */}
        <View style={styles.row}>
          <View style={[{ width: LABEL_COL, paddingHorizontal: 4, justifyContent: "center", borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: p.border }, styles.cell]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Row gap={4}>
                {course.teeSets.map((ts) => (
                  <TouchableOpacity
                    key={ts.id}
                    onPress={() => setSelectedTeeId(ts.id)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                  >
                    <View style={[styles.teeDot, { backgroundColor: ts.color, borderWidth: selectedTeeId === ts.id ? 2 : 0, borderColor: p.primary }]} />
                  </TouchableOpacity>
                ))}
              </Row>
            </ScrollView>
          </View>
          {holeNums.map((n) => <Cell key={n} value={getYards(n) || "—"} color={p.muted} />)}
          <Cell value={subtotalYards || "—"} variant="subtotal" width={SUBTOTAL_COL} color={p.muted} />
        </View>

        {/* Par row */}
        <View style={[styles.row, { backgroundColor: p.backgroundAlt }]}>
          <Cell value="PAR" variant="label" width={LABEL_COL} color={p.muted} borderRight />
          {holeNums.map((n) => {
            const par = course.holes.find((h) => h.number === n)?.par ?? 0;
            return <Cell key={n} value={par} color={p.muted} />;
          })}
          <Cell value={subtotalPar} variant="subtotal" width={SUBTOTAL_COL} color={p.muted} />
        </View>

        {/* HCP row */}
        <View style={styles.row}>
          <Cell value="HCP" variant="label" width={LABEL_COL} color={p.mutedLight} borderRight />
          {holeNums.map((n) => {
            const hcp = course.holes.find((h) => h.number === n)?.handicap ?? 0;
            return <Cell key={n} value={hcp} color={p.mutedLight} />;
          })}
          <Cell value="—" width={SUBTOTAL_COL} color={p.mutedLight} />
        </View>

        {/* Score row */}
        <View style={[styles.row, { borderTopWidth: 2, borderTopColor: p.primary }]}>
          <Cell value="SCORE" variant="label" width={LABEL_COL} color={p.primary} borderRight />
          {holeNums.map((n) => {
            const par = course.holes.find((h) => h.number === n)?.par ?? 4;
            return <ScoreCell key={n} score={getScore(n)} par={par} />;
          })}
          <Cell
            value={subtotalScore ?? "—"}
            variant="subtotal"
            width={SUBTOTAL_COL}
            highlight={subtotalScore != null}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: p.primary }]}>
        <Row align="space-between">
          <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.xs }}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.bold, color: "#FFF" }} numberOfLines={1}>
              {course.name}
            </Text>
            {teeSet && (
              <Row gap={spacing.xs} style={{ marginTop: 2 }}>
                <View style={[styles.teeDot, { backgroundColor: teeSet.color }]} />
                <Text style={{ fontSize: fontSizes.tiny, color: "rgba(255,255,255,0.75)" }}>
                  {teeSet.name} · {teeSet.rating}/{teeSet.slope} · Par {teeSet.par}
                </Text>
              </Row>
            )}
          </View>
          <View style={{ width: 36 }} />
        </Row>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: 60 }}>
        {/* Tee color legend */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.xs }}>
          <Row gap={spacing.md}>
            {course.teeSets.map((ts) => (
              <TouchableOpacity
                key={ts.id}
                onPress={() => setSelectedTeeId(ts.id)}
                style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, opacity: selectedTeeId === ts.id ? 1 : 0.5 }}
              >
                <View style={[styles.teeDot, { backgroundColor: ts.color, width: 12, height: 12 }]} />
                <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: p.text }}>
                  {ts.name} ({ts.yardage.toLocaleString()} yds)
                </Text>
              </TouchableOpacity>
            ))}
          </Row>
        </ScrollView>

        {/* Front 9 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderHalfCard(frontHoles, "OUT")}
        </ScrollView>

        {/* Back 9 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderHalfCard(backHoles, "IN")}
        </ScrollView>

        {/* Totals row */}
        <View style={[styles.totalsCard, { backgroundColor: p.primaryDark, borderColor: "transparent" }]}>
          <Row align="space-between">
            <View style={{ gap: 2 }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: fontSizes.tiny, fontWeight: fontWeights.heavy }}>TOTAL YARDS</Text>
              <Text style={{ color: "#FFF", fontSize: fontSizes.heading, fontWeight: fontWeights.heavy }}>
                {totalYards.toLocaleString()}
              </Text>
            </View>
            <View style={{ alignItems: "center", gap: 2 }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: fontSizes.tiny, fontWeight: fontWeights.heavy }}>PAR</Text>
              <Text style={{ color: "#FFF", fontSize: fontSizes.heading, fontWeight: fontWeights.heavy }}>
                {totalPar}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 2 }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: fontSizes.tiny, fontWeight: fontWeights.heavy }}>SCORE</Text>
              <Text style={{ color: totalScore != null ? "#FFE066" : "rgba(255,255,255,0.4)", fontSize: fontSizes.heading, fontWeight: fontWeights.heavy }}>
                {totalScore ?? "—"}
              </Text>
            </View>
          </Row>
          {teeSet && (
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: fontSizes.tiny, marginTop: spacing.sm }}>
              {teeSet.name} tees · {teeSet.rating} rating · {teeSet.slope} slope
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  halfCard: { borderRadius: radii.lg, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  row: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(0,0,0,0.06)" },
  cell: { height: 36, alignItems: "center", justifyContent: "center", paddingHorizontal: 2 },
  scoreCircle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  teeDot: { width: 10, height: 10, borderRadius: 5 },
  totalsCard: { borderRadius: radii.lg, padding: spacing.lg },
});
