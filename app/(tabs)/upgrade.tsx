import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import { useQueryClient } from "@tanstack/react-query";
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
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";

type Plan = "plus" | "pro";
type Billing = "monthly" | "annual";

const PLANS = {
  plus: {
    name: "Clubhouse+",
    tagline: "Your whole golf app — book, score, and track every round.",
    monthly: { label: "$9.99/mo", priceKey: "plus-monthly" as const },
    annual: { label: "$99.99/yr", priceKey: "plus-annual" as const, savings: "Save $20" },
    features: [
      "Book tee times",
      "Scoring & round tracking",
      "Handicap tracking",
      "Personal stats & history",
      "Local leaderboards",
      "Player discovery",
      "Messaging",
    ],
    founding: false,
  },
  pro: {
    name: "Clubhouse Pro",
    tagline: "For competitors and organizers who live on the leaderboard.",
    monthly: { label: "$19.99/mo", priceKey: "pro-monthly" as const },
    annual: { label: "$199.99/yr", priceKey: "pro-annual" as const, savings: "Save $40" },
    features: [
      "Everything in Clubhouse+",
      "State & national leaderboards",
      "Ranked match challenges",
      "Create & host tournaments",
      "Scramble organizer tools",
      "Private groups",
      "Advanced analytics",
      "GHIN sync",
    ],
    founding: true,
  },
} as const;

type PriceKey = "plus-monthly" | "plus-annual" | "pro-monthly" | "pro-annual";

export default function UpgradeScreen() {
  const p = useTheme();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const queryClient = useQueryClient();

  const [plan, setPlan] = useState<Plan>("pro");
  const [billing, setBilling] = useState<Billing>("monthly");
  const [loading, setLoading] = useState(false);

  const selected = PLANS[plan];
  const option = billing === "monthly" ? selected.monthly : selected.annual;
  const isFoundingPrice = billing === "monthly" && plan === "pro";

  const handleSubscribe = async () => {
    if (!env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      Alert.alert("Not available", "Payments are not configured in this build.");
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData.session?.access_token;
      if (!jwt) {
        Alert.alert("Sign in required", "Please sign in to subscribe.");
        return;
      }

      const res = await fetch(`${env.EXPO_PUBLIC_API_URL}/api/stripe/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ priceKey: option.priceKey, founding: isFoundingPrice }),
      });
      const json = await res.json() as { clientSecret?: string; error?: string };

      if (!json.clientSecret) {
        Alert.alert("Error", json.error ?? "Could not start subscription.");
        return;
      }

      const { error: initErr } = await initPaymentSheet({
        merchantDisplayName: "The Clubhouse",
        paymentIntentClientSecret: json.clientSecret,
      });
      if (initErr) throw new Error(initErr.message);

      const { error: payErr } = await presentPaymentSheet();
      if (payErr) {
        if (payErr.code !== "Canceled") {
          Alert.alert("Payment failed", payErr.message);
        }
        return;
      }

      // Invalidate entitlement so the app reflects the new tier immediately
      await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
      Alert.alert(
        "Welcome to " + selected.name + "!",
        "Your subscription is active. Enjoy the full Clubhouse experience.",
        [{ text: "Let's go", onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: p.primaryDark }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
          </Pressable>
          <Title style={{ color: "#FFFFFF", textAlign: "center" }}>Upgrade your game</Title>
          <Body style={{ color: "rgba(255,255,255,0.75)", textAlign: "center" }}>
            Join thousands of golfers on The Clubhouse
          </Body>
        </View>

        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          {/* Plan toggle */}
          <View>
            <SectionHeader title="Choose your plan" />
            <Row gap={spacing.sm}>
              {(["plus", "pro"] as Plan[]).map((key) => (
                <Pressable
                  key={key}
                  onPress={() => setPlan(key)}
                  style={[
                    styles.planTab,
                    { borderColor: plan === key ? p.primary : p.border, flex: 1 },
                    plan === key && { backgroundColor: p.primaryLight ?? p.successLight },
                  ]}
                >
                  {key === "pro" && (
                    <Chip label="Most popular" variant="accent" size="xs" />
                  )}
                  <Text style={{ fontWeight: fontWeights.bold, fontSize: fontSizes.body, color: plan === key ? p.primary : p.text }}>
                    {PLANS[key].name}
                  </Text>
                </Pressable>
              ))}
            </Row>
          </View>

          {/* Billing toggle */}
          <View>
            <SectionHeader title="Billing" />
            <Row gap={spacing.sm}>
              {(["monthly", "annual"] as Billing[]).map((key) => {
                const opt = key === "monthly" ? selected.monthly : selected.annual;
                const savings = key === "annual" && "savings" in opt ? opt.savings : null;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setBilling(key)}
                    style={[
                      styles.billingTab,
                      { borderColor: billing === key ? p.primary : p.border, flex: 1 },
                      billing === key && { backgroundColor: p.primaryLight ?? p.successLight },
                    ]}
                  >
                    <Text style={{ fontWeight: fontWeights.bold, color: billing === key ? p.primary : p.text }}>
                      {opt.label}
                    </Text>
                    {savings && (
                      <Text style={{ fontSize: fontSizes.tiny, color: p.primary }}>{savings}</Text>
                    )}
                  </Pressable>
                );
              })}
            </Row>
            {isFoundingPrice && (
              <View style={[styles.foundingBadge, { backgroundColor: p.accentBg }]}>
                <Ionicons name="star" size={13} color={p.accentText} />
                <Text style={{ fontSize: fontSizes.tiny, color: p.accentText, flex: 1, lineHeight: 17 }}>
                  Founding member rate — locked for life while spots remain (first 1,000 golfers)
                </Text>
              </View>
            )}
          </View>

          {/* Features */}
          <Card elevated>
            <Subheading>{selected.name}</Subheading>
            <Muted>{selected.tagline}</Muted>
            <Divider />
            <View style={{ gap: spacing.sm }}>
              {selected.features.map((f) => (
                <Row key={f} gap={spacing.sm}>
                  <Ionicons name="checkmark-circle" size={18} color={p.primary} />
                  <Text style={{ fontSize: fontSizes.body, color: p.text, flex: 1 }}>{f}</Text>
                </Row>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.cta, { backgroundColor: p.background, borderTopColor: p.border }]}>
        <Button
          label={loading ? "Processing..." : `Subscribe — ${option.label}`}
          onPress={() => void handleSubscribe()}
          loading={loading}
          size="lg"
        />
        <Muted style={{ textAlign: "center" }}>
          Cancel anytime · Billed by Stripe · Secure
        </Muted>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.xl, paddingTop: spacing.lg, alignItems: "center", gap: spacing.sm },
  backBtn: { alignSelf: "flex-start", marginBottom: spacing.sm },
  planTab: { borderWidth: 2, borderRadius: radii.md, padding: spacing.md, alignItems: "center", gap: spacing.xs },
  billingTab: { borderWidth: 2, borderRadius: radii.md, padding: spacing.md, alignItems: "center", gap: 2 },
  foundingBadge: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, padding: spacing.sm, borderRadius: radii.sm, marginTop: spacing.sm },
  cta: { position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm, borderTopWidth: 1 },
});
