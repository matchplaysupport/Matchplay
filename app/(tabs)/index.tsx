import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Avatar,
  Body,
  Button,
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
  Title,
  useTheme,
} from "@/design-system/components";
import { demoCourses, demoLeaderboard, demoProfiles, demoTeeTimes, seededOpenGames } from "@/features/courses/demoData";
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

  const nearbyGames = seededOpenGames.slice(0, 2);
  const suggestedGolfers = demoProfiles.slice(1, 3);
  const nearbyTeeTimes = demoTeeTimes.slice(0, 2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      {/* Green header */}
      <View style={[styles.header, { backgroundColor: p.primary }]}>
        <Row align="space-between">
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{profile?.displayName.split(" ")[0] ?? "Golfer"}</Text>
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
              {"  "}{profile?.city ?? "Nashville"}, {profile?.state ?? "TN"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
            <Avatar name={profile?.displayName ?? "G"} size={52} />
            <Chip label={profile?.reliabilityLabel ?? "New player"} variant="muted" size="xs" />
          </View>
        </Row>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Handicap card */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: -16 }}>
          <Card elevated style={{ paddingVertical: spacing.lg }}>
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
              <Divider style={{ width: 1, height: "100%", marginHorizontal: spacing.md }} />
              <StatItem value={String(submittedRounds)} label="Rounds" />
              <Divider style={{ width: 1, height: "100%", marginHorizontal: spacing.md }} />
              <StatItem value={personalRank ? `#${personalRank.rank}` : "—"} label="Rank" valueColor={p.primary} />
            </Row>
          </Card>
        </View>

        {/* Active round banner */}
        {activeRound && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <Link href="/play/scoring" asChild>
              <Card elevated style={{ backgroundColor: p.primary, borderColor: p.primaryLight }}>
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
            </Link>
          </View>
        )}

        {/* Quick actions */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <SectionHeader title="Quick actions" />
          <View style={styles.actionGrid}>
            <Link href="/tee-times" asChild>
              <QuickAction icon="calendar" label="Book tee time" color={p.primary} />
            </Link>
            <Link href="/play" asChild>
              <QuickAction icon="golf" label="Start round" color="#2C5F8A" />
            </Link>
            <Link href="/tournaments" asChild>
              <QuickAction icon="trophy" label="Events" color="#7A3B8A" />
            </Link>
            <Link href="/leaderboards" asChild>
              <QuickAction icon="podium" label="Leaderboards" color="#B07030" />
            </Link>
          </View>
        </View>

        {/* Next tee time */}
        {nextBooking && nextBookingCourse ? (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <SectionHeader title="Your next round" />
            <Card elevated onPress={() => undefined}>
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
            <SectionHeader title="Upcoming tee times" action="Browse all" onAction={() => undefined} />
            {nearbyTeeTimes.map((tt) => {
              const course = demoCourses.find((c) => c.id === tt.courseId);
              return (
                <Link key={tt.id} href={`/tee-times/${tt.id}` as never} asChild>
                  <Card elevated style={{ marginBottom: spacing.sm }} onPress={() => undefined}>
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
                </Link>
              );
            })}
          </View>
        )}

        {/* Open games nearby */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <SectionHeader title="Open games nearby" action="See all" onAction={() => undefined} />
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
          <SectionHeader title="Golfers near you" action="See all" onAction={() => undefined} />
          {suggestedGolfers.map((golfer) => (
            <Card key={golfer.id} elevated style={{ marginBottom: spacing.sm }}>
              <PressableRow onPress={() => undefined}>
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

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress?: () => void }) {
  const p = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radii.lg,
        backgroundColor: p.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: p.border,
        ...shadows.xs,
      }}
    >
      <View style={{ width: 44, height: 44, borderRadius: radii.md, backgroundColor: `${color}18`, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: p.textSecondary, textAlign: "center", lineHeight: 15 }}>
        {label}
      </Text>
    </View>
  );
}

const { StyleSheet: RNStyleSheet } = require("react-native");

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  greeting: {
    fontSize: fontSizes.body,
    color: "rgba(255,255,255,0.75)",
    fontWeight: fontWeights.regular,
  },
  name: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.heavy,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  location: {
    fontSize: fontSizes.small,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
