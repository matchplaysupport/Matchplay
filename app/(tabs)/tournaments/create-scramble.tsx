import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
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
  Title,
  useTheme,
} from "@/design-system/components";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";
import { useEntitlement } from "@/hooks/useEntitlement";
import { PaywallScreen } from "@/components/PaywallScreen";
import { env } from "@/lib/env";
import {
  createScramble,
  defaultAddOns,
  defaultPackages,
  defaultSchedule,
  typeAccentColor,
} from "@/services/scrambles";
import type {
  RegistrationPackage,
  ScrambleAddOn,
  ScrambleContest,
  ScrambleFormat,
  ScrambleScheduleItem,
  ScrambleSponsor,
  ScrambleType,
} from "@/types/domain";

// ─── Shared primitives ────────────────────────────────────────────────────────

function FL({ label }: { label: string }) {
  const p = useTheme();
  return (
    <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: p.text, marginBottom: spacing.xs }}>
      {label}
    </Text>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: TextInput["props"]["keyboardType"];
  optional?: boolean;
}) {
  const p = useTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Row style={{ gap: spacing.xs, marginBottom: spacing.xs }}>
        <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: p.text }}>{label}</Text>
        {optional && <Muted style={{ fontSize: fontSizes.tiny }}>(optional)</Muted>}
      </Row>
      <TextInput
        style={[
          styles.input,
          { borderColor: p.border, color: p.text, backgroundColor: p.surface },
          multiline && styles.textarea,
        ]}
        placeholder={placeholder}
        placeholderTextColor={p.mutedLight}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

function OptionPill<T extends string | number>({
  value,
  label,
  selected,
  onSelect,
  accent,
}: {
  value: T;
  label: string;
  selected: boolean;
  onSelect: (v: T) => void;
  accent?: string;
}) {
  const p = useTheme();
  const color = accent ?? p.primary;
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        selected && { borderColor: color, backgroundColor: color + "12" },
        !selected && { borderColor: p.border },
      ]}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: fontSizes.small, fontWeight: selected ? fontWeights.semibold : fontWeights.regular, color: selected ? color : p.text }}>
        {label}
      </Text>
      {selected && <Ionicons name="checkmark-circle" size={16} color={color} />}
    </TouchableOpacity>
  );
}

function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  const p = useTheme();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Row style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: i < step ? p.primary : i === step - 1 ? p.primary : p.border,
            }}
          />
        ))}
      </Row>
      <Muted style={{ fontSize: fontSizes.tiny }}>Step {step} of {total}</Muted>
      <Subheading style={{ marginTop: 2 }}>{title}</Subheading>
    </View>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const EVENT_TYPES: { value: ScrambleType; label: string; desc: string; icon: string }[] = [
  { value: "private", label: "Private Group", desc: "Friends, league, or club event", icon: "people-outline" },
  { value: "course", label: "Course Event", desc: "Organized by a golf course", icon: "golf-outline" },
  { value: "charity", label: "Charity Scramble", desc: "Fundraiser for a cause", icon: "heart-outline" },
  { value: "corporate", label: "Corporate Outing", desc: "Company or client event", icon: "briefcase-outline" },
];

const FORMATS: { value: ScrambleFormat; label: string; desc: string }[] = [
  { value: "captains_choice", label: "Captain's Choice", desc: "Everyone hits from the best shot — classic scramble" },
  { value: "modified_scramble", label: "Modified Scramble", desc: "Each player must contribute a minimum number of drives" },
  { value: "best_ball", label: "Best Ball", desc: "Each player plays their own ball, lowest score counts" },
  { value: "ambrose", label: "Ambrose", desc: "Scramble with net scoring using combined handicaps" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

export default function CreateScrambleScreen() {
  const { can } = useEntitlement();
  const p = useTheme();
  const profile = useAppStore((s) => s.profile);
  const addScramble = useAppStore((s) => s.addScramble);
  const [step, setStep] = useState(1);

  // Step 1 — Identity
  const [type, setType] = useState<ScrambleType>("private");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [organizerName, setOrganizerName] = useState(profile?.displayName ?? "");
  const [organizerContact, setOrganizerContact] = useState("");
  const [organizerWebsite, setOrganizerWebsite] = useState("");

  // Step 2 — Charity (shown only when type === "charity")
  const [charityName, setCharityName] = useState("");
  const [charityMission, setCharityMission] = useState("");
  const [charityEin, setCharityEin] = useState("");
  const [fundraisingGoal, setFundraisingGoal] = useState("");

  // Step 3 — Logistics
  const [courseName, setCourseName] = useState("");
  const [courseAddress, setCourseAddress] = useState("");
  const [date, setDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("7:00 AM");
  const [shotgunTime, setShotgunTime] = useState("8:00 AM");
  const [estimatedEnd, setEstimatedEnd] = useState("1:00 PM");
  const [holes, setHoles] = useState<9 | 18>(18);
  const [teamSize, setTeamSize] = useState<2 | 3 | 4>(4);
  const [maxTeams, setMaxTeams] = useState("20");
  const [format, setFormat] = useState<ScrambleFormat>("captains_choice");
  const [isShotgunStart, setIsShotgunStart] = useState(true);
  const [mulligansAllowed, setMulligansAllowed] = useState(false);
  const [maxMulligans, setMaxMulligans] = useState("3");

  // Step 4 — Schedule & Contests
  const [schedule, setSchedule] = useState<ScrambleScheduleItem[]>(() =>
    defaultSchedule("7:00 AM", "8:00 AM"),
  );
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [newScheduleLabel, setNewScheduleLabel] = useState("");
  const [contests, setContests] = useState<ScrambleContest[]>([]);

  // Step 5 — Registration packages & add-ons
  const [packages, setPackages] = useState<RegistrationPackage[]>(() => defaultPackages(4));
  const [addOns, setAddOns] = useState<ScrambleAddOn[]>(() => defaultAddOns());

  // Step 6 — Sponsors
  const [sponsors, setSponsors] = useState<ScrambleSponsor[]>([]);
  const [newSponsorName, setNewSponsorName] = useState("");
  const [newSponsorTier, setNewSponsorTier] = useState<ScrambleSponsor["tier"]>("gold");
  const [newSponsorHole, setNewSponsorHole] = useState("");

  const [loading, setLoading] = useState(false);
  const accent = typeAccentColor(type);

  if (!env.EXPO_PUBLIC_USE_MOCK_AUTH && !can("scramble_organizer")) {
    return <PaywallScreen requiredTier="pro" title="Scramble organizer is a Clubhouse Pro feature" description="Run charity scrambles, corporate outings, and club events with full registration and sponsor tools." />;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  function validateStep(): string | null {
    if (step === 1) {
      if (!name.trim()) return "Event name is required.";
      if (!organizerName.trim()) return "Organizer name is required.";
    }
    if (step === 3) {
      if (!date.trim()) return "Date is required (MM/DD/YYYY).";
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return "Invalid date. Use MM/DD/YYYY.";
      const max = parseInt(maxTeams, 10);
      if (isNaN(max) || max < 1) return "Max teams must be at least 1.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) { Alert.alert("Missing info", err); return; }
    // Skip step 2 (charity) if not charity type
    if (step === 1 && type !== "charity") { setStep(3); return; }
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function back() {
    if (step === 3 && type !== "charity") { setStep(1); return; }
    if (step > 1) setStep(step - 1);
  }

  function handleCreate() {
    const err = validateStep();
    if (err) { Alert.alert("Missing info", err); return; }
    if (!profile) return;
    setLoading(true);

    const scramble = createScramble({
      creatorId: profile.id,
      type,
      name: name.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim() || undefined,
      bannerColor: accent,
      organizerName: organizerName.trim(),
      organizerContact: organizerContact.trim() || undefined,
      organizerWebsite: organizerWebsite.trim() || undefined,
      charityName: type === "charity" ? charityName.trim() || undefined : undefined,
      charityMission: type === "charity" ? charityMission.trim() || undefined : undefined,
      charityEin: type === "charity" ? charityEin.trim() || undefined : undefined,
      fundraisingGoalCents: type === "charity" && fundraisingGoal ? Math.round(parseFloat(fundraisingGoal) * 100) : undefined,
      courseName: courseName.trim() || undefined,
      courseAddress: courseAddress.trim() || undefined,
      date,
      checkInTime: checkInTime.trim() || undefined,
      shotgunTime: shotgunTime.trim() || undefined,
      estimatedEndTime: estimatedEnd.trim() || undefined,
      format,
      holes,
      teamSize,
      maxTeams: parseInt(maxTeams, 10),
      isShotgunStart,
      mullligansAllowed: mulligansAllowed,
      maxMulligansPerTeam: mulligansAllowed && maxMulligans ? parseInt(maxMulligans, 10) : undefined,
      flights: [],
      schedule,
      contests,
      sponsors,
      packages,
      addOns: mulligansAllowed ? addOns : addOns.filter((a) => a.id !== "addon-mulligan"),
    });

    addScramble(scramble);
    setLoading(false);
    router.replace({ pathname: "/(tabs)/tournaments/scramble-detail", params: { id: scramble.id } });
  }

  // ── Step renderers ──────────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <View>
        <StepHeader step={1} total={TOTAL_STEPS} title="Event Type & Identity" />

        <FL label="What kind of event?" />
        <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
          {EVENT_TYPES.map((et) => (
            <TouchableOpacity
              key={et.value}
              style={[styles.typeCard, type === et.value && { borderColor: typeAccentColor(et.value), backgroundColor: typeAccentColor(et.value) + "0A" }]}
              onPress={() => setType(et.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.typeIcon, { backgroundColor: typeAccentColor(et.value) + "20" }]}>
                <Ionicons name={et.icon as any} size={22} color={typeAccentColor(et.value)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: fontWeights.semibold, color: type === et.value ? typeAccentColor(et.value) : p.text }}>
                  {et.label}
                </Text>
                <Muted>{et.desc}</Muted>
              </View>
              {type === et.value && <Ionicons name="checkmark-circle" size={20} color={typeAccentColor(et.value)} />}
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Event Name *" value={name} onChange={setName} placeholder="e.g. Annual Charity Classic" />
        <Field label="Tagline" value={tagline} onChange={setTagline} placeholder="e.g. Swing for a Cure — 2026" optional />
        <Field label="Description" value={description} onChange={setDescription} placeholder="Tell people what makes this event special..." multiline optional />
        <Field label="Organizer / Organization Name *" value={organizerName} onChange={setOrganizerName} placeholder="e.g. Riverside Golf Club" />
        <Field label="Contact (email or phone)" value={organizerContact} onChange={setOrganizerContact} placeholder="info@rivgolf.com" optional />
        <Field label="Website" value={organizerWebsite} onChange={setOrganizerWebsite} placeholder="https://..." optional />
      </View>
    );
  }

  function renderStep2() {
    return (
      <View>
        <StepHeader step={2} total={TOTAL_STEPS} title="Charity Details" />
        <View style={[styles.charityBanner, { backgroundColor: "#C8981E15", borderColor: "#C8981E40" }]}>
          <Ionicons name="heart" size={18} color="#C8981E" />
          <Body style={{ flex: 1, color: "#C8981E" }}>
            Charity scrambles attract more registrations and sponsors. Add your cause details to show up on the event page.
          </Body>
        </View>
        <Field label="Charity / Beneficiary Name *" value={charityName} onChange={setCharityName} placeholder="e.g. St. Jude Children's Research Hospital" />
        <Field label="Mission / What you're raising for" value={charityMission} onChange={setCharityMission} placeholder="Briefly describe the cause..." multiline />
        <Field label="EIN / Tax ID" value={charityEin} onChange={setCharityEin} placeholder="12-3456789" optional />
        <Field label="Fundraising Goal ($)" value={fundraisingGoal} onChange={setFundraisingGoal} placeholder="10000" keyboardType="decimal-pad" optional />
      </View>
    );
  }

  function renderStep3() {
    return (
      <View>
        <StepHeader step={3} total={TOTAL_STEPS} title="Logistics & Format" />

        <Field label="Course / Venue *" value={courseName} onChange={setCourseName} placeholder="e.g. Pebble Beach Golf Links" />
        <Field label="Address" value={courseAddress} onChange={setCourseAddress} placeholder="e.g. 1700 17-Mile Dr, Pebble Beach, CA" optional />
        <Field label="Date *" value={date} onChange={setDate} placeholder="MM/DD/YYYY" keyboardType="numbers-and-punctuation" />

        <Row style={{ gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Field label="Check-In" value={checkInTime} onChange={setCheckInTime} placeholder="7:00 AM" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Tee/Shotgun Start" value={shotgunTime} onChange={setShotgunTime} placeholder="8:00 AM" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Est. End" value={estimatedEnd} onChange={setEstimatedEnd} placeholder="1:00 PM" />
          </View>
        </Row>

        <FL label="Holes" />
        <Row style={{ gap: spacing.sm, marginBottom: spacing.md }}>
          {([9, 18] as const).map((h) => (
            <OptionPill key={h} value={h} label={`${h} holes`} selected={holes === h} onSelect={setHoles} accent={accent} />
          ))}
        </Row>

        <FL label="Players per Team" />
        <Row style={{ gap: spacing.sm, marginBottom: spacing.md }}>
          {([2, 3, 4] as const).map((n) => (
            <OptionPill key={n} value={n} label={`${n} players`} selected={teamSize === n} onSelect={(v) => { setTeamSize(v); setPackages(defaultPackages(v)); }} accent={accent} />
          ))}
        </Row>

        <Field label="Max Teams" value={maxTeams} onChange={setMaxTeams} keyboardType="number-pad" />
        <Muted style={{ marginTop: -spacing.sm, marginBottom: spacing.md }}>
          Up to {(parseInt(maxTeams || "0", 10) * teamSize).toLocaleString()} total players
        </Muted>

        <FL label="Format" />
        <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
          {FORMATS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.formatCard, format === f.value && { borderColor: accent, backgroundColor: accent + "0A" }]}
              onPress={() => setFormat(f.value)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: fontWeights.semibold, color: format === f.value ? accent : p.text, fontSize: fontSizes.small }}>
                  {f.label}
                </Text>
                <Muted style={{ marginTop: 2 }}>{f.desc}</Muted>
              </View>
              {format === f.value && <Ionicons name="checkmark-circle" size={18} color={accent} />}
            </TouchableOpacity>
          ))}
        </View>

        <Row style={{ justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <View>
            <Text style={{ fontWeight: fontWeights.semibold, color: p.text }}>Shotgun Start</Text>
            <Muted>All teams start simultaneously</Muted>
          </View>
          <TouchableOpacity
            style={[styles.toggle, { backgroundColor: isShotgunStart ? accent : p.border }]}
            onPress={() => setIsShotgunStart(!isShotgunStart)}
          >
            <View style={[styles.toggleKnob, { transform: [{ translateX: isShotgunStart ? 18 : 0 }] }]} />
          </TouchableOpacity>
        </Row>

        <Row style={{ justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
          <View>
            <Text style={{ fontWeight: fontWeights.semibold, color: p.text }}>Allow Mulligans</Text>
            <Muted>Teams can purchase extra shots</Muted>
          </View>
          <TouchableOpacity
            style={[styles.toggle, { backgroundColor: mulligansAllowed ? accent : p.border }]}
            onPress={() => setMulligansAllowed(!mulligansAllowed)}
          >
            <View style={[styles.toggleKnob, { transform: [{ translateX: mulligansAllowed ? 18 : 0 }] }]} />
          </TouchableOpacity>
        </Row>
        {mulligansAllowed && (
          <View style={{ marginBottom: spacing.md, marginTop: spacing.sm }}>
            <Field label="Max Mulligans per Team" value={maxMulligans} onChange={setMaxMulligans} keyboardType="number-pad" />
          </View>
        )}
      </View>
    );
  }

  function renderStep4() {
    const CONTEST_TYPES: ScrambleContest["type"][] = [
      "closest_to_pin", "longest_drive", "hole_in_one", "putting", "skins",
    ];
    const contestLabels: Record<ScrambleContest["type"], string> = {
      closest_to_pin: "Closest to Pin",
      longest_drive: "Longest Drive",
      hole_in_one: "Hole-in-One",
      putting: "Putting Contest",
      skins: "Skins Game",
    };

    function addContest(type: ScrambleContest["type"]) {
      if (contests.some((c) => c.type === type)) return;
      setContests([...contests, {
        id: `contest-${type}`,
        type,
        prize: "",
        holeNumber: type === "closest_to_pin" || type === "hole_in_one" ? undefined : undefined,
      }]);
    }

    function removeContest(id: string) {
      setContests(contests.filter((c) => c.id !== id));
    }

    function updateContest(id: string, patch: Partial<ScrambleContest>) {
      setContests(contests.map((c) => c.id === id ? { ...c, ...patch } : c));
    }

    function addScheduleItem() {
      if (!newScheduleTime.trim() || !newScheduleLabel.trim()) return;
      setSchedule([...schedule, { time: newScheduleTime.trim(), label: newScheduleLabel.trim() }]);
      setNewScheduleTime("");
      setNewScheduleLabel("");
    }

    return (
      <View>
        <StepHeader step={4} total={TOTAL_STEPS} title="Schedule & Contests" />

        <Subheading style={{ marginBottom: spacing.sm }}>Event Schedule</Subheading>
        <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
          {schedule.map((item, i) => (
            <Row key={i} style={[styles.scheduleRow, { backgroundColor: p.surface, borderColor: p.border }]}>
              <Ionicons name="time-outline" size={16} color={p.mutedLight} />
              <Text style={{ fontWeight: fontWeights.semibold, fontSize: fontSizes.small, color: p.text, width: 72 }}>{item.time}</Text>
              <Text style={{ flex: 1, fontSize: fontSizes.small, color: p.textSecondary }}>{item.label}</Text>
              <TouchableOpacity onPress={() => setSchedule(schedule.filter((_, j) => j !== i))}>
                <Ionicons name="close-circle" size={18} color={p.mutedLight} />
              </TouchableOpacity>
            </Row>
          ))}
        </View>
        <Row style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
          <TextInput
            style={[styles.input, { flex: 0, width: 90, borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
            placeholder="Time"
            placeholderTextColor={p.mutedLight}
            value={newScheduleTime}
            onChangeText={setNewScheduleTime}
          />
          <TextInput
            style={[styles.input, { flex: 1, borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
            placeholder="Activity (e.g. Dinner & Awards)"
            placeholderTextColor={p.mutedLight}
            value={newScheduleLabel}
            onChangeText={setNewScheduleLabel}
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: accent }]}
            onPress={addScheduleItem}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </Row>

        <Subheading style={{ marginBottom: spacing.sm }}>Contests & Side Games</Subheading>
        <Row style={{ flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md }}>
          {CONTEST_TYPES.map((ct) => {
            const active = contests.some((c) => c.type === ct);
            return (
              <TouchableOpacity
                key={ct}
                style={[styles.contestChip, active && { backgroundColor: accent + "18", borderColor: accent }]}
                onPress={() => active ? removeContest(`contest-${ct}`) : addContest(ct)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: active ? accent : p.mutedLight }}>
                  {active ? "✓ " : "+ "}{contestLabels[ct]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Row>
        {contests.map((c) => (
          <Card key={c.id} style={{ marginBottom: spacing.sm }}>
            <Text style={{ fontWeight: fontWeights.semibold, color: p.text, marginBottom: spacing.sm }}>
              {contestLabels[c.type]}
            </Text>
            <Row style={{ gap: spacing.sm }}>
              {(c.type === "closest_to_pin" || c.type === "hole_in_one") && (
                <View style={{ flex: 1 }}>
                  <FL label="Hole #" />
                  <TextInput
                    style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
                    placeholder="e.g. 7"
                    placeholderTextColor={p.mutedLight}
                    value={c.holeNumber?.toString() ?? ""}
                    onChangeText={(v) => updateContest(c.id, { holeNumber: parseInt(v, 10) || undefined })}
                    keyboardType="number-pad"
                  />
                </View>
              )}
              <View style={{ flex: 2 }}>
                <FL label="Prize Description" />
                <TextInput
                  style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
                  placeholder="e.g. $500 cash, free round of golf..."
                  placeholderTextColor={p.mutedLight}
                  value={c.prize}
                  onChangeText={(v) => updateContest(c.id, { prize: v })}
                />
              </View>
            </Row>
          </Card>
        ))}
      </View>
    );
  }

  function renderStep5() {
    function updatePackage(id: string, patch: Partial<RegistrationPackage>) {
      setPackages(packages.map((p) => p.id === id ? { ...p, ...patch } : p));
    }
    function addInclude(pkgId: string, item: string) {
      setPackages(packages.map((p) => p.id === pkgId ? { ...p, includes: [...p.includes, item] } : p));
    }
    function removeInclude(pkgId: string, idx: number) {
      setPackages(packages.map((p) => p.id === pkgId ? { ...p, includes: p.includes.filter((_, i) => i !== idx) } : p));
    }
    function removePackage(id: string) {
      setPackages(packages.filter((p) => p.id !== id));
    }
    function addPackage() {
      setPackages([...packages, {
        id: `pkg-${Date.now()}`,
        name: "",
        priceCents: 0,
        includes: [],
        spotsTaken: 0,
      }]);
    }
    function updateAddOn(id: string, patch: Partial<ScrambleAddOn>) {
      setAddOns(addOns.map((a) => a.id === id ? { ...a, ...patch } : a));
    }
    function removeAddOn(id: string) {
      setAddOns(addOns.filter((a) => a.id !== id));
    }
    function addAddOn() {
      setAddOns([...addOns, { id: `addon-${Date.now()}`, label: "", priceCents: 0 }]);
    }

    return (
      <View>
        <StepHeader step={5} total={TOTAL_STEPS} title="Registration & Pricing" />

        <Subheading style={{ marginBottom: spacing.sm }}>Registration Packages</Subheading>
        <Muted style={{ marginBottom: spacing.md }}>Each package is a registration option players can choose when joining. Prices are per-package (not per person unless you set it that way).</Muted>

        {packages.map((pkg, pi) => (
          <Card key={pkg.id} style={{ marginBottom: spacing.md }}>
            <Row style={{ justifyContent: "space-between", marginBottom: spacing.sm }}>
              <Text style={{ fontWeight: fontWeights.bold, color: p.text }}>Package {pi + 1}</Text>
              <TouchableOpacity onPress={() => removePackage(pkg.id)}>
                <Ionicons name="trash-outline" size={18} color={p.danger} />
              </TouchableOpacity>
            </Row>
            <Row style={{ gap: spacing.sm }}>
              <View style={{ flex: 2 }}>
                <FL label="Name" />
                <TextInput
                  style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
                  placeholder="e.g. Team of 4"
                  placeholderTextColor={p.mutedLight}
                  value={pkg.name}
                  onChangeText={(v) => updatePackage(pkg.id, { name: v })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FL label="Price ($)" />
                <TextInput
                  style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
                  placeholder="0"
                  placeholderTextColor={p.mutedLight}
                  value={pkg.priceCents ? (pkg.priceCents / 100).toFixed(0) : ""}
                  onChangeText={(v) => updatePackage(pkg.id, { priceCents: Math.round(parseFloat(v || "0") * 100) })}
                  keyboardType="decimal-pad"
                />
              </View>
            </Row>
            <FL label="What's included" />
            <View style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
              {pkg.includes.map((inc, ii) => (
                <Row key={ii} style={[styles.includeRow, { backgroundColor: p.backgroundAlt }]}>
                  <Ionicons name="checkmark" size={14} color={accent} />
                  <Text style={{ flex: 1, fontSize: fontSizes.small, color: p.text }}>{inc}</Text>
                  <TouchableOpacity onPress={() => removeInclude(pkg.id, ii)}>
                    <Ionicons name="close" size={14} color={p.mutedLight} />
                  </TouchableOpacity>
                </Row>
              ))}
            </View>
            <IncludeAdder onAdd={(v) => addInclude(pkg.id, v)} accent={accent} />
            <View style={{ marginTop: spacing.sm }}>
              <FL label="Total spots (blank = unlimited)" />
              <TextInput
                style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface, width: 100 }]}
                placeholder="∞"
                placeholderTextColor={p.mutedLight}
                value={pkg.spotsTotal?.toString() ?? ""}
                onChangeText={(v) => updatePackage(pkg.id, { spotsTotal: parseInt(v, 10) || undefined })}
                keyboardType="number-pad"
              />
            </View>
          </Card>
        ))}
        <Button label="+ Add Package" variant="secondary" onPress={addPackage} style={{ marginBottom: spacing.xl }} />

        <Subheading style={{ marginBottom: spacing.sm }}>Add-Ons</Subheading>
        <Muted style={{ marginBottom: spacing.md }}>Optional extras players can purchase at registration (mulligans, raffle tickets, dinner, etc.)</Muted>
        {addOns.map((a) => (
          <Card key={a.id} style={{ marginBottom: spacing.sm }}>
            <Row style={{ gap: spacing.sm, alignItems: "flex-start" }}>
              <View style={{ flex: 2 }}>
                <FL label="Add-On Name" />
                <TextInput
                  style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
                  value={a.label}
                  onChangeText={(v) => updateAddOn(a.id, { label: v })}
                  placeholder="e.g. Mulligan Pack"
                  placeholderTextColor={p.mutedLight}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FL label="Price ($)" />
                <TextInput
                  style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
                  value={a.priceCents ? (a.priceCents / 100).toFixed(0) : ""}
                  onChangeText={(v) => updateAddOn(a.id, { priceCents: Math.round(parseFloat(v || "0") * 100) })}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={p.mutedLight}
                />
              </View>
              <TouchableOpacity style={{ marginTop: 26 }} onPress={() => removeAddOn(a.id)}>
                <Ionicons name="trash-outline" size={18} color={p.danger} />
              </TouchableOpacity>
            </Row>
          </Card>
        ))}
        <Button label="+ Add Add-On" variant="secondary" onPress={addAddOn} />
      </View>
    );
  }

  function renderStep6() {
    const TIERS: ScrambleSponsor["tier"][] = ["title", "gold", "silver", "bronze", "hole", "media"];
    const tierColors: Record<ScrambleSponsor["tier"], string> = {
      title: "#7A3B8A", gold: "#C8981E", silver: "#8090A0", bronze: "#B06030", hole: "#1A6B40", media: "#2C5F8A",
    };
    const tierLabels: Record<ScrambleSponsor["tier"], string> = {
      title: "Title", gold: "Gold", silver: "Silver", bronze: "Bronze", hole: "Hole", media: "Media",
    };

    function addSponsor() {
      if (!newSponsorName.trim()) return;
      setSponsors([...sponsors, {
        id: `sp-${Date.now()}`,
        name: newSponsorName.trim(),
        tier: newSponsorTier,
        holeNumber: newSponsorTier === "hole" && newSponsorHole ? parseInt(newSponsorHole, 10) : undefined,
      }]);
      setNewSponsorName("");
      setNewSponsorHole("");
    }

    return (
      <View>
        <StepHeader step={6} total={TOTAL_STEPS} title="Sponsors" />
        <Muted style={{ marginBottom: spacing.lg }}>
          Add sponsors to display on the event page. Title and Gold sponsors appear most prominently.
        </Muted>

        {sponsors.length > 0 && (
          <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
            {sponsors.map((sp) => (
              <Row key={sp.id} style={[styles.sponsorRow, { backgroundColor: p.surface, borderColor: p.border }]}>
                <View style={[styles.tierDot, { backgroundColor: tierColors[sp.tier] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: fontWeights.semibold, fontSize: fontSizes.small, color: p.text }}>{sp.name}</Text>
                  <Muted style={{ fontSize: fontSizes.tiny }}>
                    {tierLabels[sp.tier]}{sp.holeNumber ? ` · Hole ${sp.holeNumber}` : ""}
                  </Muted>
                </View>
                <TouchableOpacity onPress={() => setSponsors(sponsors.filter((s) => s.id !== sp.id))}>
                  <Ionicons name="close-circle" size={18} color={p.mutedLight} />
                </TouchableOpacity>
              </Row>
            ))}
          </View>
        )}

        <Card>
          <FL label="Sponsor Name" />
          <TextInput
            style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
            placeholder="e.g. Acme Corporation"
            placeholderTextColor={p.mutedLight}
            value={newSponsorName}
            onChangeText={setNewSponsorName}
          />
          <FL label="Sponsorship Tier" />
          <Row style={{ flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md }}>
            {TIERS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.contestChip,
                  newSponsorTier === t && { backgroundColor: tierColors[t] + "18", borderColor: tierColors[t] },
                ]}
                onPress={() => setNewSponsorTier(t)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: newSponsorTier === t ? tierColors[t] : p.mutedLight }}>
                  {tierLabels[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </Row>
          {newSponsorTier === "hole" && (
            <View style={{ marginBottom: spacing.md }}>
              <FL label="Hole Number" />
              <TextInput
                style={[styles.input, { borderColor: p.border, color: p.text, backgroundColor: p.surface, width: 80 }]}
                placeholder="e.g. 5"
                placeholderTextColor={p.mutedLight}
                value={newSponsorHole}
                onChangeText={setNewSponsorHole}
                keyboardType="number-pad"
              />
            </View>
          )}
          <Button label="Add Sponsor" variant="secondary" onPress={addSponsor} icon={<Ionicons name="add" size={16} color={p.primary} />} />
        </Card>
      </View>
    );
  }

  const stepContent = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];
  const effectiveStep = step === 1 ? 0 : step === 3 ? 2 : step === 4 ? 3 : step === 5 ? 4 : step === 6 ? 5 : 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <Row style={styles.navRow}>
          <TouchableOpacity onPress={step === 1 ? () => router.back() : back} style={styles.navBtn}>
            <Ionicons name={step === 1 ? "close" : "arrow-back"} size={22} color={p.text} />
          </TouchableOpacity>
          <View style={[styles.navDot, { backgroundColor: accent }]}>
            <Ionicons name="golf" size={14} color="#fff" />
          </View>
          <Text style={{ fontWeight: fontWeights.bold, color: p.text, fontSize: fontSizes.body }}>New Scramble</Text>
          <View style={{ width: 38 }} />
        </Row>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {stepContent[effectiveStep]?.()}

          <View style={{ height: spacing.md }} />

          {step < TOTAL_STEPS ? (
            <Button label="Continue" onPress={next} style={{ marginBottom: spacing.sm }} />
          ) : (
            <Button label="Create Event" onPress={handleCreate} loading={loading} />
          )}
          {step > 1 && (
            <Button label="Back" variant="ghost" onPress={back} />
          )}
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Mini helpers ──────────────────────────────────────────────────────────────

function IncludeAdder({ onAdd, accent }: { onAdd: (v: string) => void; accent: string }) {
  const p = useTheme();
  const [val, setVal] = useState("");
  return (
    <Row style={{ gap: spacing.sm }}>
      <TextInput
        style={[styles.input, { flex: 1, borderColor: p.border, color: p.text, backgroundColor: p.surface }]}
        placeholder="e.g. Green fees, Cart, Lunch..."
        placeholderTextColor={p.mutedLight}
        value={val}
        onChangeText={setVal}
        onSubmitEditing={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}
        returnKeyType="done"
      />
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: accent }]}
        onPress={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </Row>
  );
}

const styles = StyleSheet.create({
  navRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  navBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  navDot: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.body,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  formatCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: radii.full,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: "#fff",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  contestChip: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  includeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  charityBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  sponsorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
  },
});
