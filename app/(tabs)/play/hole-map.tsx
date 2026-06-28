import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Chip, Row, useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, radii, shadows, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";

export default function HoleMapScreen() {
  const p = useTheme();
  const activeCourse = useAppStore((s) => s.activeCourse);
  const activeRound = useAppStore((s) => s.activeRound);

  const currentHoleNum = activeRound?.currentHole ?? 1;
  const teeSetId = activeRound?.teeSetId ?? "";

  const [viewingHole, setViewingHole] = useState(currentHoleNum);

  const course = activeCourse;
  const hole = course?.holes.find((h) => h.number === viewingHole);
  const teeSet = course?.teeSets.find((ts) => ts.id === teeSetId) ?? course?.teeSets[0];
  const yardage = hole && teeSet ? (hole.yardsByTeeSet[teeSet.id] ?? teeSet.yardage / 18) : null;

  const coordinates = course?.coordinates ?? { latitude: 36.1627, longitude: -86.7816 };

  const parLabel = hole ? `Par ${hole.par}` : "";
  const yardLabel = yardage ? `${Math.round(yardage)} yds` : "";
  const hdcpLabel = hole?.handicap ? `HCP ${hole.handicap}` : "";

  const totalHoles = activeRound?.holes ?? 18;

  if (!course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top", "bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md }}>
          <Ionicons name="golf-outline" size={48} color={p.mutedLight} />
          <Text style={{ color: p.muted, fontSize: fontSizes.body }}>No active course</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: p.primary, fontSize: fontSizes.body }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Satellite map fills the whole screen */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        mapType="satellite"
        initialRegion={{
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }}
        showsUserLocation
        showsCompass
        showsScale
      >
        <Marker
          coordinate={coordinates}
          title={course.name}
          description={`${course.city}, ${course.state}`}
        >
          <View style={styles.courseMarker}>
            <Ionicons name="flag" size={18} color="#FFF" />
          </View>
        </Marker>
      </MapView>

      {/* Top bar */}
      <SafeAreaView edges={["top"]} style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        <View style={[styles.topBar, { backgroundColor: "rgba(0,0,0,0.65)" }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
            <Text style={styles.courseLocation}>{course.city}, {course.state}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* Bottom hole info card */}
      <View style={[styles.bottomCard, { backgroundColor: "rgba(0,0,0,0.80)" }]}>
        {/* Hole navigator */}
        <View style={styles.holeNav}>
          <TouchableOpacity
            style={styles.holeNavBtn}
            onPress={() => setViewingHole((h) => Math.max(1, h - 1))}
            disabled={viewingHole === 1}
          >
            <Ionicons name="chevron-back" size={20} color={viewingHole === 1 ? "rgba(255,255,255,0.3)" : "#FFF"} />
          </TouchableOpacity>

          <View style={{ alignItems: "center", gap: 2 }}>
            <Text style={styles.holeLabel}>HOLE</Text>
            <Text style={styles.holeNum}>{viewingHole}</Text>
            {viewingHole === currentHoleNum && (
              <View style={[styles.currentBadge, { backgroundColor: p.primary }]}>
                <Text style={{ fontSize: 9, fontWeight: fontWeights.heavy, color: "#FFF" }}>CURRENT</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.holeNavBtn}
            onPress={() => setViewingHole((h) => Math.min(totalHoles, h + 1))}
            disabled={viewingHole === totalHoles}
          >
            <Ionicons name="chevron-forward" size={20} color={viewingHole === totalHoles ? "rgba(255,255,255,0.3)" : "#FFF"} />
          </TouchableOpacity>
        </View>

        {/* Hole stats */}
        <Row gap={spacing.md} style={{ justifyContent: "center", marginTop: spacing.sm }}>
          {parLabel ? (
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{hole?.par}</Text>
              <Text style={styles.statLabel}>PAR</Text>
            </View>
          ) : null}
          {yardLabel ? (
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{Math.round(yardage ?? 0)}</Text>
              <Text style={styles.statLabel}>YARDS</Text>
            </View>
          ) : null}
          {hdcpLabel ? (
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{hole?.handicap}</Text>
              <Text style={styles.statLabel}>HCP</Text>
            </View>
          ) : null}
        </Row>

        {/* Tee info */}
        {teeSet && (
          <View style={{ alignItems: "center", marginTop: spacing.sm }}>
            <Row gap={spacing.xs}>
              <View style={[styles.teeColorDot, { backgroundColor: teeSet.color }]} />
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: fontSizes.small }}>
                {teeSet.name} tees · {teeSet.rating}/{teeSet.slope}
              </Text>
            </Row>
          </View>
        )}

        {/* All holes strip */}
        <View style={styles.holeStrip}>
          {Array.from({ length: totalHoles }, (_, i) => i + 1).map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setViewingHole(n)}
              style={[
                styles.holeStripDot,
                {
                  backgroundColor:
                    n === viewingHole
                      ? p.primary
                      : n === currentHoleNum
                        ? "rgba(255,255,255,0.4)"
                        : "rgba(255,255,255,0.12)",
                },
              ]}
            >
              <Text style={{ fontSize: 9, fontWeight: fontWeights.bold, color: n === viewingHole ? "#FFF" : "rgba(255,255,255,0.6)" }}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  courseName: { fontSize: fontSizes.body, fontWeight: fontWeights.bold, color: "#FFF" },
  courseLocation: { fontSize: fontSizes.tiny, color: "rgba(255,255,255,0.6)" },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  holeNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  holeNavBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  holeLabel: { fontSize: fontSizes.tiny, fontWeight: fontWeights.heavy, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5 },
  holeNum: { fontSize: 48, fontWeight: fontWeights.heavy, color: "#FFF", lineHeight: 54 },
  currentBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.full },
  statChip: { alignItems: "center", minWidth: 72, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: radii.lg, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  statValue: { fontSize: fontSizes.title, fontWeight: fontWeights.heavy, color: "#FFF" },
  statLabel: { fontSize: 10, fontWeight: fontWeights.heavy, color: "rgba(255,255,255,0.5)", letterSpacing: 1 },
  teeColorDot: { width: 10, height: 10, borderRadius: 5 },
  holeStrip: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.xs, marginTop: spacing.md },
  holeStripDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  courseMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#1A6B3C", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFF" },
});
