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
  Divider,
  HandicapLabel,
  ListItem,
  Muted,
  Row,
  SectionHeader,
  StatItem,
  Subheading,
  Title,
  useTheme,
} from "@/design-system/components";
import { fontSizes, fontWeights, radii, shadows, spacing } from "@/design-system/theme";
import { env } from "@/lib/env";
import { signOut } from "@/lib/auth";
import { useAppStore } from "@/stores/appStore";

export default function ProfileScreen() {
  const profile = useAppStore((state) => state.profile);
  const logout = useAppStore((state) => state.logout);
  const rounds = useAppStore((state) => state.rounds);
  const bookings = useAppStore((state) => state.bookings);
  const metrics = useAppStore((state) => state.metrics);
  const p = useTheme();

  if (!profile) return null;

  const submittedRounds = rounds.filter((r) => r.verificationState !== "draft").length;
  const partnerVerified = rounds.filter((r) => r.verificationState === "partner_verified").length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header banner */}
        <View style={[styles.header, { backgroundColor: p.primary }]}>
          <Row align="space-between">
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Title style={{ color: "#FFFFFF" }}>{profile.displayName}</Title>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.body }}>
                @{profile.username}
              </Text>
              <Row gap={spacing.xs} style={{ marginTop: spacing.xs }}>
                <Chip label={profile.reliabilityLabel} variant="muted" size="xs" />
                <Chip label={profile.skillLevel} variant="muted" size="xs" />
              </Row>
            </View>
            <Avatar name={profile.displayName} size={72} />
          </Row>
        </View>

        {/* Stats row */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: -18 }}>
          <Card elevated style={{ paddingVertical: spacing.lg }}>
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
          <SectionHeader title="Handicap" />
          <Card elevated>
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
          <SectionHeader title="Your profile" />
          <Card elevated>
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
          <SectionHeader title="Privacy controls" />
          <Card elevated>
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

        {/* Clubhouse Pro */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Card elevated style={{ backgroundColor: p.primaryDark, borderColor: "transparent" }}>
            <Row align="space-between">
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Chip label="Clubhouse Pro" variant="accent" />
                <Subheading style={{ color: "#FFFFFF", marginTop: spacing.xs }}>Unlock the full game</Subheading>
                <Body style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.small, lineHeight: 19 }}>
                  Unlimited discovery, advanced stats, detailed leaderboards, match history, private groups, and more.
                </Body>
              </View>
            </Row>
            <Button
              label="View Pro options"
              variant="accent"
              onPress={() => Alert.alert(
                "Clubhouse Pro",
                "Pricing and subscriptions are configured via RevenueCat. Monthly and annual plans will be available at launch.",
              )}
            />
          </Card>
        </View>

        {/* Settings */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <SectionHeader title="Settings & account" />
          <Card elevated>
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
          <Muted>Demo mode · No backend connected</Muted>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xs },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, marginTop: spacing.xs },
  toggleBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.full },
});
