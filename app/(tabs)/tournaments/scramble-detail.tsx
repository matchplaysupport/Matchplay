import { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  Subheading,
  useTheme,
} from "@/design-system/components";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import {
  contestTypeIcon,
  contestTypeLabel,
  formatScrambleFormat,
  formatScrambleType,
  markTeamPaid,
  registerTeam,
  sponsorTierColor,
  spotsRemaining,
  totalRaisedCents,
  typeAccentColor,
} from "@/services/scrambles";
import type { RegistrationPackage, Scramble, ScrambleTeam } from "@/types/domain";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function money(cents: number) {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const p = useTheme();
  return (
    <Row style={{ gap: spacing.md, alignItems: "flex-start", marginBottom: spacing.sm }}>
      <View style={[styles.infoIcon, { backgroundColor: p.surfaceAlt }]}>
        <Ionicons name={icon as any} size={16} color={p.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Muted style={{ fontSize: fontSizes.tiny }}>{label}</Muted>
        <Text style={{ color: p.text, fontWeight: fontWeights.medium, fontSize: fontSizes.small }}>{value}</Text>
      </View>
    </Row>
  );
}

function SectionTitle({ label }: { label: string }) {
  const p = useTheme();
  return (
    <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, color: p.text, marginBottom: spacing.sm, marginTop: spacing.lg }}>
      {label}
    </Text>
  );
}

function PackageCard({
  pkg,
  accent,
  onSelect,
}: {
  pkg: RegistrationPackage;
  accent: string;
  onSelect: () => void;
}) {
  const p = useTheme();
  const full = pkg.spotsTotal != null && pkg.spotsTaken >= pkg.spotsTotal;
  return (
    <TouchableOpacity
      style={[styles.packageCard, { borderColor: full ? p.border : accent, backgroundColor: full ? p.surfaceAlt : p.surface }]}
      onPress={full ? undefined : onSelect}
      activeOpacity={full ? 1 : 0.75}
    >
      <Row style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: fontWeights.bold, fontSize: fontSizes.body, color: full ? p.mutedLight : p.text }}>
            {pkg.name}
          </Text>
          {pkg.description && <Muted style={{ marginTop: 2 }}>{pkg.description}</Muted>}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: fontSizes.heading, fontWeight: fontWeights.heavy, color: full ? p.mutedLight : accent }}>
            {money(pkg.priceCents)}
          </Text>
          {pkg.spotsTotal != null && (
            <Muted style={{ fontSize: fontSizes.tiny }}>
              {full ? "SOLD OUT" : `${pkg.spotsTotal - pkg.spotsTaken} left`}
            </Muted>
          )}
        </View>
      </Row>
      <View style={{ gap: 4 }}>
        {pkg.includes.map((inc, i) => (
          <Row key={i} style={{ gap: spacing.xs, alignItems: "center" }}>
            <Ionicons name="checkmark" size={14} color={full ? p.mutedLight : accent} />
            <Text style={{ fontSize: fontSizes.small, color: full ? p.mutedLight : p.textSecondary }}>{inc}</Text>
          </Row>
        ))}
      </View>
      {!full && (
        <View style={[styles.registerBtn, { backgroundColor: accent + "15", borderColor: accent + "40" }]}>
          <Text style={{ color: accent, fontWeight: fontWeights.semibold, fontSize: fontSizes.small }}>Register →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Registration Modal ────────────────────────────────────────────────────────

function RegisterModal({
  scramble,
  pkg,
  onClose,
  onRegister,
}: {
  scramble: Scramble;
  pkg: RegistrationPackage;
  onClose: () => void;
  onRegister: (team: Omit<ScrambleTeam, "id" | "registeredAt">) => void;
}) {
  const p = useTheme();
  const accent = typeAccentColor(scramble.type);
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<string[]>(Array(scramble.teamSize).fill(""));
  const [notes, setNotes] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<{ addOnId: string; quantity: number }[]>([]);

  function toggleAddOn(id: string) {
    const existing = selectedAddOns.find((a) => a.addOnId === id);
    if (existing) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.addOnId !== id));
    } else {
      setSelectedAddOns([...selectedAddOns, { addOnId: id, quantity: 1 }]);
    }
  }

  function calcTotal() {
    const addOnTotal = selectedAddOns.reduce((sum, a) => {
      const def = scramble.addOns.find((ao) => ao.id === a.addOnId);
      return sum + (def?.priceCents ?? 0) * a.quantity;
    }, 0);
    return pkg.priceCents + addOnTotal;
  }

  function handleSubmit() {
    if (!teamName.trim()) { Alert.alert("Enter a team name"); return; }
    if (players.some((n) => !n.trim())) { Alert.alert("Enter all player names"); return; }
    onRegister({
      teamName: teamName.trim(),
      players: players.map((n) => ({ name: n.trim() })),
      packageId: pkg.id,
      addOns: selectedAddOns,
      paymentStatus: "registered",
      totalPaidCents: 0,
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
        <Row style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={p.text} />
          </TouchableOpacity>
          <Text style={{ fontWeight: fontWeights.bold, fontSize: fontSizes.body, color: p.text }}>Register Team</Text>
          <View style={{ width: 24 }} />
        </Row>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }} keyboardShouldPersistTaps="handled">
          {/* Package summary */}
          <Card style={{ borderColor: accent, borderWidth: 1 }}>
            <Row style={{ justifyContent: "space-between" }}>
              <Text style={{ fontWeight: fontWeights.bold, color: p.text }}>{pkg.name}</Text>
              <Text style={{ fontWeight: fontWeights.heavy, color: accent }}>{money(pkg.priceCents)}</Text>
            </Row>
            <Muted style={{ marginTop: spacing.xs }}>{pkg.includes.join(" · ")}</Muted>
          </Card>

          {/* Team name */}
          <View>
            <Text style={{ fontWeight: fontWeights.semibold, color: p.text, marginBottom: spacing.xs }}>Team Name *</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
              placeholder="e.g. The Bogey Brothers"
              placeholderTextColor={p.mutedLight}
              value={teamName}
              onChangeText={setTeamName}
            />
          </View>

          {/* Player names */}
          <View>
            <Text style={{ fontWeight: fontWeights.semibold, color: p.text, marginBottom: spacing.xs }}>
              Players ({scramble.teamSize})
            </Text>
            {players.map((name, i) => (
              <TextInput
                key={i}
                style={[styles.modalInput, { borderColor: p.border, color: p.text, backgroundColor: p.surface, marginBottom: spacing.sm }]}
                placeholder={`Player ${i + 1} full name`}
                placeholderTextColor={p.mutedLight}
                value={name}
                onChangeText={(v) => setPlayers(players.map((n, j) => j === i ? v : n))}
              />
            ))}
          </View>

          {/* Add-ons */}
          {scramble.addOns.length > 0 && (
            <View>
              <Text style={{ fontWeight: fontWeights.semibold, color: p.text, marginBottom: spacing.sm }}>Add-Ons</Text>
              {scramble.addOns.map((ao) => {
                const selected = selectedAddOns.some((a) => a.addOnId === ao.id);
                return (
                  <TouchableOpacity
                    key={ao.id}
                    style={[styles.addOnRow, selected && { borderColor: accent, backgroundColor: accent + "0A" }]}
                    onPress={() => toggleAddOn(ao.id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: fontWeights.semibold, fontSize: fontSizes.small, color: selected ? accent : p.text }}>
                        {ao.label}
                      </Text>
                      <Muted>{money(ao.priceCents)}</Muted>
                    </View>
                    <View style={[styles.checkbox, selected && { backgroundColor: accent, borderColor: accent }]}>
                      {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Notes */}
          <View>
            <Text style={{ fontWeight: fontWeights.semibold, color: p.text, marginBottom: spacing.xs }}>Notes (optional)</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: p.border, color: p.text, backgroundColor: p.surface, minHeight: 60, textAlignVertical: "top" }]}
              placeholder="Dietary restrictions, handicap info, shirt size..."
              placeholderTextColor={p.mutedLight}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>

          {/* Total */}
          <Card style={{ backgroundColor: accent + "10", borderColor: accent + "30", borderWidth: 1 }}>
            <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: fontWeights.semibold, color: p.text }}>Total Due</Text>
              <Text style={{ fontSize: fontSizes.heading, fontWeight: fontWeights.heavy, color: accent }}>
                {money(calcTotal())}
              </Text>
            </Row>
            <Muted style={{ marginTop: spacing.xs }}>
              Pay organizer in cash, Venmo, or Apple Pay before the event. Your registration will be confirmed when payment is received.
            </Muted>
          </Card>

          <Button label="Submit Registration" onPress={handleSubmit} style={{ marginBottom: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ScrambleDetailScreen() {
  const p = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAppStore((s) => s.profile);
  const scrambles = useAppStore((s) => s.scrambles);
  const updateScramble = useAppStore((s) => s.updateScramble);

  const scramble = scrambles.find((s) => s.id === id);
  const [registeringPkg, setRegisteringPkg] = useState<RegistrationPackage | null>(null);

  if (!scramble) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
        <Button label="← Back" variant="ghost" onPress={() => router.back()} style={{ margin: spacing.lg }} />
        <Body style={{ textAlign: "center" }}>Event not found.</Body>
      </SafeAreaView>
    );
  }

  const accent = typeAccentColor(scramble.type);
  const raised = totalRaisedCents(scramble);
  const spotsLeft = spotsRemaining(scramble);
  const paidTeams = scramble.teams.filter((t) => t.paymentStatus === "paid").length;
  const isCreator = profile?.id === scramble.creatorId;

  const titleSponsor = scramble.sponsors.find((s) => s.tier === "title");
  const goldSponsors = scramble.sponsors.filter((s) => s.tier === "gold");
  const silverSponsors = scramble.sponsors.filter((s) => s.tier === "silver");
  const bronzeSponsors = scramble.sponsors.filter((s) => s.tier === "bronze");
  const holeSponsors = scramble.sponsors.filter((s) => s.tier === "hole");

  function handleRegister(team: Omit<ScrambleTeam, "id" | "registeredAt">) {
    if (!scramble) return;
    const updated = registerTeam(scramble, team);
    updateScramble(updated);
    const pkg = scramble.packages.find((p) => p.id === team.packageId);
    const addOnTotal = team.addOns.reduce((sum, a) => {
      const def = scramble.addOns.find((ao) => ao.id === a.addOnId);
      return sum + (def?.priceCents ?? 0) * a.quantity;
    }, 0);
    const total = (pkg?.priceCents ?? 0) + addOnTotal;
    Alert.alert(
      "Registration submitted!",
      `Bring ${money(total)} to pay the organizer before the event. You'll show as "Registered" until payment is confirmed.`,
    );
  }

  function handleMarkPaid(teamId: string) {
    if (!scramble) return;
    updateScramble(markTeamPaid(scramble, teamId));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <View style={[styles.hero, { backgroundColor: accent }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <View style={styles.heroBadge}>
            <Ionicons name="golf" size={12} color={accent} />
            <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.bold, color: accent }}>
              {formatScrambleType(scramble.type).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.heroTitle}>{scramble.name}</Text>
          {scramble.tagline && (
            <Text style={styles.heroTagline}>{scramble.tagline}</Text>
          )}

          {titleSponsor && (
            <View style={styles.titleSponsorBadge}>
              <Text style={{ fontSize: fontSizes.tiny, color: "rgba(255,255,255,0.65)" }}>Presented by</Text>
              <Text style={{ fontWeight: fontWeights.bold, color: "#fff", fontSize: fontSizes.small }}>{titleSponsor.name}</Text>
            </View>
          )}

          {/* Stats strip */}
          <Row style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{scramble.teams.length}</Text>
              <Text style={styles.heroStatLabel}>Teams</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{spotsLeft > 0 ? spotsLeft : "Full"}</Text>
              <Text style={styles.heroStatLabel}>Spots left</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{scramble.holes}H</Text>
              <Text style={styles.heroStatLabel}>{formatScrambleFormat(scramble.format)}</Text>
            </View>
          </Row>
        </View>

        <View style={styles.body}>

          {/* ── Charity Progress ─────────────────────────────────────── */}
          {scramble.type === "charity" && scramble.charityName && (
            <Card style={[styles.charityCard, { borderColor: "#C8981E50" }]}>
              <Row style={{ gap: spacing.sm, alignItems: "center", marginBottom: spacing.sm }}>
                <View style={[styles.charityIcon, { backgroundColor: "#C8981E18" }]}>
                  <Ionicons name="heart" size={20} color="#C8981E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: fontWeights.bold, color: p.text }}>{scramble.charityName}</Text>
                  {scramble.charityMission && <Muted style={{ marginTop: 2 }}>{scramble.charityMission}</Muted>}
                </View>
              </Row>
              {scramble.fundraisingGoalCents && (
                <>
                  <Row style={{ justifyContent: "space-between", marginBottom: spacing.xs }}>
                    <Text style={{ fontWeight: fontWeights.semibold, color: "#C8981E" }}>{money(raised)} raised</Text>
                    <Muted>Goal: {money(scramble.fundraisingGoalCents)}</Muted>
                  </Row>
                  <View style={[styles.progressBg, { backgroundColor: p.border }]}>
                    <View style={[styles.progressFill, {
                      backgroundColor: "#C8981E",
                      width: `${Math.min(100, (raised / scramble.fundraisingGoalCents) * 100)}%`,
                    }]} />
                  </View>
                </>
              )}
            </Card>
          )}

          {/* ── Event Info ───────────────────────────────────────────── */}
          <SectionTitle label="Event Info" />
          <Card>
            <InfoRow icon="calendar-outline" label="Date" value={fmtDate(scramble.date)} />
            {scramble.courseName && <InfoRow icon="location-outline" label="Venue" value={scramble.courseName + (scramble.courseAddress ? `\n${scramble.courseAddress}` : "")} />}
            {scramble.checkInTime && <InfoRow icon="time-outline" label="Check-In" value={scramble.checkInTime} />}
            {scramble.shotgunTime && <InfoRow icon="golf-outline" label={scramble.isShotgunStart ? "Shotgun Start" : "Tee Time"} value={scramble.shotgunTime} />}
            {scramble.estimatedEndTime && <InfoRow icon="flag-outline" label="Est. End" value={scramble.estimatedEndTime} />}
            <InfoRow icon="people-outline" label="Teams" value={`${scramble.teamSize} players per team · Max ${scramble.maxTeams} teams`} />
            {scramble.mullligansAllowed && <InfoRow icon="refresh-outline" label="Mulligans" value={`Allowed · ${scramble.maxMulligansPerTeam ?? "∞"} per team`} />}
          </Card>

          {scramble.description && (
            <>
              <SectionTitle label="About This Event" />
              <Card>
                <Body>{scramble.description}</Body>
              </Card>
            </>
          )}

          {/* Organizer */}
          <Card style={{ marginTop: spacing.sm }}>
            <Row style={{ gap: spacing.sm, alignItems: "center" }}>
              <View style={[styles.orgIcon, { backgroundColor: accent + "18" }]}>
                <Ionicons name="person-circle-outline" size={22} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Muted style={{ fontSize: fontSizes.tiny }}>Organized by</Muted>
                <Text style={{ fontWeight: fontWeights.semibold, color: p.text }}>{scramble.organizerName}</Text>
                {scramble.organizerContact && <Muted>{scramble.organizerContact}</Muted>}
              </View>
            </Row>
          </Card>

          {/* ── Schedule ─────────────────────────────────────────────── */}
          {scramble.schedule.length > 0 && (
            <>
              <SectionTitle label="Schedule" />
              <Card>
                {scramble.schedule.map((item, i) => (
                  <View key={i}>
                    <Row style={{ gap: spacing.md, alignItems: "center", paddingVertical: spacing.sm }}>
                      <View style={[styles.timelineDot, { backgroundColor: i === 0 ? accent : p.border }]} />
                      <Text style={{ width: 72, fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: accent }}>
                        {item.time}
                      </Text>
                      <Text style={{ flex: 1, fontSize: fontSizes.small, color: p.text }}>{item.label}</Text>
                    </Row>
                    {i < scramble.schedule.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: p.border }]} />
                    )}
                  </View>
                ))}
              </Card>
            </>
          )}

          {/* ── Contests ─────────────────────────────────────────────── */}
          {scramble.contests.length > 0 && (
            <>
              <SectionTitle label="Contests & Side Games" />
              <View style={{ gap: spacing.sm }}>
                {scramble.contests.map((c) => (
                  <Card key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                    <View style={[styles.contestIcon, { backgroundColor: accent + "18" }]}>
                      <Ionicons name={contestTypeIcon(c.type) as any} size={20} color={accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: fontWeights.bold, color: p.text }}>
                        {contestTypeLabel(c.type)}
                        {c.holeNumber ? ` — Hole ${c.holeNumber}` : ""}
                      </Text>
                      {c.prize ? (
                        <Text style={{ color: accent, fontWeight: fontWeights.semibold, fontSize: fontSizes.small }}>{c.prize}</Text>
                      ) : (
                        <Muted>Prize TBA</Muted>
                      )}
                    </View>
                  </Card>
                ))}
              </View>
            </>
          )}

          {/* ── Registration ─────────────────────────────────────────── */}
          <SectionTitle label="Registration" />
          {spotsLeft <= 0 ? (
            <Card>
              <Body style={{ textAlign: "center", color: p.mutedLight }}>This event is full.</Body>
            </Card>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {scramble.packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  accent={accent}
                  onSelect={() => setRegisteringPkg(pkg)}
                />
              ))}
            </View>
          )}

          {/* ── Add-Ons preview ───────────────────────────────────────── */}
          {scramble.addOns.length > 0 && (
            <>
              <SectionTitle label="Add-Ons Available" />
              <Card>
                {scramble.addOns.map((ao, i) => (
                  <Row key={ao.id} style={{ justifyContent: "space-between", paddingVertical: spacing.sm, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: p.border }}>
                    <Text style={{ color: p.text, fontSize: fontSizes.small }}>{ao.label}</Text>
                    <Text style={{ color: accent, fontWeight: fontWeights.semibold, fontSize: fontSizes.small }}>{money(ao.priceCents)}</Text>
                  </Row>
                ))}
              </Card>
            </>
          )}

          {/* ── Sponsors ─────────────────────────────────────────────── */}
          {scramble.sponsors.length > 0 && (
            <>
              <SectionTitle label="Our Sponsors" />

              {titleSponsor && (
                <Card style={[styles.titleSponsorCard, { borderColor: "#7A3B8A50", backgroundColor: "#7A3B8A08" }]}>
                  <Muted style={{ textAlign: "center", fontSize: fontSizes.tiny, letterSpacing: 1, textTransform: "uppercase" }}>
                    Title Sponsor
                  </Muted>
                  <Text style={{ textAlign: "center", fontWeight: fontWeights.heavy, fontSize: fontSizes.heading, color: "#7A3B8A", marginTop: spacing.xs }}>
                    {titleSponsor.name}
                  </Text>
                </Card>
              )}

              {[
                { tier: "gold" as const, list: goldSponsors },
                { tier: "silver" as const, list: silverSponsors },
                { tier: "bronze" as const, list: bronzeSponsors },
              ].filter(({ list }) => list.length > 0).map(({ tier, list }) => (
                <View key={tier} style={{ marginBottom: spacing.sm }}>
                  <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: sponsorTierColor(tier), textTransform: "uppercase", letterSpacing: 0.8, marginBottom: spacing.xs }}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Sponsors
                  </Text>
                  <Row style={{ flexWrap: "wrap", gap: spacing.sm }}>
                    {list.map((sp) => (
                      <View key={sp.id} style={[styles.sponsorBadge, { borderColor: sponsorTierColor(tier) + "40", backgroundColor: sponsorTierColor(tier) + "10" }]}>
                        <Text style={{ fontWeight: fontWeights.semibold, color: sponsorTierColor(tier), fontSize: fontSizes.small }}>{sp.name}</Text>
                      </View>
                    ))}
                  </Row>
                </View>
              ))}

              {holeSponsors.length > 0 && (
                <View>
                  <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: "#1A6B40", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: spacing.xs }}>
                    Hole Sponsors
                  </Text>
                  <View style={{ gap: spacing.xs }}>
                    {holeSponsors.map((sp) => (
                      <Row key={sp.id} style={[styles.holeSponsorRow, { borderColor: p.border, backgroundColor: p.surface }]}>
                        <View style={[styles.holeNum, { backgroundColor: "#1A6B4018" }]}>
                          <Text style={{ fontWeight: fontWeights.bold, color: "#1A6B40", fontSize: fontSizes.small }}>{sp.holeNumber ?? "—"}</Text>
                        </View>
                        <Text style={{ flex: 1, fontWeight: fontWeights.semibold, color: p.text, fontSize: fontSizes.small }}>{sp.name}</Text>
                        <Chip label="Hole Sponsor" variant="primary" size="xs" />
                      </Row>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {/* ── Registered Teams ─────────────────────────────────────── */}
          {scramble.teams.length > 0 && (
            <>
              <SectionTitle label={`Registered Teams (${scramble.teams.length})`} />
              <Card>
                {scramble.teams.map((team, i) => (
                  <View key={team.id}>
                    <Row style={{ alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm }}>
                      <View style={[styles.teamNum, { backgroundColor: accent + "18" }]}>
                        <Text style={{ fontWeight: fontWeights.bold, color: accent, fontSize: fontSizes.tiny }}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: fontWeights.semibold, color: p.text }}>{team.teamName}</Text>
                        <Muted style={{ fontSize: fontSizes.tiny }}>{team.players.map((pl) => pl.name).join(", ")}</Muted>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{
                          fontSize: fontSizes.small,
                          fontWeight: fontWeights.semibold,
                          color: team.paymentStatus === "paid" ? "#22C55E" : "#F59E0B",
                        }}>
                          {team.paymentStatus === "paid" ? "Paid ✓" : "Owes"}
                        </Text>
                        {isCreator && team.paymentStatus !== "paid" && (
                          <TouchableOpacity onPress={() => handleMarkPaid(team.id)}>
                            <Text style={{ fontSize: fontSizes.tiny, color: accent }}>Mark paid</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </Row>
                    {i < scramble.teams.length - 1 && (
                      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: p.border }} />
                    )}
                  </View>
                ))}
              </Card>
              {isCreator && (
                <Card style={{ marginTop: spacing.sm, backgroundColor: accent + "08", borderColor: accent + "30", borderWidth: 1 }}>
                  <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                      <Text style={{ fontWeight: fontWeights.semibold, color: p.text }}>Collected so far</Text>
                      <Muted>{paidTeams} of {scramble.teams.length} teams paid</Muted>
                    </View>
                    <Text style={{ fontSize: fontSizes.heading, fontWeight: fontWeights.heavy, color: accent }}>
                      {money(raised)}
                    </Text>
                  </Row>
                </Card>
              )}
            </>
          )}

        </View>
      </ScrollView>

      {/* Registration modal */}
      {registeringPkg && (
        <RegisterModal
          scramble={scramble}
          pkg={registeringPkg}
          onClose={() => setRegisteringPkg(null)}
          onRegister={handleRegister}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.heavy,
    color: "#fff",
    lineHeight: 36,
    marginBottom: spacing.xs,
  },
  heroTagline: {
    fontSize: fontSizes.body,
    color: "rgba(255,255,255,0.8)",
    marginBottom: spacing.md,
  },
  titleSponsorBadge: {
    marginBottom: spacing.lg,
  },
  heroStats: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: radii.lg,
    padding: spacing.md,
    justifyContent: "space-around",
  },
  heroStat: {
    alignItems: "center",
    flex: 1,
  },
  heroStatNum: {
    fontSize: fontSizes.subheading,
    fontWeight: fontWeights.heavy,
    color: "#fff",
  },
  heroStatLabel: {
    fontSize: fontSizes.tiny,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  body: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  charityCard: {
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  charityIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBg: {
    height: 8,
    borderRadius: radii.full,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.full,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  orgIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    marginLeft: 2,
  },
  timelineLine: {
    width: 2,
    height: 12,
    marginLeft: 6,
  },
  contestIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  packageCard: {
    borderWidth: 1.5,
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: "#fff",
  },
  registerBtn: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  titleSponsorCard: {
    borderWidth: 1,
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  sponsorBadge: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  holeSponsorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  holeNum: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  teamNum: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.body,
  },
  addOnRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.xs,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
