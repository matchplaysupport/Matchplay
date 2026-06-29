import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Avatar,
  Body,
  Button,
  Card,
  Chip,
  Muted,
  Row,
  SectionHeader,
  Subheading,
  Title,
  useTheme,
} from "@/design-system/components";
import { demoCourses, demoProfiles, discoveryProfiles } from "@/features/courses/demoData";
import { analytics } from "@/lib/analytics";
import { env } from "@/lib/env";
import { joinOpenGame, requestJoinOpenGame } from "@/services/openGames";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import { useEntitlement } from "@/hooks/useEntitlement";
import type { OpenGame } from "@/types/domain";

export default function PlayScreen() {
  const profile = useAppStore((state) => state.profile);
  const activeRound = useAppStore((state) => state.activeRound);
  const activeCourse = useAppStore((state) => state.activeCourse);
  const openGames = useAppStore((state) => state.openGames);
  const rounds = useAppStore((state) => state.rounds);
  const addOpenGame = useAppStore((state) => state.addOpenGame);
  const updateOpenGame = useAppStore((state) => state.updateOpenGame);
  const recordMetric = useAppStore((state) => state.recordMetric);
  const p = useTheme();
  const { can } = useEntitlement();
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);

  const firstDiscovery = discoveryProfiles[0];
  const nearbyGames = openGames.slice(0, 3);

  // Resolve course name for active round display
  const activeCourseName =
    activeCourse?.name ??
    demoCourses.find((c) => c.id === activeRound?.courseId)?.name ??
    "Course";

  const handleCreateGame = () => {
    if (!profile) return;
    if (!env.EXPO_PUBLIC_USE_MOCK_AUTH && !can("create_open_games")) {
      router.push("/(tabs)/upgrade");
      return;
    }
    const defaultCourse = activeCourse ?? demoCourses[0];
    const game: OpenGame = {
      id: `game-${Date.now()}`,
      courseId: defaultCourse?.id ?? "course-riverbend",
      creatorId: profile.id,
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      availableSpots: 3,
      acceptedPlayerIds: [profile.id],
      waitlistedPlayerIds: [],
      approvalRequired: true,
      visibility: "public",
      description: "Open game — anyone welcome.",
      holes: 18,
      estimatedPriceCents: 4500,
      cartIncluded: true,
    };
    addOpenGame(game);
    recordMetric("openGameCreations");
    analytics.track("open_game_created", { courseId: game.courseId });
    Alert.alert("Game created!", "Your open game is now visible to nearby golfers.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: p.header }]}>
        <Row align="space-between">
          <View style={{ gap: spacing.xs, flex: 1 }}>
            <Text style={styles.kicker}>Clubhouse round desk</Text>
            <Title style={styles.headerTitle}>Play today</Title>
            <Text style={styles.headerSubtitle}>
              Score a round, build a group, or claim an open seat.
            </Text>
          </View>
          <View style={styles.headerGlyph}>
            <Ionicons name="golf" size={26} color="#06261C" />
          </View>
        </Row>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Active round resume */}
        {activeRound ? (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <Card elevated style={{ backgroundColor: p.primaryDark, borderColor: "transparent" }}>
              <Row align="space-between">
                <View style={{ gap: 4, flex: 1 }}>
                  <Chip label="Round in progress" variant="accent" size="xs" />
                  <Subheading style={{ color: "#FFFFFF", marginTop: spacing.xs }}>
                    Hole {activeRound.currentHole} of {activeRound.holes}
                  </Subheading>
                  <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.small }}>
                    {activeRound.scores.length} holes scored · {activeCourseName}
                  </Text>
                </View>
                <Button label="Resume" onPress={() => router.push("/(tabs)/play/scoring")} size="sm" variant="accent" />
              </Row>
            </Card>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm }}>
            <SectionHeader title="Start a round" />
            <Card elevated style={styles.startCard}>
              <Row align="space-between">
                <View style={{ gap: spacing.xs, flex: 1 }}>
                  <Chip label="Ready when you are" variant="accent" size="xs" />
                  <Subheading>Find your course</Subheading>
                  <Body color={p.muted}>Search courses, select tees, and keep a clean card from the first hole.</Body>
                </View>
                <View style={[styles.courseIcon, { backgroundColor: p.successLight, borderColor: p.border }]}>
                  <Ionicons name="golf" size={28} color={p.primary} />
                </View>
              </Row>
              <Button
                label="Select course & start"
                onPress={() => router.push("/(tabs)/play/course-search")}
                size="lg"
              />
              <Muted>Round drafts auto-save after each hole. You can resume if you close the app.</Muted>
            </Card>
          </View>
        )}

        {/* Live event scoring */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.sm }}>
          <SectionHeader title="Live events" />
          <Card elevated style={{ backgroundColor: p.primaryDark, borderColor: "transparent" }}>
            <Row align="space-between">
              <View style={{ gap: spacing.xs, flex: 1 }}>
                <Chip label="Free for juniors & student athletes" variant="accent" size="xs" />
                <Subheading style={{ color: "#FFFFFF", marginTop: spacing.xs }}>Score a live event</Subheading>
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.small }}>
                  Enter your group&apos;s scores — standings go live instantly.
                </Text>
              </View>
              <Ionicons name="trophy" size={28} color="rgba(255,255,255,0.3)" />
            </Row>
            <Button
              label="Open group scoring"
              variant="accent"
              size="lg"
              onPress={() => router.push("/(tabs)/play/group-scoring")}
            />
          </Card>
        </View>

        {/* Discovery preview */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <SectionHeader title="Golfers near you" action="See all" onAction={() => router.push("/(tabs)/play/discovery")} />
          {firstDiscovery && (
            <Card elevated style={styles.featureCard}>
              <Row gap={spacing.md}>
                <Avatar name={firstDiscovery.displayName} size={56} />
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Subheading>{firstDiscovery.displayName}</Subheading>
                  <Body color={p.muted}>{firstDiscovery.approximateLocation} · {firstDiscovery.distanceMiles} mi</Body>
                  <Row gap={spacing.xs}>
                    <Chip label={firstDiscovery.skillLevel} variant="muted" size="xs" />
                    {firstDiscovery.handicapValue != null && (
                      <Chip label={`${firstDiscovery.handicapValue.toFixed(1)} HCP`} variant="primary" size="xs" />
                    )}
                    <Chip label={firstDiscovery.reliabilityLabel} variant={firstDiscovery.reliabilityLabel === "Highly reliable" ? "success" : "muted"} size="xs" />
                  </Row>
                  {firstDiscovery.bio && <Muted numberOfLines={2}>{firstDiscovery.bio}</Muted>}
                </View>
              </Row>
              <Row gap={spacing.sm}>
                <Button
                  label="Pass"
                  variant="secondary"
                  onPress={() => {
                    recordMetric("passActions");
                    analytics.track("discovery_swipe", { action: "pass" });
                    Alert.alert("Passed", "This golfer won't appear again soon.");
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Interested"
                  onPress={() => {
                    recordMetric("interestedActions");
                    analytics.track("discovery_swipe", { action: "interested" });
                    Alert.alert("Interested!", "If they're also interested, you'll be matched.");
                  }}
                  style={{ flex: 1 }}
                />
              </Row>
              <Button label="Browse nearby golfers" variant="ghost" onPress={() => router.push("/(tabs)/play/discovery")} size="sm" />
            </Card>
          )}
        </View>

        {/* Open games */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <SectionHeader title="Open games" action="Create game" onAction={handleCreateGame} />
          {nearbyGames.map((game) => {
            const course = demoCourses.find((c) => c.id === game.courseId);
            const creator = demoProfiles.find((p) => p.id === game.creatorId);
            const spotsLeft = game.availableSpots - game.acceptedPlayerIds.length;
            return (
              <Card key={game.id} elevated style={[styles.gameCard, { marginBottom: spacing.sm }]}>
                <Row align="space-between">
                  <Row gap={spacing.md}>
                    <Avatar name={creator?.displayName ?? "G"} size={44} />
                    <View style={{ flex: 1 }}>
                      <Subheading>{creator?.displayName ?? "Golfer"}</Subheading>
                      <Body color={p.muted}>{course?.name}</Body>
                    </View>
                  </Row>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: fontSizes.title, fontWeight: fontWeights.heavy, color: spotsLeft <= 1 ? p.warning : p.primary }}>
                      {spotsLeft}
                    </Text>
                    <Muted>spots</Muted>
                  </View>
                </Row>
                <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
                  <Chip label={new Date(game.startsAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} variant="muted" />
                  {game.holes && <Chip label={`${game.holes} holes`} variant="muted" />}
                  {game.estimatedPriceCents && <Chip label={`~$${Math.round(game.estimatedPriceCents / 100)}/golfer`} variant="muted" />}
                  {game.approvalRequired && <Chip label="Approval req." variant="warning" />}
                </Row>
                {game.description && <Muted>{game.description}</Muted>}
                <Button
                  label={joiningGameId === game.id ? "Sending..." : game.approvalRequired ? "Request to join" : "Join this game"}
                  variant={spotsLeft === 0 ? "secondary" : "primary"}
                  loading={joiningGameId === game.id}
                  disabled={joiningGameId != null}
                  onPress={() => {
                    if (!profile) return;
                    if (!env.EXPO_PUBLIC_USE_MOCK_AUTH && !can("join_open_games")) {
                      router.push("/(tabs)/upgrade");
                      return;
                    }

                    // Mock mode: optimistic local update.
                    if (env.EXPO_PUBLIC_USE_MOCK_AUTH) {
                      setJoiningGameId(game.id);
                      const result = joinOpenGame(game, profile.id);
                      updateOpenGame(result.game);
                      recordMetric("joinRequests");
                      analytics.track("join_requested", { gameId: game.id, status: result.status });
                      setJoiningGameId(null);
                      Alert.alert(
                        result.status === "joined" ? "You're in!" : "Request sent",
                        result.status === "joined"
                          ? "Check Messages to chat with the group."
                          : "The host will review your request.",
                      );
                      return;
                    }

                    // Live mode: the server enforces capacity (accept vs waitlist).
                    void (async () => {
                      setJoiningGameId(game.id);
                      try {
                        const status = await requestJoinOpenGame(game.id);
                        recordMetric("joinRequests");
                        analytics.track("join_requested", { gameId: game.id, status });
                        Alert.alert(
                          status === "joined"
                            ? "You're in!"
                            : status === "already_member"
                              ? "Already joined"
                              : "Request sent",
                          status === "joined"
                            ? "Check Messages to chat with the group."
                            : status === "already_member"
                              ? "You're already part of this game."
                              : "You've been added to the waitlist, or the host will review your request.",
                        );
                      } catch (err) {
                        Alert.alert("Could not join", err instanceof Error ? err.message : "Please try again.");
                      } finally {
                        setJoiningGameId(null);
                      }
                    })();
                  }}
                />
              </Card>
            );
          })}
          {nearbyGames.length === 0 && (
            <Card elevated>
              <View style={{ alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg }}>
                <Ionicons name="people-outline" size={36} color={p.mutedLight} />
                <Body color={p.muted}>No open games nearby. Create one!</Body>
                <Button label="Create open game" onPress={handleCreateGame} size="sm" />
              </View>
            </Card>
          )}
        </View>

        {/* Recent rounds */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <SectionHeader title="Recent rounds" />
          {rounds.length === 0 ? (
            <Card elevated>
              <View style={{ alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md }}>
                <Muted style={{ textAlign: "center" }}>No rounds yet. Start your first round above.</Muted>
              </View>
            </Card>
          ) : (
            rounds.slice(0, 3).map((round) => {
              const course = demoCourses.find((c) => c.id === round.courseId);
              const grossScore = round.scores.reduce((s, h) => s + h.grossScore, 0);
              return (
                <Card key={round.id} elevated style={{ marginBottom: spacing.sm }}>
                  <Row align="space-between">
                    <View style={{ gap: 4 }}>
                      <Subheading>{course?.name ?? "Unknown course"}</Subheading>
                      <Body color={p.muted}>{new Date(round.startedAt).toLocaleDateString()}</Body>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: fontSizes.title, fontWeight: fontWeights.heavy, color: p.text }}>{grossScore || "—"}</Text>
                      <Chip label={round.verificationState.replace("_", " ")} variant={round.verificationState === "self_reported" ? "primary" : "muted"} size="xs" />
                    </View>
                  </Row>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  kicker: {
    color: "rgba(255,255,255,0.58)",
    fontSize: fontSizes.micro,
    fontWeight: fontWeights.heavy,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 37,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.70)",
    fontSize: fontSizes.body,
    lineHeight: 21,
    maxWidth: 270,
  },
  headerGlyph: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F6C15A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.45)",
  },
  startCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  featureCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  gameCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  courseIcon: {
    width: 58,
    height: 58,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
