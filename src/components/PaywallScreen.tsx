import { View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Body, Button, Card, Subheading, useTheme } from "@/design-system/components";
import { spacing } from "@/design-system/theme";
import type { Entitlement } from "@/integrations/payments/SubscriptionProvider";

interface Props {
  requiredTier: Exclude<Entitlement, "free">;
  title: string;
  description: string;
}

const TIER_LABELS: Record<Exclude<Entitlement, "free">, string> = {
  plus: "Match Play+",
  pro: "Match Play Pro",
};

export function PaywallScreen({ requiredTier, title, description }: Props) {
  const p = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }} edges={["top"]}>
      <View style={{ flex: 1, justifyContent: "center", padding: spacing.xl }}>
        <Card elevated style={{ alignItems: "center", gap: spacing.lg, padding: spacing.xl }}>
          <Ionicons name="lock-closed-outline" size={48} color={p.mutedLight} />
          <View style={{ alignItems: "center", gap: spacing.sm }}>
            <Subheading style={{ textAlign: "center" }}>{title}</Subheading>
            <Body color={p.muted} style={{ textAlign: "center", lineHeight: 22 }}>
              {description}
            </Body>
          </View>
          <Button
            label={`Upgrade to ${TIER_LABELS[requiredTier]}`}
            onPress={() => router.push("/(tabs)/upgrade")}
            size="lg"
          />
          <Button
            label="Maybe later"
            variant="ghost"
            onPress={() => router.back()}
            size="sm"
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}
