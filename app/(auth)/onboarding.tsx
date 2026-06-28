import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Body, Button, Chip, Field, Muted, ProgressBar, Row, Subheading, Title, useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { analytics } from "@/lib/analytics";
import { useAppStore } from "@/stores/appStore";
import type { Profile, SkillLevel } from "@/types/domain";

const SKILL_OPTIONS: { value: SkillLevel; label: string; sub: string }[] = [
  { value: "new", label: "New golfer", sub: "Still learning the basics" },
  { value: "casual", label: "Casual", sub: "Play a few times a year" },
  { value: "recreational", label: "Recreational", sub: "Play regularly, tracking my game" },
  { value: "competitive", label: "Competitive", sub: "Playing tournaments or leagues" },
  { value: "elite", label: "Elite", sub: "Single-digit handicap or better" },
];

const STYLE_OPTIONS = [
  { value: "casual" as const, label: "Casual & social", icon: "🍺" },
  { value: "competitive" as const, label: "Competitive", icon: "🏆" },
  { value: "both" as const, label: "Both — it depends", icon: "⚖️" },
];

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const profile = useAppStore((state) => state.profile);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const p = useTheme();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [city, setCity] = useState(profile?.city ?? "Nashville");
  const [state, setState] = useState(profile?.state ?? "TN");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(profile?.skillLevel ?? "recreational");
  const [preferredStyle, setPreferredStyle] = useState<"casual" | "competitive" | "both">(profile?.preferredGameStyle ?? "both");
  const [handicapStr, setHandicapStr] = useState(profile?.handicapValue?.toString() ?? "");

  if (!profile) return null;

  const advance = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => {
    const handicapValue = handicapStr ? parseFloat(handicapStr) : undefined;
    const completed: Profile = {
      ...profile,
      displayName: displayName || profile.displayName,
      username: username || profile.username,
      city: city || profile.city,
      state: state || profile.state,
      skillLevel,
      preferredGameStyle: preferredStyle,
      handicapSource: handicapValue != null ? "official_unverified" : "match_play_estimate",
      handicapValue: handicapValue != null && !isNaN(handicapValue) ? handicapValue : undefined,
    };
    completeOnboarding(completed);
    analytics.track("onboarding_completed", { city, skillLevel });
    router.replace("/(tabs)");
  };

  const steps = [
    <StepBasics
      displayName={displayName}
      username={username}
      onDisplayName={setDisplayName}
      onUsername={setUsername}
    />,
    <StepLocation city={city} state={state} onCity={setCity} onState={setState} />,
    <StepSkill selected={skillLevel} onSelect={setSkillLevel} />,
    <StepPreferences
      style={preferredStyle}
      onStyle={setPreferredStyle}
      handicap={handicapStr}
      onHandicap={setHandicapStr}
    />,
  ];

  const currentStep = steps[step];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Progress bar */}
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.sm }}>
          <ProgressBar progress={(step + 1) / TOTAL_STEPS} />
          <Row align="space-between">
            <Muted>Step {step + 1} of {TOTAL_STEPS}</Muted>
            {step > 0 && (
              <Pressable onPress={back}>
                <Text style={{ color: p.primary, fontSize: fontSizes.small, fontWeight: fontWeights.medium }}>Back</Text>
              </Pressable>
            )}
          </Row>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar preview */}
          <Row align="center" style={{ justifyContent: "center", paddingVertical: spacing.md }}>
            <Avatar name={displayName || profile.displayName} size={80} />
          </Row>

          {currentStep}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.lg }}>
          <Button
            label={step < TOTAL_STEPS - 1 ? "Continue" : "Complete profile"}
            onPress={step < TOTAL_STEPS - 1 ? advance : finish}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepBasics({ displayName, username, onDisplayName, onUsername }: {
  displayName: string;
  username: string;
  onDisplayName: (v: string) => void;
  onUsername: (v: string) => void;
}) {
  const p = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <Title>Your golfer profile</Title>
        <Body color={p.muted}>How other players will see you on Match Play.</Body>
      </View>
      <Field label="Display name" value={displayName} onChangeText={onDisplayName} placeholder="Jackson Reed" autoComplete="name" returnKeyType="next" />
      <Field
        label="Username"
        value={username}
        onChangeText={(v) => onUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
        placeholder="jreed"
        autoCapitalize="none"
        autoComplete="username"
        returnKeyType="done"
      />
      <Muted>Your username is unique and appears in search results. Lowercase letters, numbers, and underscores only.</Muted>
    </View>
  );
}

function StepLocation({ city, state, onCity, onState }: {
  city: string;
  state: string;
  onCity: (v: string) => void;
  onState: (v: string) => void;
}) {
  const p = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <Title>Where do you play?</Title>
        <Body color={p.muted}>Used to show nearby tee times, games, and golfers. Only your approximate city is shown publicly — never your exact address.</Body>
      </View>
      <Field label="City" value={city} onChangeText={onCity} placeholder="Nashville" returnKeyType="next" />
      <Field label="State" value={state} onChangeText={(v) => onState(v.toUpperCase().slice(0, 2))} placeholder="TN" autoCapitalize="characters" maxLength={2} returnKeyType="done" />
    </View>
  );
}

function StepSkill({ selected, onSelect }: { selected: SkillLevel; onSelect: (v: SkillLevel) => void }) {
  const p = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <Title>Skill level</Title>
        <Body color={p.muted}>Helps match you with compatible groups. You can update this anytime.</Body>
      </View>
      <View style={{ gap: spacing.sm }}>
        {SKILL_OPTIONS.map((opt) => {
          const active = opt.value === selected;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[
                styles.skillBtn,
                { borderColor: active ? p.primary : p.border, backgroundColor: active ? p.successLight : p.surface },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.semibold, color: active ? p.primary : p.text }}>
                  {opt.label}
                </Text>
                <Text style={{ fontSize: fontSizes.small, color: p.muted, marginTop: 2 }}>{opt.sub}</Text>
              </View>
              <View style={[styles.radio, { borderColor: active ? p.primary : p.border, backgroundColor: active ? p.primary : "transparent" }]}>
                {active && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF" }} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StepPreferences({ style, onStyle, handicap, onHandicap }: {
  style: "casual" | "competitive" | "both";
  onStyle: (v: "casual" | "competitive" | "both") => void;
  handicap: string;
  onHandicap: (v: string) => void;
}) {
  const p = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <Title>Your game style</Title>
        <Body color={p.muted}>This shapes your discovery feed and game recommendations.</Body>
      </View>

      <View style={{ gap: spacing.sm }}>
        {STYLE_OPTIONS.map((opt) => {
          const active = opt.value === style;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onStyle(opt.value)}
              style={[styles.skillBtn, { borderColor: active ? p.primary : p.border, backgroundColor: active ? p.successLight : p.surface }]}
            >
              <Text style={{ fontSize: fontSizes.heading }}>{opt.icon}</Text>
              <Text style={{ flex: 1, fontSize: fontSizes.body, fontWeight: fontWeights.semibold, color: active ? p.primary : p.text }}>
                {opt.label}
              </Text>
              <View style={[styles.radio, { borderColor: active ? p.primary : p.border, backgroundColor: active ? p.primary : "transparent" }]}>
                {active && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF" }} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: spacing.md, paddingTop: spacing.sm }}>
        <View style={{ gap: spacing.xs }}>
          <Subheading>Current handicap (optional)</Subheading>
          <Body color={p.muted} style={{ fontSize: fontSizes.small }}>Enter your known handicap or leave blank. Match Play will generate an estimate once you complete rounds.</Body>
        </View>
        <Field
          label="Handicap Index"
          value={handicap}
          onChangeText={onHandicap}
          placeholder="e.g. 12.4"
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        <View style={{ backgroundColor: p.accentBg, borderRadius: radii.md, padding: spacing.md }}>
          <Text style={{ fontSize: fontSizes.small, color: p.accentText, lineHeight: 18 }}>
            ⚠️ Any handicap entered here is marked self-reported, not an official USGA Handicap Index. You can connect to an official provider later in Settings.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skillBtn: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radii.md, borderWidth: 1.5 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
