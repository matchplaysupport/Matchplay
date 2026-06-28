import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Button, Field, Muted, Title, useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, spacing } from "@/design-system/theme";
import { sendPasswordReset } from "@/lib/auth";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const p = useTheme();

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.background }}>
      <View style={{ padding: spacing.xl, gap: spacing.xl }}>
        <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm }}>
          <Text style={{ color: p.primary, fontSize: fontSizes.body, fontWeight: fontWeights.medium }}>← Back</Text>
        </Pressable>
        <View style={{ gap: spacing.sm }}>
          <Title>Reset password</Title>
          <Body color={p.muted}>
            {sent
              ? "Check your email for a reset link. It expires in 24 hours."
              : "Enter your email and we'll send a secure reset link."}
          </Body>
        </View>
        {!sent && (
          <>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="golfer@example.com"
              returnKeyType="send"
              onSubmitEditing={() => void handleSend()}
            />
            <Button
              label={loading ? "Sending…" : "Send reset link"}
              onPress={() => void handleSend()}
            />
          </>
        )}
        {sent && (
          <Button label="Back to sign in" variant="secondary" onPress={() => router.back()} />
        )}
        {!sent && <Muted style={{ textAlign: "center" }}>Reset links expire after 24 hours.</Muted>}
      </View>
    </SafeAreaView>
  );
}
