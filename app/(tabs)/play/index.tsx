import { useEffect, useState } from "react";
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
  useTheme,
} from "@/design-system/components";
import { demoCourses, demoProfiles, seededOpenGames } from "@/features/courses/demoData";
import { analytics } from "@/lib/analytics";
import { env } from "@/lib/env";
import { joinOpenGame, listOpenGames, requestJoinOpenGame } from "@/services/openGames";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import { useEntitlement } from "@/hooks/useEntitlement";

export default function PlayScreen() {
  const profile = useAppStore((state) => state.profile);
  const activeRound = useAppStore((state) => state.activeRound);
  const activeCourse = useAppStore((state) => state.activeCourse);
  const openGames = useAppStore((state) => state.openGames);
  const demoMode = useAppStore((state) => state.demoMode);
  const rounds = useAppStore((state) => state.rounds);
  const updateOpenGame = useAppStore((state) => state.updateOpenGame);
  const setOpenGames = useAppStore((state) => state.setOpenGames);
  const recordMetric = useAppStore((state) => state.recordMetric);
  const p = useTheme();
  const { can } = useEntitlement();
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listOpenGames()
      .then((live) => {
        if (!active) return;
        const current = useAppStore.getState().openGames;
        const localOnly = current.filter((g) => g.id.startsWith("game-") && !live.some((l) => l.id === g.id));
        setOpenGames([...live, ...localOnly]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [setOpenGames]);

  const baseGames = demoMode ? [...openGames, ...seededOpenGames] : openGames;
  const nearbyGames = baseGames.slice(0, 3);

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
    router.push("/(tabs)/play/create-game");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Row align="space-between">
          <View style={{ gap: spacing.xs, flex: 1 }}>
            <Text style={styles.headerTitle}>Play today</Text>
            <Text style={styles.headerSubtitle}>
              Score a round, build a group, or claim an open seat.
            </Text>
          </View>
          <View style={styles.headerGlyph}>
            <Ionicons name="golf-outline" size={26} color="#E6D9B7" />
          </View>
        </Row>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active round resume */}
        {activeRound ? (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <Card elevated style={styles.darkPanel}>
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
            <Text style={styles.sectionLabel}>Start a round</Text>
            <Card elevated style={styles.startCard}>
              <Row align="space-between">
                <View style={{ gap: spacing.xs, flex: 1 }}>
                  <Chip label="Ready when you are" variant="accent" size="xs" />
                  <Subheading style={styles.panelTitle}>Find your course</Subheading>
                  <Body color="#6F746E">Search courses, select tees, and keep a clean card from the first hole.</Body>
                </View>
                <View style={styles.courseIcon}>
                  <Ionicons name="golf" size={28} color="#E6D9B7" />
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

        {/* Discovery entry */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Text style={styles.sectionLabel}>Golfers near you</Text>
          <Card elevated style={styles.featureCard}>
            <Row gap={spacing.md}>
              <View style={styles.courseIcon}>
                <Ionicons name="people" size={26} color="#E6D9B7" />
              </View>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Subheading style={styles.panelTitle}>Find playing partners</Subheading>
                <Body color="#6F746E">Browse golfers nearby and match up to build your group.</Body>
              </View>
            </Row>
            <Button label="Browse nearby golfers" variant="ghost" onPress={() => router.push("/(tabs)/play/discovery")} size="sm" />
          </Card>
        </View>

        {/* Open games */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Row align="space-between">
            <Text style={styles.sectionLabel}>Open games</Text>
            <Button label="Create" size="sm" variant="secondary" onPress={handleCreateGame} />
          </Row>
          {nearbyGames.map((game) => {
            const course = game.course ?? demoCourses.find((c) => c.id === game.courseId);
            const creatorName =
              game.creatorName ??
              (game.creatorId === profile?.id
                ? profile?.displayName
                : demoProfiles.find((dp) => dp.id === game.creatorId)?.displayName) ??
              "Golfer";
            const spotsLeft = game.availableSpots - game.acceptedPlayerIds.length;
            return (
              <Card key={game.id} elevated style={[styles.gameCard, { marginBottom: spacing.sm }]}>
                <Row align="space-between">
                  <Row gap={spacing.md}>
                    <Avatar name={creatorName ?? "G"} size={44} />
                    <View style={{ flex: 1 }}>
                      <Subheading style={styles.panelTitle}>{creatorName ?? "Golfer"}</Subheading>
                      <Body color="#6F746E">{course?.name}</Body>
                    </View>
                  </Row>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: fontSizes.title, fontWeight: fontWeights.heavy, color: spotsLeft <= 1 ? "#A77A23" : "#416D51" }}>
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
          <Text style={styles.sectionLabel}>Recent rounds</Text>
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
                      <Subheading style={styles.panelTitle}>{course?.name ?? "Unknown course"}</Subheading>
                      <Body color="#6F746E">{new Date(round.startedAt).toLocaleDateString()}</Body>
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
  safeArea: {
    flex: 1,
    backgroundColor: "#062B24",
  },
  scrollContent: {
    paddingBottom: 112,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  headerTitle: {
    color: "#F7F3E8",
    fontFamily: "Georgia",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: fontWeights.bold,
  },
  headerSubtitle: {
    color: "rgba(247,243,232,0.72)",
    fontSize: fontSizes.body,
    lineHeight: 21,
    maxWidth: 270,
  },
  headerGlyph: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(230,217,183,0.26)",
  },
  sectionLabel: {
    color: "#C7D8CA",
    fontSize: fontSizes.tiny,
    fontWeight: fontWeights.heavy,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  darkPanel: {
    backgroundColor: "rgba(7,55,45,0.90)",
    borderColor: "rgba(230,217,183,0.28)",
  },
  startCard: {
    backgroundColor: "#FFFDF7",
    borderColor: "#E2DCCF",
  },
  featureCard: {
    backgroundColor: "#FFFDF7",
    borderColor: "#E2DCCF",
  },
  gameCard: {
    backgroundColor: "#FFFDF7",
    borderColor: "#E2DCCF",
  },
  panelTitle: {
    color: "#0D2F27",
    fontFamily: "Georgia",
  },
  courseIcon: {
    width: 58,
    height: 58,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: "#07372D",
    borderColor: "rgba(230,217,183,0.34)",
  },
});
