import { useEffect, useMemo, useState } from "react";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Row } from "@/design-system/components";
import { SimulatedTeeTimeProvider } from "@/integrations/tee-times/SimulatedTeeTimeProvider";
import { SupabaseTeeTimeProvider } from "@/integrations/tee-times/SupabaseTeeTimeProvider";
import { env } from "@/lib/env";
import { fontSizes, fontWeights, radii, shadows, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import type { TeeTime } from "@/types/domain";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const heroCourse = require("../../web/public/hero-course.png");
const logoDark = require("../../assets/logo-dark.png");

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const teeTimeProvider = env.EXPO_PUBLIC_USE_MOCK_AUTH
  ? new SimulatedTeeTimeProvider()
  : new SupabaseTeeTimeProvider();

export default function HomeScreen() {
  const profile = useAppStore((state) => state.profile);
  const bookings = useAppStore((state) => state.bookings);
  const rounds = useAppStore((state) => state.rounds);

  const nextBooking = bookings[0];

  // Featured card = the soonest available live tee time near the player.
  const [featuredTeeTime, setFeaturedTeeTime] = useState<TeeTime | null>(null);
  useEffect(() => {
    let active = true;
    teeTimeProvider
      .search({ query: profile?.city, sortBy: "earliest" })
      .then((res) => {
        if (active) setFeaturedTeeTime(res[0] ?? null);
      })
      .catch(() => {
        if (active) setFeaturedTeeTime(null);
      });
    return () => {
      active = false;
    };
  }, [profile?.city]);

  const featuredCourse = featuredTeeTime?.course;
  const submittedRounds = rounds.filter((round) => round.verificationState !== "draft").length;
  const handicap = profile?.handicapValue ?? null;
  const firstName = profile?.displayName?.split(" ")[0] ?? "Golfer";
  const featuredStartsAt = featuredTeeTime ? new Date(featuredTeeTime.startsAt) : null;
  const featuredTime = featuredStartsAt
    ? featuredStartsAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "--";
  const featuredDay = featuredStartsAt
    ? featuredStartsAt.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
    : "Find a time";
  const featuredPlayers = nextBooking?.players ?? featuredTeeTime?.availableSpots ?? 2;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Row align="space-between">
            <Row gap={spacing.md}>
              <ClubhouseCrest />
              <Text style={styles.brandName}>The Clubhouse</Text>
            </Row>
            <Pressable accessibilityRole="button" style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={22} color="#F7F3E8" />
              <View style={styles.bellDot} />
            </Pressable>
          </Row>

            <Text style={styles.greeting}>{getGreeting()}, {firstName}.</Text>
          <Row gap={spacing.sm} style={styles.locationRow}>
            <Ionicons name="location-outline" size={22} color="#F7F3E8" />
            <Text style={styles.locationText}>{profile?.city ?? "Nashville"}, {profile?.state ?? "TN"}</Text>
            <Ionicons name="chevron-down" size={17} color="#BFD2C4" />
          </Row>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (featuredTeeTime) {
              router.push({ pathname: "/(tabs)/tee-times/[id]", params: { id: featuredTeeTime.id } });
            } else {
              router.push("/(tabs)/tee-times");
            }
          }}
          style={({ pressed }) => [styles.teeCard, pressed && styles.pressed]}
        >
          <ImageBackground source={heroCourse} resizeMode="cover" style={styles.teeImage} imageStyle={styles.teeImageSource}>
            <View style={styles.teeImageShade}>
              <Text style={styles.teeImageLabel}>Next tee time</Text>
            </View>
          </ImageBackground>
          <View style={styles.teeDetails}>
            <Row align="space-between" style={styles.teeTitleRow}>
              <View style={styles.teeTitleBlock}>
                <Text numberOfLines={1} style={styles.teeCourse}>
                  {featuredCourse?.name ?? "No tee times nearby"}
                </Text>
                <Text style={styles.teeSubline}>
                  {featuredCourse ? `${featuredCourse.city}, ${featuredCourse.state}` : "Tap to search availability"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#E6D9B7" />
            </Row>

            <Row gap={spacing.sm} style={styles.teeMetricGrid}>
              <TeeMetric icon="calendar-outline" label={featuredDay} value={featuredTime} />
              <TeeMetric icon="people-outline" label="Open spots" value={featuredTeeTime ? String(featuredTeeTime.availableSpots) : String(featuredPlayers)} />
              <TeeMetric icon="cash-outline" label="Green fee" value={featuredTeeTime ? `$${Math.round(featuredTeeTime.priceCents / 100)}` : "--"} />
            </Row>

            <View style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book</Text>
              <Ionicons name="chevron-forward" size={22} color="#F7F3E8" />
            </View>
          </View>
        </Pressable>

        <View style={styles.statRail}>
          <StatCell icon="golf-outline" label="Handicap" value={handicap != null ? handicap.toFixed(1) : "--"} />
          <View style={styles.statRule} />
          <StatCell icon="flag-outline" label="Rounds" value={String(submittedRounds)} />
          <View style={styles.statRule} />
          <StatCell icon="trophy-outline" label="Rank" value="--" />
        </View>

        <View style={styles.actionGrid}>
          <ActionTile icon="calendar-outline" label="Book" onPress={() => router.push("/(tabs)/tee-times")} />
          <ActionTile icon="golf-outline" label="Play" onPress={() => router.push("/(tabs)/play")} />
          <ActionTile icon="ticket-outline" label="Events" onPress={() => router.push("/(tabs)/tournaments")} />
          <ActionTile icon="people-outline" label="Groups" onPress={() => router.push("/(tabs)/play/discovery")} />
        </View>

        <View style={styles.panel}>
          <PanelHeader title="Open games" action="View all" onPress={() => router.push("/(tabs)/play")} />
          <PanelEmpty
            icon="people-outline"
            title="No open games near you yet"
            body="Be the first to host a game and invite golfers nearby."
            cta="Host a game"
            onPress={() => router.push("/(tabs)/play")}
          />
        </View>

        <View style={styles.panel}>
          <PanelHeader title="Golfers nearby" action="View all" onPress={() => router.push("/(tabs)/play/discovery")} />
          <PanelEmpty
            icon="golf-outline"
            title="Finding golfers near you"
            body="As more players join The Clubhouse in your area, they'll show up here."
            cta="Browse discovery"
            onPress={() => router.push("/(tabs)/play/discovery")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ClubhouseCrest() {
  return <Image source={logoDark} style={styles.crest} resizeMode="cover" />;
}

function TeeMetric({ icon, label, value }: { icon: IoniconsName; label: string; value: string }) {
  return (
    <View style={styles.teeMetric}>
      <Ionicons name={icon} size={18} color="#E6D9B7" />
      <Text numberOfLines={1} style={styles.teeMetricValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.teeMetricLabel}>{label}</Text>
    </View>
  );
}

function StatCell({ icon, label, value }: { icon: IoniconsName; label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={22} color="#E6D9B7" />
      </View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionTile({ icon, label, onPress }: { icon: IoniconsName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionTile, pressed && styles.pressed]}>
      <Ionicons name={icon} size={34} color="#CBE7C1" />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function PanelHeader({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return (
    <Row align="space-between" style={styles.panelHeader}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.panelAction}>
        <Text style={styles.panelActionText}>{action}</Text>
        <Ionicons name="chevron-forward" size={18} color="#416D51" />
      </Pressable>
    </Row>
  );
}

function PanelEmpty({ icon, title, body, cta, onPress }: {
  icon: IoniconsName;
  title: string;
  body: string;
  cta: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.emptyPanel}>
      <View style={styles.emptyPanelIcon}>
        <Ionicons name={icon} size={26} color="#52695C" />
      </View>
      <Text style={styles.emptyPanelTitle}>{title}</Text>
      <Text style={styles.emptyPanelBody}>{body}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.emptyPanelCta}>
        <Text style={styles.emptyPanelCtaText}>{cta}</Text>
        <Ionicons name="chevron-forward" size={16} color="#416D51" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#062B24",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 112,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  crest: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#021C17",
  },
  brandName: {
    color: "#F7F3E8",
    fontFamily: "Georgia",
    fontSize: 27,
    fontWeight: fontWeights.bold,
  },
  bellButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(247, 243, 232, 0.26)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#A7D8A0",
  },
  greeting: {
    color: "#F7F3E8",
    fontFamily: "Georgia",
    fontSize: 31,
    lineHeight: 37,
    fontWeight: fontWeights.bold,
  },
  locationRow: {
    marginTop: -spacing.sm,
  },
  locationText: {
    color: "#F7F3E8",
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.medium,
  },
  teeCard: {
    minHeight: 306,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(230, 217, 183, 0.48)",
    backgroundColor: "#0B352C",
    ...shadows.lg,
  },
  teeImage: {
    width: "100%",
    height: 132,
  },
  teeImageSource: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  teeImageShade: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.md,
    backgroundColor: "rgba(3,18,12,0.18)",
  },
  teeImageLabel: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    backgroundColor: "rgba(6,43,36,0.82)",
    color: "#E6D9B7",
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.heavy,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  teeDetails: {
    padding: spacing.lg,
    backgroundColor: "rgba(6, 43, 36, 0.94)",
    gap: spacing.sm,
  },
  teeTitleRow: {
    gap: spacing.sm,
  },
  teeTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  teeCourse: {
    color: "#F7F3E8",
    fontFamily: "Georgia",
    fontSize: 28,
    lineHeight: 33,
    fontWeight: fontWeights.bold,
  },
  teeSubline: {
    color: "#E3D6B9",
    fontSize: fontSizes.small,
    marginTop: 2,
  },
  teeMetricGrid: {
    marginTop: spacing.xs,
  },
  teeMetric: {
    flex: 1,
    minHeight: 70,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(230,217,183,0.24)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  teeMetricValue: {
    color: "#F7F3E8",
    fontFamily: "Georgia",
    fontSize: 19,
    fontWeight: fontWeights.bold,
    maxWidth: "100%",
  },
  teeMetricLabel: {
    color: "#E3D6B9",
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.semibold,
  },
  bookButton: {
    minHeight: 52,
    marginTop: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: "#2D6A50",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(203, 231, 193, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.lg,
  },
  bookButtonText: {
    color: "#F7F3E8",
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semibold,
  },
  statRail: {
    minHeight: 80,
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(230, 217, 183, 0.32)",
    backgroundColor: "rgba(7, 55, 45, 0.86)",
  },
  statCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(230, 217, 183, 0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    color: "#C7D8CA",
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.heavy,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  statValue: {
    color: "#F7F3E8",
    fontFamily: "Georgia",
    fontSize: 25,
    fontWeight: fontWeights.bold,
  },
  statRule: {
    width: StyleSheet.hairlineWidth,
    height: 52,
    backgroundColor: "rgba(230, 217, 183, 0.26)",
  },
  actionGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionTile: {
    flex: 1,
    minHeight: 98,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(203, 231, 193, 0.26)",
    backgroundColor: "rgba(8, 58, 47, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  actionLabel: {
    color: "#F7F3E8",
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  panel: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: "#FFFDF7",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2DCCF",
    ...shadows.md,
  },
  panelHeader: {
    marginBottom: spacing.md,
  },
  panelTitle: {
    color: "#082E25",
    fontFamily: "Georgia",
    fontSize: 25,
    fontWeight: fontWeights.bold,
  },
  panelAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  panelActionText: {
    color: "#416D51",
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
  },
  pressed: {
    opacity: 0.86,
  },
  emptyPanel: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  emptyPanelIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFEADC",
    marginBottom: spacing.xs,
  },
  emptyPanelTitle: {
    color: "#0D2F27",
    fontSize: fontSizes.subheading,
    fontWeight: fontWeights.semibold,
    textAlign: "center",
  },
  emptyPanelBody: {
    color: "#6F746E",
    fontSize: fontSizes.small,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 260,
  },
  emptyPanelCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "#416D51",
  },
  emptyPanelCtaText: {
    color: "#416D51",
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
  },
});
