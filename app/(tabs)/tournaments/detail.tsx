import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
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
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import {
  formatFormatLabel,
  formatPrizeDistributionLabel,
  joinTournament,
  markPlayerPaid,
  prizePoolCents,
} from "@/services/tournaments";
import type { TournamentPlayer } from "@/types/domain";

function formatMoney(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function paymentStatusColor(status: TournamentPlayer["paymentStatus"], primary: string, warning: string, muted: string): string {
  if (status === "paid") return primary;
  if (status === "registered") return warning;
  return muted;
}

function paymentStatusLabel(status: TournamentPlayer["paymentStatus"]): string {
  if (status === "paid") return "Paid";
  if (status === "registered") return "Owes";
  return "Withdrawn";
}

export default function TournamentDetailScreen() {
  const p = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAppStore((state) => state.profile);
  const tournaments = useAppStore((state) => state.tournaments);
  const updateTournament = useAppStore((state) => state.updateTournament);

  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
        <Row style={{ padding: spacing.lg }}>
          <Button label="Back" variant="ghost" onPress={() => router.back()} />
        </Row>
        <Body style={{ textAlign: "center", marginTop: spacing.xl }}>Tournament not found.</Body>
      </SafeAreaView>
    );
  }

  const isCreator = profile?.id === tournament.creatorId;
  const myPlayer = profile ? tournament.players.find((p) => p.playerId === profile.id) : null;
  const isJoined = !!myPlayer;
  const isFull = tournament.players.length >= tournament.maxPlayers;
  const pool = prizePoolCents(tournament);
  const paidCount = tournament.players.filter((p) => p.paymentStatus === "paid").length;

  function handleJoin() {
    if (!profile || !tournament) return;
    const updated = joinTournament(tournament, profile.id, profile.displayName);
    updateTournament(updated);
    if (tournament.buyInCents > 0) {
      Alert.alert(
        "You're registered!",
        `Pay ${formatMoney(tournament.buyInCents)} in cash, Venmo, or Apple Pay to the organizer before the round starts. Your status will show as "Paid" once confirmed.`,
      );
    }
  }

  function handleMarkPaid(playerId: string) {
    if (!tournament) return;
    const updated = markPlayerPaid(tournament, playerId);
    updateTournament(updated);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Row style={styles.navRow}>
          <Button label="← Back" variant="ghost" size="sm" onPress={() => router.back()} />
        </Row>

        {/* Header */}
        <Card>
          <Title>{tournament.name}</Title>
          {tournament.courseName && (
            <Row style={{ gap: spacing.xs, marginTop: spacing.xs }}>
              <Ionicons name="location-outline" size={14} color={p.mutedLight} />
              <Muted>{tournament.courseName}</Muted>
            </Row>
          )}

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={p.primary} />
              <View>
                <Body style={styles.detailLabel}>{formatDate(tournament.startsAt)}</Body>
                <Muted>{formatTime(tournament.startsAt)}</Muted>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="golf-outline" size={16} color={p.primary} />
              <View>
                <Body style={styles.detailLabel}>{formatFormatLabel(tournament.format)}</Body>
                <Muted>{tournament.holes} holes</Muted>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={p.primary} />
              <View>
                <Body style={styles.detailLabel}>{tournament.players.length} / {tournament.maxPlayers} players</Body>
                <Muted>{isFull ? "Full" : `${tournament.maxPlayers - tournament.players.length} spots left`}</Muted>
              </View>
            </View>
          </View>

          {tournament.description && (
            <View style={[styles.descBox, { backgroundColor: p.surface, borderColor: p.border }]}>
              <Body>{tournament.description}</Body>
            </View>
          )}
        </Card>

        {/* Prize Pool */}
        {tournament.buyInCents > 0 && (
          <Card style={[styles.prizeCard, { backgroundColor: p.primary + "08", borderColor: p.primary + "30" }]}>
            <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Row style={{ gap: spacing.xs, alignItems: "center" }}>
                  <Ionicons name="trophy-outline" size={20} color={p.primary} />
                  <Subheading style={{ color: p.primary }}>Prize Pool</Subheading>
                </Row>
                <Muted style={{ marginTop: spacing.xs }}>{formatPrizeDistributionLabel(tournament.prizeDistribution)}</Muted>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 28, fontWeight: fontWeights.bold, color: p.primary }}>{formatMoney(pool)}</Text>
                <Muted>{paidCount} of {tournament.players.length} paid</Muted>
              </View>
            </Row>

            {tournament.buyInCents > 0 && (
              <View style={[styles.buyInNote, { backgroundColor: p.primary + "15", borderRadius: radii.md }]}>
                <Ionicons name="information-circle-outline" size={14} color={p.primary} />
                <Muted style={{ flex: 1, color: p.primary, fontSize: fontSizes.small }}>
                  Buy-in: {formatMoney(tournament.buyInCents)} per player — collect cash, Venmo, or Apple Pay before the round.
                </Muted>
              </View>
            )}
          </Card>
        )}

        {/* My Status */}
        {isJoined && myPlayer && tournament.buyInCents > 0 && (
          <Card>
            <Row style={{ gap: spacing.sm, alignItems: "center" }}>
              <Ionicons
                name={myPlayer.paymentStatus === "paid" ? "checkmark-circle" : "time-outline"}
                size={20}
                color={myPlayer.paymentStatus === "paid" ? "#22C55E" : "#F59E0B"}
              />
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: fontWeights.semibold }}>
                  {myPlayer.paymentStatus === "paid" ? "You're all set!" : "Payment pending"}
                </Body>
                <Muted>
                  {myPlayer.paymentStatus === "paid"
                    ? "Your buy-in is confirmed."
                    : `Pay ${formatMoney(tournament.buyInCents)} to the organizer before the round.`}
                </Muted>
              </View>
            </Row>
          </Card>
        )}

        {/* Players */}
        <SectionHeader title={`Players (${tournament.players.length})`} />
        <Card>
          {tournament.players.map((player, i) => (
            <View key={player.playerId}>
              <Row style={styles.playerRow}>
                <View style={[styles.avatar, { backgroundColor: p.primary + "20" }]}>
                  <Text style={{ fontWeight: fontWeights.semibold, color: p.primary }}>
                    {player.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Row style={{ gap: spacing.xs, alignItems: "center" }}>
                    <Body style={{ fontWeight: fontWeights.semibold }}>{player.displayName}</Body>
                    {player.playerId === tournament.creatorId && (
                      <Chip label="Organizer" />
                    )}
                  </Row>
                  {tournament.status === "completed" && player.finalPosition && (
                    <Muted>#{player.finalPosition} · {player.payoutCents ? formatMoney(player.payoutCents) : "—"}</Muted>
                  )}
                </View>
                {tournament.buyInCents > 0 && (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{
                      fontSize: fontSizes.small,
                      fontWeight: fontWeights.semibold,
                      color: paymentStatusColor(player.paymentStatus, "#22C55E", "#F59E0B", p.mutedLight),
                    }}>
                      {paymentStatusLabel(player.paymentStatus)}
                    </Text>
                    {isCreator && player.paymentStatus === "registered" && (
                      <Text
                        style={{ fontSize: fontSizes.micro, color: p.primary, marginTop: 2 }}
                        onPress={() => handleMarkPaid(player.playerId)}
                      >
                        Mark paid
                      </Text>
                    )}
                  </View>
                )}
              </Row>
              {i < tournament.players.length - 1 && (
                <View style={[styles.divider, { backgroundColor: p.border }]} />
              )}
            </View>
          ))}
        </Card>

        {/* Actions */}
        {tournament.status === "open" && !isJoined && !isFull && profile && (
          <Button label="Join Tournament" onPress={handleJoin} />
        )}
        {tournament.status === "open" && isFull && !isJoined && (
          <Card>
            <Body style={{ textAlign: "center", color: p.mutedLight }}>This tournament is full.</Body>
          </Card>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  navRow: {
    marginBottom: spacing.xs,
  },
  detailGrid: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  detailLabel: {
    fontWeight: fontWeights.semibold,
  },
  descBox: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  prizeCard: {
    borderWidth: 1,
    gap: spacing.sm,
  },
  buyInNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  playerRow: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
