import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Body,
  Button,
  Card,
  Chip,
  Divider,
  Muted,
  Row,
  SectionHeader,
  Subheading,
  Title,
  useTheme,
} from "@/design-system/components";
import { demoCourses, demoTeeTimes } from "@/features/courses/demoData";
import { SimulatedTeeTimeProvider } from "@/integrations/tee-times/SimulatedTeeTimeProvider";
import { SupabaseTeeTimeProvider } from "@/integrations/tee-times/SupabaseTeeTimeProvider";
import { env } from "@/lib/env";
import { analytics } from "@/lib/analytics";
import { fontSizes, fontWeights, radii, shadows, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";

const provider = env.EXPO_PUBLIC_USE_MOCK_AUTH
  ? new SimulatedTeeTimeProvider()
  : new SupabaseTeeTimeProvider();

export default function TeeTimeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = useTheme();

  const teeTime = demoTeeTimes.find((t) => t.id === id);
  const course = teeTime ? demoCourses.find((c) => c.id === teeTime.courseId) : null;

  const [players, setPlayers] = useState(2);
  const [communitySpots, setCommunitySpots] = useState(0);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const addBooking = useAppStore((state) => state.addBooking);
  const recordMetric = useAppStore((state) => state.recordMetric);

  const totalPrice = teeTime ? (teeTime.priceCents / 100) * players : 0;
  const selectedTeeSet = course?.teeSets[0];

  if (!teeTime || !course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md }}>
          <Ionicons name="alert-circle-outline" size={48} color={p.danger} />
          <Title>Tee time not found</Title>
          <Button label="Go back" onPress={() => router.back()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const handleBook = async () => {
    setBooking(true);
    try {
      const result = await provider.reserve({ teeTimeId: teeTime.id, players, communitySpots });
      addBooking(result);
      recordMetric("bookingRequests");
      analytics.track("simulated_booking_completed", { courseId: teeTime.courseId, players });
      setBooked(true);
    } catch (err) {
      Alert.alert("Could not book", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}>
          <View style={{ alignItems: "center", gap: spacing.lg, paddingVertical: spacing.xxl }}>
            <View style={[styles.successIcon, { backgroundColor: p.successLight }]}>
              <Ionicons name="checkmark-circle" size={56} color={p.primary} />
            </View>
            <Title style={{ textAlign: "center" }}>Request received!</Title>
            <Body color={p.muted} style={{ textAlign: "center", lineHeight: 22 }}>
              Your demo booking for {course.name} has been added to your upcoming rounds.
            </Body>
          </View>
          <Card elevated>
            <Subheading>{course.name}</Subheading>
            <Body color={p.muted}>{course.city}, {course.state}</Body>
            <Row gap={spacing.md}>
              <Chip label={new Date(teeTime.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} variant="primary" />
              <Chip label={`${players} players`} variant="muted" />
              <Chip label={`${teeTime.holes} holes`} variant="muted" />
            </Row>
            <Divider />
            <Row align="space-between">
              <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.medium, color: p.text }}>Demo total</Text>
              <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.heavy, color: p.primary }}>
                ${totalPrice.toFixed(0)}
              </Text>
            </Row>
          </Card>
          <View style={{ backgroundColor: p.accentBg, borderRadius: radii.md, padding: spacing.md }}>
            <Text style={{ fontSize: fontSizes.small, color: p.accentText, lineHeight: 18 }}>
              ⓘ This is a simulated booking. No payment was processed and no real reservation was created.
            </Text>
          </View>
          <Button label="View upcoming rounds" onPress={() => router.replace("/(tabs)")} />
          <Button label="Find more tee times" variant="secondary" onPress={() => router.back()} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Course hero */}
        <View style={[styles.hero, { backgroundColor: selectedTeeSet?.color ?? p.primary }]}>
          <Chip label="Demo Inventory" variant="accent" />
          <Title style={{ color: "#FFFFFF", marginTop: spacing.sm }}>{course.name}</Title>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: fontSizes.body }}>
            {course.facilityName}
          </Text>
          <Row gap={spacing.xs} style={{ marginTop: spacing.xs }}>
            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: fontSizes.small }}>
              {course.city}, {course.state} {course.zipCode}
            </Text>
          </Row>
        </View>

        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          {/* Tee time info */}
          <Card elevated>
            <SectionHeader title="Tee time" />
            <Row gap={spacing.xl}>
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: fontSizes.display, fontWeight: fontWeights.heavy, color: p.text }}>
                  {new Date(teeTime.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </Text>
                <Text style={{ fontSize: fontSizes.small, color: p.muted }}>
                  {new Date(teeTime.startsAt).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                </Text>
              </View>
            </Row>
            <Row gap={spacing.md} style={{ flexWrap: "wrap" }}>
              <InfoBadge icon="golf-outline" label={`${teeTime.holes} holes`} />
              <InfoBadge icon={teeTime.cartIncluded ? "car-outline" : "walk-outline"} label={teeTime.cartIncluded ? "Cart included" : "Walking"} />
              <InfoBadge icon="people-outline" label={`${teeTime.availableSpots} spot${teeTime.availableSpots !== 1 ? "s" : ""} available`} />
            </Row>
            <Divider />
            <Row align="space-between">
              <Text style={{ fontSize: fontSizes.body, color: p.muted }}>Price per golfer</Text>
              <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.heavy, color: p.text }}>
                ${Math.round(teeTime.priceCents / 100)}
              </Text>
            </Row>
            <Text style={{ fontSize: fontSizes.tiny, color: p.mutedLight }}>{teeTime.cancellationLabel}</Text>
          </Card>

          {/* Course details */}
          <Card elevated>
            <SectionHeader title="Course details" />
            {course.teeSets.map((ts) => (
              <Row key={ts.id} align="space-between" style={{ paddingVertical: spacing.xs }}>
                <Row gap={spacing.sm}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: ts.color }} />
                  <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.medium, color: p.text }}>{ts.name}</Text>
                </Row>
                <Row gap={spacing.lg}>
                  <Text style={{ fontSize: fontSizes.small, color: p.muted }}>{ts.yardage} yds</Text>
                  <Text style={{ fontSize: fontSizes.small, color: p.muted }}>Rating {ts.rating} / Slope {ts.slope}</Text>
                </Row>
              </Row>
            ))}
            <Divider style={{ marginVertical: spacing.xs }} />
            <Row gap={spacing.sm} style={{ flexWrap: "wrap" }}>
              {course.amenities.map((a) => (
                <Chip key={a} label={a} variant="muted" />
              ))}
            </Row>
          </Card>

          {/* Booking panel */}
          <Card elevated>
            <SectionHeader title="Book this tee time" />

            <View style={{ gap: spacing.sm }}>
              <Row align="space-between">
                <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.medium, color: p.text }}>Number of golfers</Text>
                <Row gap={spacing.md}>
                  <Pressable
                    onPress={() => setPlayers((p) => Math.max(1, p - 1))}
                    style={[styles.counter, { borderColor: p.border }]}
                  >
                    <Text style={{ fontSize: fontSizes.heading, color: p.text }}>−</Text>
                  </Pressable>
                  <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, color: p.text, minWidth: 28, textAlign: "center" }}>
                    {players}
                  </Text>
                  <Pressable
                    onPress={() => setPlayers((p) => Math.min(teeTime.availableSpots, p + 1))}
                    style={[styles.counter, { borderColor: p.border, backgroundColor: players >= teeTime.availableSpots ? p.backgroundAlt : undefined }]}
                  >
                    <Text style={{ fontSize: fontSizes.heading, color: players >= teeTime.availableSpots ? p.mutedLight : p.text }}>+</Text>
                  </Pressable>
                </Row>
              </Row>

              <Row align="space-between">
                <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.medium, color: p.text }}>Open to community</Text>
                <Row gap={spacing.md}>
                  <Pressable onPress={() => setCommunitySpots((s) => Math.max(0, s - 1))} style={[styles.counter, { borderColor: p.border }]}>
                    <Text style={{ fontSize: fontSizes.heading, color: p.text }}>−</Text>
                  </Pressable>
                  <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, color: p.text, minWidth: 28, textAlign: "center" }}>
                    {communitySpots}
                  </Text>
                  <Pressable onPress={() => setCommunitySpots((s) => Math.min(players - 1, s + 1))} style={[styles.counter, { borderColor: p.border }]}>
                    <Text style={{ fontSize: fontSizes.heading, color: p.text }}>+</Text>
                  </Pressable>
                </Row>
              </Row>

              <Muted>Share unused spots with nearby Match Play golfers looking for a group.</Muted>
            </View>

            <Divider />

            <Row align="space-between">
              <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.medium, color: p.text }}>Demo total ({players} golfer{players !== 1 ? "s" : ""})</Text>
              <Text style={{ fontSize: fontSizes.title, fontWeight: fontWeights.heavy, color: p.primary }}>${totalPrice.toFixed(0)}</Text>
            </Row>

            <Button label={booking ? "Processing..." : "Request this tee time"} onPress={() => void handleBook()} loading={booking} size="lg" />

            <View style={{ backgroundColor: p.accentBg, borderRadius: radii.md, padding: spacing.md }}>
              <Text style={{ fontSize: fontSizes.tiny, color: p.accentText, lineHeight: 17 }}>
                ⓘ Demo mode: no payment required. Real booking integrations will be added when operator partnerships are established.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoBadge({ icon, label }: { icon: string; label: string }) {
  const p = useTheme();
  return (
    <Row gap={spacing.xs} style={{ paddingVertical: spacing.xs }}>
      <Ionicons name={icon as any} size={15} color={p.muted} />
      <Text style={{ fontSize: fontSizes.small, color: p.muted }}>{label}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  hero: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxxl, gap: spacing.xs },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  counter: { width: 36, height: 36, borderRadius: radii.sm, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
