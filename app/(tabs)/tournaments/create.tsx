import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Body,
  Button,
  Card,
  Muted,
  Row,
  Subheading,
  Title,
  useTheme,
} from "@/design-system/components";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import { createTournament, formatFormatLabel, formatPrizeDistributionLabel } from "@/services/tournaments";
import type { PrizeDistribution, TournamentFormat } from "@/types/domain";

const FORMATS: TournamentFormat[] = ["stroke_play", "match_play", "stableford", "scramble"];
const PRIZE_OPTIONS: PrizeDistribution[] = ["winner_takes_all", "top3_split", "no_prize"];

function OptionRow<T extends string>({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string;
  value: T;
  selected: boolean;
  onSelect: (v: T) => void;
}) {
  const p = useTheme();
  return (
    <TouchableOpacity
      style={[styles.option, selected && { borderColor: p.primary, backgroundColor: p.primary + "10" }]}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <Text style={{ color: selected ? p.primary : p.text, fontWeight: selected ? fontWeights.semibold : fontWeights.regular, fontSize: fontSizes.small }}>
        {label}
      </Text>
      {selected && <Ionicons name="checkmark-circle" size={18} color={p.primary} />}
    </TouchableOpacity>
  );
}

function FieldLabel({ label }: { label: string }) {
  const p = useTheme();
  return <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: p.text, marginBottom: spacing.xs }}>{label}</Text>;
}

export default function CreateTournamentScreen() {
  const p = useTheme();
  const profile = useAppStore((state) => state.profile);
  const addTournament = useAppStore((state) => state.addTournament);

  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [format, setFormat] = useState<TournamentFormat>("stroke_play");
  const [holes, setHoles] = useState<9 | 18>(18);
  const [maxPlayers, setMaxPlayers] = useState("16");
  const [buyInDollars, setBuyInDollars] = useState("");
  const [prizeDistribution, setPrizeDistribution] = useState<PrizeDistribution>("winner_takes_all");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const hasBuyIn = buyInDollars.trim() !== "" && parseFloat(buyInDollars) > 0;

  function validate(): string | null {
    if (!name.trim()) return "Tournament name is required.";
    if (!date.trim()) return "Date is required (MM/DD/YYYY).";
    const parsed = new Date(date + (time ? ` ${time}` : ""));
    if (isNaN(parsed.getTime())) return "Invalid date format. Use MM/DD/YYYY.";
    const max = parseInt(maxPlayers, 10);
    if (isNaN(max) || max < 2 || max > 128) return "Max players must be between 2 and 128.";
    if (buyInDollars.trim() && isNaN(parseFloat(buyInDollars))) return "Buy-in must be a dollar amount.";
    return null;
  }

  function handleCreate() {
    if (!profile) return;
    const err = validate();
    if (err) { Alert.alert("Check your details", err); return; }

    setLoading(true);
    const startsAt = new Date(date + (time ? ` ${time}` : " 08:00")).toISOString();
    const buyInCents = hasBuyIn ? Math.round(parseFloat(buyInDollars) * 100) : 0;

    const tournament = createTournament({
      name: name.trim(),
      courseName: courseName.trim() || undefined,
      creatorId: profile.id,
      creatorDisplayName: profile.displayName,
      startsAt,
      format,
      holes,
      maxPlayers: parseInt(maxPlayers, 10),
      buyInCents,
      prizeDistribution: hasBuyIn ? prizeDistribution : "no_prize",
      description: description.trim() || undefined,
    });

    addTournament(tournament);
    setLoading(false);
    router.replace({ pathname: "/(tabs)/tournaments/detail", params: { id: tournament.id } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Row style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={p.text} />
          </TouchableOpacity>
          <Title style={{ flex: 1, textAlign: "center" }}>New Tournament</Title>
          <View style={{ width: 24 }} />
        </Row>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Card>
            <FieldLabel label="Tournament Name *" />
            <TextInput
              style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
              placeholder="e.g. Saturday Showdown"
              placeholderTextColor={p.mutedLight}
              value={name}
              onChangeText={setName}
            />

            <FieldLabel label="Course / Venue" />
            <TextInput
              style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface, fontSize: fontSizes.body }]}
              placeholder="e.g. Pebble Beach Golf Links"
              placeholderTextColor={p.mutedLight}
              value={courseName}
              onChangeText={setCourseName}
            />

            <Row style={{ gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <FieldLabel label="Date *" />
                <TextInput
                  style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={p.mutedLight}
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel label="Tee Time" />
                <TextInput
                  style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
                  placeholder="e.g. 8:00 AM"
                  placeholderTextColor={p.mutedLight}
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </Row>

            <FieldLabel label="Description" />
            <TextInput
              style={[styles.input, styles.textArea, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
              placeholder="Rules, meeting point, etc."
              placeholderTextColor={p.mutedLight}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </Card>

          <Card>
            <FieldLabel label="Format" />
            {FORMATS.map((f) => (
              <OptionRow key={f} label={formatFormatLabel(f)} value={f} selected={format === f} onSelect={setFormat} />
            ))}

            <View style={{ marginTop: spacing.md }}>
              <FieldLabel label="Holes" />
              <Row style={{ gap: spacing.sm }}>
                {([9, 18] as const).map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.option, { flex: 1 }, holes === h && { borderColor: p.primary, backgroundColor: p.primary + "10" }]}
                    onPress={() => setHoles(h)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: holes === h ? p.primary : p.text, fontWeight: holes === h ? fontWeights.semibold : fontWeights.regular, fontSize: fontSizes.small }}>
                      {h} holes
                    </Text>
                    {holes === h && <Ionicons name="checkmark-circle" size={18} color={p.primary} />}
                  </TouchableOpacity>
                ))}
              </Row>
            </View>

            <View style={{ marginTop: spacing.md }}>
              <FieldLabel label="Max Players" />
              <TextInput
                style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface, width: 100 }]}
                value={maxPlayers}
                onChangeText={setMaxPlayers}
                keyboardType="number-pad"
              />
            </View>
          </Card>

          <Card>
            <Row style={{ alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
              <Ionicons name="cash-outline" size={20} color={p.primary} />
              <Subheading>Buy-In & Prize Pool</Subheading>
            </Row>
            <Muted style={{ marginBottom: spacing.md }}>
              Money is collected in person (cash, Venmo, Apple Pay, etc.) before the round starts. The app tracks who&rsquo;s paid and calculates payouts.
            </Muted>

            <FieldLabel label="Buy-In per Player ($)" />
            <TextInput
              style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface, width: 120 }]}
              placeholder="0"
              placeholderTextColor={p.mutedLight}
              value={buyInDollars}
              onChangeText={setBuyInDollars}
              keyboardType="decimal-pad"
            />

            {hasBuyIn && (
              <View style={{ marginTop: spacing.md }}>
                <FieldLabel label="Prize Distribution" />
                {PRIZE_OPTIONS.filter((d) => d !== "no_prize").map((d) => (
                  <OptionRow key={d} label={formatPrizeDistributionLabel(d)} value={d} selected={prizeDistribution === d} onSelect={setPrizeDistribution} />
                ))}
              </View>
            )}
          </Card>

          <Button label="Create Tournament" onPress={handleCreate} loading={loading} style={{ marginBottom: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "space-between",
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.body,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
});
