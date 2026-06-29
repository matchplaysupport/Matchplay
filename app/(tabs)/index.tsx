import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Avatar,
  Body,
  Card,
  Chip,
  Divider,
  HandicapLabel,
  Muted,
  PressableRow,
  Row,
  SectionHeader,
  StatItem,
  Subheading,
  useTheme,
} from "@/design-system/components";
import { demoCourses, demoLeaderboard, demoProfiles, demoTeeTimes } from "@/features/courses/demoData";
import { fontSizes, fontWeights, radii, shadows, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const profile = useAppStore((state) => state.profile);
  const bookings = useAppStore((state) => state.bookings);
  const rounds = useAppStore((state) => state.rounds);
  const openGames = useAppStore((state) => state.openGames);
  const activeRound = useAppStore((state) => state.activeRound);
  const p = useTheme();

  const nextBooking = bookings[0];
  const nextBookingCourse = nextBooking ? demoCourses.find((c) => c.id === nextBooking.courseId) : null;

  const submittedRounds = rounds.filter((r) => r.verificationState !== "draft").length;
  const personalRank = demoLeaderboard[0];

  const nearbyGames = openGames.slice(0, 2);
  const suggestedGolfers = demoProfiles.slice(1, 3);
  const nearbyTeeTimes = demoTeeTimes.slice(0, 2);
  const spotlightTeeTime = nextBooking ? null : nearbyTeeTimes[0];
  const spotlightCourse = spotlightTeeTime ? demoCourses.find((c) => c.id === spotlightTeeTime.courseId) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: p.header }]}>
        <Row align="space-between">
          <Row gap={spacing.sm}>
            <ClubhouseMark />
            <View>
              <Text style={styles.brandName}>The Clubhouse</Text>
              <Text style={styles.brandSubline}>{profile?.city ?? "Nashville"}, {profile?.state ?? "TN"}</Text>
            </View>
          </Row>
          <Avatar name={profile?.displayName ?? "G"} size={42} />
        </Row>

        <View style={styles.heroCopy}>
          <Text style={styles.greeting}>{getGreeting()}, {profile?.displayName.split(" ")[0] ?? "Golfer"}</Text>
          <Text style={styles.name}>Your round, group, and next tee time.</Text>
        </View>

        {spotlightTeeTime && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/(tabs)/tee-times/[id]", params: { id: spotlightTeeTime.id } })}
            style={({ pressed }) => [
              styles.spotlightCard,
              { opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Row align="space-between">
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text style={styles.spotlightLabel}>Next opening</Text>
                <Text style={styles.spotlightTitle}>{spotlightCourse?.name ?? "Featured course"}</Text>
                <Text style={styles.spotlightMeta}>
                  {new Date(spotlightTeeTime.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {spotlightTeeTime.holes} holes · {spotlightTeeTime.availableSpots} spots
                </Text>
              </View>
              <View style={styles.spotlightPrice}>
                <Text style={styles.spotlightPriceText}>${Math.round(spotlightTeeTime.priceCents / 100)}</Text>
                <Text style={styles.spotlightPriceSub}>golfer</Text>
              </View>
            </Row>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Handicap card */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: -18 }}>
          <Card elevated style={[styles.statDeck, { borderColor: p.border }]}>
            <Row align="space-between">
              <View style={{ gap: spacing.xs }}>
                <Text style={{ fontSize: fontSizes.micro, fontWeight: fontWeights.heavy, color: p.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Handicap
                </Text>
                <HandicapLabel
                  value={profile?.handicapValue}
                  source={profile?.handicapSource ?? "none"}
                />
              </View>
              <Divider style={{ width: 1, height: 54, marginHorizontal: spacing.md }} />
              <StatItem value={String(submittedRounds)} label="Rounds" />
              <Divider style={{ width: 1, height: 54, marginHorizontal: spacing.md }} />
              <StatItem value={personalRank ? `#${personalRank.rank}` : "—"} label="Rank" valueColor={p.primary} />
            </Row>
          </Card>
        </View>

        {/* Active round banner */}
        {activeRound && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <Card elevated style={{ backgroundColor: p.primary, borderColor: p.primaryLight }} onPress={() => router.push("/(tabs)/play/scoring")}>
              <Row align="space-between">
                <View style={{ gap: 4 }}>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Round in progress
                  </Text>
                  <Text style={{ color: "#FFFFFF", fontSize: fontSizes.subheading, fontWeight: fontWeights.bold }}>
                    Hole {activeRound.currentHole} of {activeRound.holes}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.small }}>
                    {activeRound.scores.length} holes scored
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </Row>
            </Card>
          </View>
        )}

        {/* Quick actions */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <SectionHeader title="Quick actions" />
          <View style={styles.actionGrid}>
            <QuickAction icon="calendar" label="Book tee time" color={p.primary} onPress={() => router.push("/(tabs)/tee-times")} />
            <QuickAction icon="golf" label="Start round" color="#2C5F8A" onPress={() => router.push("/(tabs)/play")} />
            <QuickAction icon="people" label="Groups" color="#2A7A6A" onPress={() => router.push("/(tabs)/play")} />
            <QuickAction icon="trophy" label="Events" color="#B07030" onPress={() => router.push("/(tabs)/tournaments")} />
          </View>
        </View>

        {/* Next tee time */}
        {nextBooking && nextBookingCourse ? (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <SectionHeader title="Your next round" />
            <Card elevated onPress={() => router.push("/(tabs)/tee-times")}>
              <Row align="space-between">
                <Chip label="Confirmed" variant="primary" />
                <Chip label={`${nextBooking.players} players`} variant="muted" />
              </Row>
              <Subheading>{nextBookingCourse.name}</Subheading>
              <Body color={p.muted}>{nextBookingCourse.city}, {nextBookingCourse.state}</Body>
              <Row gap={spacing.lg}>
                <Row gap={spacing.xs}>
                  <Ionicons name="people-outline" size={15} color={p.muted} />
                  <Text style={{ fontSize: fontSizes.small, color: p.muted }}>{nextBooking.players} golfers</Text>
                </Row>
                <Row gap={spacing.xs}>
                  <Ionicons name="checkmark-circle-outline" size={15} color={p.success} />
                  <Text style={{ fontSize: fontSizes.small, color: p.success }}>{nextBooking.confirmationCode}</Text>
                </Row>
              </Row>
            </Card>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <SectionHeader title="Upcoming tee times" action="Browse all" onAction={() => router.push("/(tabs)/tee-times")} />
            {nearbyTeeTimes.map((tt) => {
              const course = demoCourses.find((c) => c.id === tt.courseId);
              return (
                <Card key={tt.id} elevated style={{ marginBottom: spacing.sm }} onPress={() => router.push({ pathname: "/(tabs)/tee-times/[id]", params: { id: tt.id } })}>
                  <Row align="space-between">
                    <View style={{ flex: 1 }}>
                      <Subheading>{course?.name ?? "Course"}</Subheading>
                      <Body color={p.muted}>{course?.city}, {course?.state}</Body>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
                      <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.heavy, color: p.text }}>
                        ${Math.round(tt.priceCents / 100)}
                      </Text>
                      <Text style={{ fontSize: fontSizes.tiny, color: p.muted }}>/golfer</Text>
                    </View>
                  </Row>
                  <Row gap={spacing.md}>
                    <Chip label={new Date(tt.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} variant="primary" />
                    <Chip label={`${tt.holes} holes`} variant="muted" />
                    <Chip label={`${tt.availableSpots} spots`} variant={tt.availableSpots <= 1 ? "warning" : "muted"} />
                  </Row>
                </Card>
              );
            })}
          </View>
        )}

        {/* Open games nearby */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <SectionHeader title="Open games nearby" action="See all" onAction={() => router.push("/(tabs)/play")} />
          {nearbyGames.map((game) => {
            const course = demoCourses.find((c) => c.id === game.courseId);
            const creator = demoProfiles.find((p) => p.id === game.creatorId);
            const spotsLeft = game.availableSpots - game.acceptedPlayerIds.length;
            return (
              <Card key={game.id} elevated style={{ marginBottom: spacing.sm }}>
                <Row align="space-between">
                  <Row gap={spacing.md}>
                    <Avatar name={creator?.displayName ?? "G"} size={40} />
                    <View style={{ flex: 1 }}>
                      <Subheading>{creator?.displayName ?? "Golfer"}</Subheading>
                      <Body color={p.muted}>{course?.name ?? "Course"}</Body>
                    </View>
                  </Row>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.heavy, color: spotsLeft <= 1 ? p.warning : p.text }}>
                      {spotsLeft}
                    </Text>
                    <Muted>spots left</Muted>
                  </View>
                </Row>
                <Row gap={spacing.sm}>
                  <Chip label={new Date(game.startsAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} variant="muted" />
                  {game.holes && <Chip label={`${game.holes} holes`} variant="muted" />}
                  {game.approvalRequired && <Chip label="Approval req." variant="warning" />}
                </Row>
                {game.description && <Muted>{game.description}</Muted>}
              </Card>
            );
          })}
        </View>

        {/* Suggested golfers */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <SectionHeader title="Golfers near you" action="See all" onAction={() => router.push("/(tabs)/play/discovery")} />
          {suggestedGolfers.map((golfer) => (
            <Card key={golfer.id} elevated style={{ marginBottom: spacing.sm }}>
              <PressableRow onPress={() => router.push("/(tabs)/play/discovery")}>
                <Avatar name={golfer.displayName} size={48} />
                <View style={{ flex: 1 }}>
                  <Subheading>{golfer.displayName}</Subheading>
                  <Body color={p.muted}>{golfer.city}, {golfer.state}</Body>
                  <Row gap={spacing.xs} style={{ marginTop: spacing.xs }}>
                    <Chip label={golfer.skillLevel} variant="muted" size="xs" />
                    {golfer.handicapValue != null && (
                      <Chip label={`${golfer.handicapValue.toFixed(1)} HCP`} variant="primary" size="xs" />
                    )}
                    <Chip label={golfer.reliabilityLabel} variant={golfer.reliabilityLabel === "Highly reliable" ? "success" : "muted"} size="xs" />
                  </Row>
                </View>
                <Ionicons name="chevron-forward" size={18} color={p.mutedLight} />
              </PressableRow>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function ClubhouseMark() {
  return (
    <View style={styles.markOuter}>
      <View style={styles.markInner}>
        <Text style={styles.markText}>C</Text>
      </View>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: { icon: IoniconsName; label: string; color: string; onPress: () => void }) {
  const p = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: p.surface,
          borderColor: p.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={{ width: 42, height: 42, borderRadius: radii.full, backgroundColor: `${color}16`, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: p.textSecondary, textAlign: "center", lineHeight: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  markOuter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.28)",
  },
  markInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F6C15A",
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    color: "#06261C",
    fontSize: 15,
    fontWeight: fontWeights.heavy,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: fontSizes.body,
    fontWeight: fontWeights.heavy,
    letterSpacing: 0.2,
  },
  brandSubline: {
    color: "rgba(255,255,255,0.58)",
    fontSize: fontSizes.tiny,
    marginTop: 1,
  },
  heroCopy: {
    gap: spacing.xs,
  },
  greeting: {
    fontSize: fontSizes.small,
    color: "rgba(255,255,255,0.66)",
    fontWeight: fontWeights.medium,
  },
  name: {
    fontSize: 30,
    fontWeight: fontWeights.heavy,
    color: "#FFFFFF",
    letterSpacing: -0.3,
    lineHeight: 35,
    maxWidth: 320,
  },
  spotlightCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.75)",
    ...shadows.lg,
  },
  spotlightLabel: {
    fontSize: fontSizes.micro,
    color: "#66736C",
    fontWeight: fontWeights.heavy,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  spotlightTitle: {
    fontSize: fontSizes.heading,
    color: "#081812",
    fontWeight: fontWeights.heavy,
  },
  spotlightMeta: {
    fontSize: fontSizes.small,
    color: "#66736C",
  },
  spotlightPrice: {
    minWidth: 70,
    alignItems: "flex-end",
  },
  spotlightPriceText: {
    color: "#0F6A43",
    fontSize: fontSizes.title,
    fontWeight: fontWeights.heavy,
  },
  spotlightPriceSub: {
    color: "#66736C",
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.semibold,
    textTransform: "uppercase",
  },
  statDeck: {
    paddingVertical: spacing.lg,
  },
  actionGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    ...shadows.sm,
  },
});
