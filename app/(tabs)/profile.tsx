import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEntitlement } from "@/hooks/useEntitlement";
import {
  Avatar,
  Body,
  Button,
  Card,
  Chip,
  Divider,
  HandicapLabel,
  ListItem,
  Muted,
  Row,
  StatItem,
  Subheading,
  Title,
  useTheme,
} from "@/design-system/components";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { env } from "@/lib/env";
import { signOut } from "@/lib/auth";
import { useAppStore } from "@/stores/appStore";

export default function ProfileScreen() {
  const profile = useAppStore((state) => state.profile);
  const logout = useAppStore((state) => state.logout);
  const rounds = useAppStore((state) => state.rounds);
  const bookings = useAppStore((state) => state.bookings);
  const metrics = useAppStore((state) => state.metrics);
  const demoMode = useAppStore((state) => state.demoMode);
  const setDemoMode = useAppStore((state) => state.setDemoMode);
  const p = useTheme();

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.emptyProfile}>
          <View style={[styles.emptyProfileIcon, { backgroundColor: p.successLight }]}>
            <Ionicons name="person-circle-outline" size={52} color={p.primary} />
          </View>
          <Title style={{ textAlign: "center" }}>Finish setting up your profile</Title>
          <Body color={p.muted} style={{ textAlign: "center" }}>
            Sign in or complete onboarding to manage handicap, privacy, notifications, and account settings.
          </Body>
          <Button label="Go to sign in" onPress={() => router.replace("/(auth)/login")} />
        </View>
      </SafeAreaView>
    );
  }

  const submittedRounds = rounds.filter((r) => r.verificationState !== "draft").length;
  const partnerVerified = rounds.filter((r) => r.verificationState === "partner_verified").length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Row align="space-between">
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Title style={styles.headerTitle}>{profile.displayName}</Title>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.body }}>
                @{profile.username}
              </Text>
              <Row gap={spacing.xs} style={{ marginTop: spacing.xs }}>
                <Chip label={profile.reliabilityLabel} variant="muted" size="xs" />
                <Chip label={profile.skillLevel} variant="muted" size="xs" />
              </Row>
            </View>
            <Avatar name={profile.displayName} size={70} />
          </Row>
        </View>

        {/* Stats row */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: -18 }}>
          <Card elevated style={styles.memberStatsCard}>
            <Row align="space-between">
              <StatItem value={String(submittedRounds)} label="Rounds" />
              <Divider style={{ width: 1, height: 48 }} />
              <StatItem value={String(bookings.length)} label="Bookings" />
              <Divider style={{ width: 1, height: 48 }} />
              <StatItem value={String(partnerVerified)} label="Verified" valueColor={p.primary} />
              <Divider style={{ width: 1, height: 48 }} />
              <StatItem value={String(metrics.joinRequests)} label="Games joined" />
            </Row>
          </Card>
        </View>

        {/* Handicap */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text style={styles.sectionLabel}>Handicap</Text>
          <Card elevated style={styles.profileCard}>
            <Row align="space-between">
              <HandicapLabel value={profile.handicapValue} source={profile.handicapSource} />
              <View style={{ alignItems: "flex-end", gap: spacing.sm }}>
                <Button
                  label="Connect GHIN"
                  variant="secondary"
                  size="sm"
                  onPress={() => Alert.alert("GHIN Integration", "Official GHIN integration is planned for a future release. Manual handicap entry is available in Settings.")}
                />
                <Muted>GHIN integration coming soon</Muted>
              </View>
            </Row>
            <Divider style={{ marginVertical: spacing.md }} />
            <ListItem
              title="Stats & Handicap"
              subtitle="Trends, scoring average, putts, and more"
              leading={<Ionicons name="stats-chart-outline" size={20} color={p.muted} />}
              trailing={<Ionicons name="chevron-forward" size={16} color={p.mutedLight} />}
              onPress={() => router.push("/(tabs)/stats")}
            />
            <Divider />
            <ListItem
              title="Leaderboards"
              subtitle="Local rankings, bonus points, and competitive standings"
              leading={<Ionicons name="podium-outline" size={20} color={p.muted} />}
              trailing={<Ionicons name="chevron-forward" size={16} color={p.mutedLight} />}
              onPress={() => router.push("/(tabs)/leaderboards")}
            />
            <View style={[styles.notice, { backgroundColor: p.accentBg }]}>
              <Ionicons name="information-circle-outline" size={14} color={p.accentText} />
              <Text style={{ flex: 1, fontSize: fontSizes.tiny, color: p.accentText, lineHeight: 17 }}>
                The Clubhouse estimates are calculated from submitted rounds and are not official USGA Handicap Indexes.
              </Text>
            </View>
          </Card>
        </View>

        {/* Player info */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text style={styles.sectionLabel}>Your profile</Text>
          <Card elevated style={styles.profileCard}>
            <ListItem
              title="Location"
              subtitle={`${profile.city}, ${profile.state} ${profile.zipCode}`}
              leading={<Ionicons name="location-outline" size={20} color={p.muted} />}
            />
            <Divider />
            <ListItem
              title="Game style"
              subtitle={profile.preferredGameStyle === "both" ? "Casual & competitive" : profile.preferredGameStyle}
              leading={<Ionicons name="golf-outline" size={20} color={p.muted} />}
            />
            <Divider />
            <ListItem
              title="Search radius"
              subtitle={`${profile.preferredRadiusMiles} miles`}
              leading={<Ionicons name="navigate-outline" size={20} color={p.muted} />}
            />
          </Card>
        </View>

        {/* Privacy */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text style={styles.sectionLabel}>Privacy controls</Text>
          <Card elevated style={styles.profileCard}>
            {[
              { label: "Hide exact age", value: profile.privacy.hideExactAge, key: "hideExactAge" as const },
              { label: "Hide handicap", value: profile.privacy.hideHandicap, key: "hideHandicap" as const },
              { label: "Hide round history", value: profile.privacy.hideRoundHistory, key: "hideRoundHistory" as const },
              { label: "Hide from discovery", value: profile.privacy.hideProfileDiscovery, key: "hideProfileDiscovery" as const },
              { label: "Hide from leaderboards", value: profile.privacy.hideLeaderboards, key: "hideLeaderboards" as const },
            ].map((item, i) => (
              <View key={item.key}>
                {i > 0 && <Divider />}
                <Row align="space-between" style={{ paddingVertical: spacing.md }}>
                  <Body>{item.label}</Body>
                  <View style={[styles.toggleBadge, { backgroundColor: item.value ? p.successLight : p.backgroundAlt }]}>
                    <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.bold, color: item.value ? p.primary : p.muted }}>
                      {item.value ? "Hidden" : "Visible"}
                    </Text>
                  </View>
                </Row>
              </View>
            ))}
            <Muted>Safety controls — blocking, reporting, and account deletion — are never paid features.</Muted>
          </Card>
        </View>

        {/* Subscription */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <SubscriptionCard />
        </View>

        {/* Developer / demo data */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text style={styles.sectionLabel}>Developer</Text>
          <Card elevated style={styles.profileCard}>
            <Row align="space-between">
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Subheading style={{ color: p.text, fontSize: fontSizes.body }}>Show example data</Subheading>
                <Muted>Layer demo golfers and open games on top of live data so you can preview a populated app.</Muted>
              </View>
              <Switch value={demoMode} onValueChange={setDemoMode} />
            </Row>
          </Card>
        </View>

        {/* Settings */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text style={styles.sectionLabel}>Settings & account</Text>
          <Card elevated style={styles.profileCard}>
            {[
              { icon: "notifications-outline" as const, label: "Notifications", onPress: () => Alert.alert("Notifications", "Notification preferences coming soon.") },
              { icon: "lock-closed-outline" as const, label: "Security", onPress: () => Alert.alert("Security", "Password change and 2FA coming soon.") },
              { icon: "help-circle-outline" as const, label: "Help & support", onPress: () => Alert.alert("Support", "support@golftheclubhouse.com") },
              { icon: "document-text-outline" as const, label: "Terms of Service", onPress: () => Alert.alert("Terms", "Legal review required before launch.") },
              { icon: "shield-outline" as const, label: "Privacy Policy", onPress: () => Alert.alert("Privacy", "Legal review required before launch.") },
            ].map((item, i) => (
              <View key={item.label}>
                {i > 0 && <Divider />}
                <ListItem
                  title={item.label}
                  leading={<Ionicons name={item.icon} size={20} color={p.muted} />}
                  trailing={<Ionicons name="chevron-forward" size={16} color={p.mutedLight} />}
                  onPress={item.onPress}
                />
              </View>
            ))}
          </Card>
        </View>

        {/* Account actions */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm }}>
          <Button
            label="Sign out"
            variant="secondary"
            onPress={() => {
              Alert.alert("Sign out", "Are you sure you want to sign out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign out",
                  style: "destructive",
                  onPress: () => {
                    if (env.EXPO_PUBLIC_USE_MOCK_AUTH) {
                      logout();
                      router.replace("/(auth)/login");
                    } else {
                      // signOut triggers onAuthStateChange → AuthListener calls logout()
                      void signOut();
                      router.replace("/(auth)/login");
                    }
                  },
                },
              ]);
            }}
          />
          <Button
            label="Delete account"
            variant="danger"
            onPress={() => Alert.alert(
              "Delete account",
              "This will permanently delete your profile, rounds, and all associated data. This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Request deletion", style: "destructive", onPress: () => Alert.alert("Deletion requested", "A server-side process will validate and delete your data within 30 days.") },
              ],
            )}
          />
        </View>

        {/* Build info */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl, alignItems: "center", gap: spacing.xs }}>
          <Muted>The Clubhouse · MVP Build</Muted>
          <Muted>{env.EXPO_PUBLIC_USE_MOCK_AUTH ? "Demo mode · No backend connected" : "Live account mode"}</Muted>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SubscriptionCard() {
  const p = useTheme();
  const { entitlement } = useEntitlement();

  if (entitlement === "pro") {
    return (
      <Card elevated style={{ backgroundColor: p.primaryDark, borderColor: "transparent" }}>
        <Row gap={spacing.sm}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Chip label="Clubhouse Pro" variant="accent" />
            <Body style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.small, marginTop: spacing.xs }}>
              You have full access to every feature.
            </Body>
          </View>
        </Row>
      </Card>
    );
  }

  if (entitlement === "plus") {
    return (
      <Card elevated>
        <Row align="space-between">
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Chip label="Clubhouse+" variant="primary" />
            <Body style={{ fontSize: fontSizes.small }}>Upgrade to Pro to unlock leaderboards, tournaments, and more.</Body>
          </View>
        </Row>
        <Button label="Upgrade to Pro" size="sm" onPress={() => router.push("/(tabs)/upgrade")} />
      </Card>
    );
  }

  return (
    <Card elevated style={{ backgroundColor: p.primaryDark, borderColor: "transparent" }}>
      <View style={{ gap: spacing.xs }}>
        <Chip label="Free plan" variant="muted" />
        <Subheading style={{ color: "#FFFFFF" }}>Unlock the full game</Subheading>
        <Body style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.small, lineHeight: 19 }}>
          Book tee times, track rounds, compete on leaderboards, and more.
        </Body>
      </View>
      <Button label="See plans" variant="accent" onPress={() => router.push("/(tabs)/upgrade")} />
    </Card>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#062B24",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xs,
  },
  headerTitle: {
    color: "#F7F3E8",
    fontFamily: "Georgia",
    fontSize: 32,
    lineHeight: 38,
  },
  sectionLabel: {
    color: "#C7D8CA",
    fontSize: fontSizes.tiny,
    fontWeight: fontWeights.heavy,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  memberStatsCard: { paddingVertical: spacing.lg, backgroundColor: "#FFFDF7", borderColor: "#E2DCCF" },
  profileCard: { backgroundColor: "#FFFDF7", borderColor: "#E2DCCF" },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, marginTop: spacing.xs },
  toggleBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.full },
  emptyProfile: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  emptyProfileIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});
