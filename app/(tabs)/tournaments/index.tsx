import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Button,
  Card,
  Muted,
  Row,
  Subheading,
  Title,
  useTheme,
} from "@/design-system/components";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import { formatFormatLabel, prizePoolCents } from "@/services/tournaments";
import { formatScrambleFormat, formatScrambleType, typeAccentColor } from "@/services/scrambles";
import type { Scramble, Tournament } from "@/types/domain";

function statusColor(status: Tournament["status"], primary: string, muted: string): string {
  if (status === "open") return primary;
  if (status === "in_progress") return "#F59E0B";
  if (status === "completed") return muted;
  return muted;
}

function statusLabel(status: Tournament["status"]): string {
  const labels: Record<Tournament["status"], string> = {
    open: "Registering",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatMoney(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const p = useTheme();
  const pool = prizePoolCents(tournament);
  const isScramble = tournament.format === "scramble";

  return (
    <Card style={styles.card}>
      <Pressable onPress={() => router.push({ pathname: "/(tabs)/tournaments/detail", params: { id: tournament.id } })}>
        <Row style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Subheading>{tournament.name}</Subheading>
            <Muted style={{ marginTop: 2 }}>{tournament.courseName ?? "Course TBD"}</Muted>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(tournament.status, p.primary, p.mutedLight) + "20" }]}>
            <Text style={{ fontSize: fontSizes.micro, fontWeight: fontWeights.semibold, color: statusColor(tournament.status, p.primary, p.mutedLight) }}>
              {statusLabel(tournament.status)}
            </Text>
          </View>
        </Row>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={p.mutedLight} />
            <Muted style={styles.metaText}>{formatDate(tournament.startsAt)}</Muted>
          </View>
          {!isScramble && (
            <View style={styles.metaItem}>
              <Ionicons name="golf-outline" size={14} color={p.mutedLight} />
              <Muted style={styles.metaText}>{formatFormatLabel(tournament.format)} · {tournament.holes}H</Muted>
            </View>
          )}
          {isScramble && (
            <View style={styles.metaItem}>
              <Ionicons name="golf-outline" size={14} color={p.mutedLight} />
              <Muted style={styles.metaText}>{tournament.holes} holes</Muted>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={p.mutedLight} />
            <Muted style={styles.metaText}>{tournament.players.length}/{tournament.maxPlayers} players</Muted>
          </View>
        </View>

        {tournament.buyInCents > 0 && (
          <Row style={styles.prizeRow}>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color={p.primary} />
              <Text style={{ fontSize: fontSizes.small, color: p.primary, fontWeight: fontWeights.semibold, marginLeft: 4 }}>
                Buy-in: {formatMoney(tournament.buyInCents)}
              </Text>
            </View>
            {pool > 0 && (
              <Text style={{ fontSize: fontSizes.small, color: p.text, fontWeight: fontWeights.semibold }}>
                Prize pool: {formatMoney(pool)}
              </Text>
            )}
          </Row>
        )}
      </Pressable>
    </Card>
  );
}

function ScrambleCard({ scramble }: { scramble: Scramble }) {
  const p = useTheme();
  const accent = typeAccentColor(scramble.type);
  const spotsLeft = scramble.maxTeams - scramble.teams.length;

  return (
    <Card style={styles.card}>
      <Pressable onPress={() => router.push({ pathname: "/(tabs)/tournaments/scramble-detail", params: { id: scramble.id } })}>
        <Row style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Subheading>{scramble.name}</Subheading>
            {scramble.tagline && <Muted style={{ marginTop: 2 }}>{scramble.tagline}</Muted>}
            {!scramble.tagline && scramble.courseName && <Muted style={{ marginTop: 2 }}>{scramble.courseName}</Muted>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: accent + "20" }]}>
            <Text style={{ fontSize: fontSizes.micro, fontWeight: fontWeights.semibold, color: accent }}>
              {formatScrambleType(scramble.type)}
            </Text>
          </View>
        </Row>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={p.mutedLight} />
            <Muted style={styles.metaText}>{scramble.date}</Muted>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="golf-outline" size={14} color={p.mutedLight} />
            <Muted style={styles.metaText}>{formatScrambleFormat(scramble.format)} · {scramble.holes}H</Muted>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={p.mutedLight} />
            <Muted style={styles.metaText}>{scramble.teams.length}/{scramble.maxTeams} teams</Muted>
          </View>
        </View>
        {scramble.packages.length > 0 && (
          <Row style={styles.prizeRow}>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color={accent} />
              <Text style={{ fontSize: fontSizes.small, color: accent, fontWeight: fontWeights.semibold, marginLeft: 4 }}>
                From {scramble.packages[0] ? `$${((scramble.packages[0].priceCents) / 100).toFixed(0)}` : "Free"}
              </Text>
            </View>
            <Text style={{ fontSize: fontSizes.small, color: p.text, fontWeight: fontWeights.semibold }}>
              {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
            </Text>
          </Row>
        )}
      </Pressable>
    </Card>
  );
}

export default function TournamentsScreen() {
  const p = useTheme();
  const tournaments = useAppStore((state) => state.tournaments);
  const scrambles = useAppStore((state) => state.scrambles);
  const profile = useAppStore((state) => state.profile);

  const activeScrambles = scrambles.filter((s) => s.status === "open" || s.status === "in_progress");
  const pastScrambles = scrambles.filter((s) => s.status === "completed" || s.status === "cancelled");

  const activeTournaments = tournaments.filter((t) => t.status === "open" || t.status === "in_progress");
  const pastTournaments = tournaments.filter((t) => t.status === "completed" || t.status === "cancelled");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: p.header }]}>
        <Row align="space-between">
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text style={styles.kicker}>Clubhouse events</Text>
            <Title style={styles.headerTitle}>Events</Title>
            <Muted style={styles.headerSubtitle}>Host a scramble, run a bracket, or join what your group is playing.</Muted>
          </View>
          <View style={styles.headerGlyph}>
            <Ionicons name="trophy" size={24} color="#06261C" />
          </View>
        </Row>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {!profile && (
          <Card style={styles.signedOutCard}>
            <Row style={{ alignItems: "center", gap: spacing.md }}>
              <View style={[styles.sectionIcon, { backgroundColor: p.successLight }]}>
                <Ionicons name="person-circle-outline" size={18} color={p.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Subheading>Sign in to host events</Subheading>
                <Muted>Browse events now, or sign in to create scrambles and tournaments.</Muted>
              </View>
            </Row>
            <Button label="Go to sign in" size="sm" variant="secondary" onPress={() => router.replace("/(auth)/login")} />
          </Card>
        )}

        {/* ── Scrambles ─────────────────────────────────────────── */}
        <View style={[styles.sectionBlock, { backgroundColor: p.surface, borderColor: p.border }]}>
          <Row style={styles.sectionBlockHeader}>
            <Row style={{ gap: spacing.sm, alignItems: "center", flex: 1 }}>
              <View style={[styles.sectionIcon, { backgroundColor: "#7A3B8A18" }]}>
                <Ionicons name="golf" size={18} color="#7A3B8A" />
              </View>
              <View>
                <Text style={{ fontWeight: fontWeights.bold, fontSize: fontSizes.subheading, color: p.text }}>Scrambles</Text>
                <Muted>Team format, everyone plays the best shot</Muted>
              </View>
            </Row>
            {profile && (
              <Button
                label="New"
                size="sm"
                variant="secondary"
                onPress={() => router.push("/(tabs)/tournaments/create-scramble")}
                icon={<Ionicons name="add" size={14} color={p.primary} />}
              />
            )}
          </Row>

          {activeScrambles.length === 0 && pastScrambles.length === 0 ? (
            <View style={styles.emptyInline}>
              <Muted style={{ textAlign: "center" }}>No scrambles yet — start one for your group!</Muted>
              {profile && (
                <Button
                  label="Create Scramble"
                  size="sm"
                  style={{ marginTop: spacing.sm, alignSelf: "center" }}
                  onPress={() => router.push("/(tabs)/tournaments/create-scramble")}
                />
              )}
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {activeScrambles.map((s) => <ScrambleCard key={s.id} scramble={s} />)}
              {pastScrambles.length > 0 && (
                <>
                  <Text style={styles.subLabel}>Past</Text>
                  {pastScrambles.map((s) => <ScrambleCard key={s.id} scramble={s} />)}
                </>
              )}
            </View>
          )}
        </View>

        {/* ── Tournaments ───────────────────────────────────────── */}
        <View style={[styles.sectionBlock, { backgroundColor: p.surface, borderColor: p.border }]}>
          <Row style={styles.sectionBlockHeader}>
            <Row style={{ gap: spacing.sm, alignItems: "center", flex: 1 }}>
              <View style={[styles.sectionIcon, { backgroundColor: p.primary + "18" }]}>
                <Ionicons name="trophy" size={18} color={p.primary} />
              </View>
              <View>
                <Text style={{ fontWeight: fontWeights.bold, fontSize: fontSizes.subheading, color: p.text }}>Tournaments</Text>
                <Muted>Stroke play, match play, stableford</Muted>
              </View>
            </Row>
            {profile && (
              <Button
                label="New"
                size="sm"
                variant="secondary"
                onPress={() => router.push("/(tabs)/tournaments/create")}
                icon={<Ionicons name="add" size={14} color={p.primary} />}
              />
            )}
          </Row>

          {activeTournaments.length === 0 && pastTournaments.length === 0 ? (
            <View style={styles.emptyInline}>
              <Muted style={{ textAlign: "center" }}>No tournaments yet — set one up with buy-ins and brackets.</Muted>
              {profile && (
                <Button
                  label="Create Tournament"
                  size="sm"
                  style={{ marginTop: spacing.sm, alignSelf: "center" }}
                  onPress={() => router.push("/(tabs)/tournaments/create")}
                />
              )}
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {activeTournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)}
              {pastTournaments.length > 0 && (
                <>
                  <Text style={styles.subLabel}>Past</Text>
                  {pastTournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)}
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
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
  sectionBlock: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionBlockHeader: {
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  signedOutCard: {
    gap: spacing.md,
  },
  emptyInline: {
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: radii.lg,
  },
  cardHeader: {
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: fontSizes.tiny,
  },
  prizeRow: {
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  subLabel: {
    fontSize: fontSizes.tiny,
    fontWeight: fontWeights.semibold,
    color: "#9CAAA3",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
