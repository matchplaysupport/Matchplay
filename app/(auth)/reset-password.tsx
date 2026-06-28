import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Button, Field, Muted, Title, useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, spacing } from "@/design-system/theme";

export default function ResetPasswordScreen() {
  const p = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }}>
      <View style={{ padding: spacing.xl, gap: spacing.xl }}>
        <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm }}>
          <Text style={{ color: p.primary, fontSize: fontSizes.body, fontWeight: fontWeights.medium }}>← Back</Text>
        </Pressable>
        <View style={{ gap: spacing.sm }}>
          <Title>Reset password</Title>
          <Body color={p.muted}>Enter your email and we'll send a secure reset link.</Body>
        </View>
        <Field label="Email" autoCapitalize="none" keyboardType="email-address" placeholder="golfer@example.com" returnKeyType="send" />
        <Button label="Send reset link" onPress={() => router.back()} />
        <Muted style={{ textAlign: "center" }}>Reset links expire after 24 hours.</Muted>
      </View>
    </SafeAreaView>
  );
}
