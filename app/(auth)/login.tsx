import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Button, Field, Muted, useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { useAppStore } from "@/stores/appStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("demo@matchplay.test");
  const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in");
  const signIn = useAppStore((state) => state.signIn);
  const p = useTheme();

  const handleContinue = () => {
    signIn(email);
    router.replace("/(auth)/onboarding");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.primary }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>⛳</Text>
            </View>
            <Text style={[styles.brandName, { color: "#FFFFFF" }]}>Match Play</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: fontSizes.body, textAlign: "center", lineHeight: 22 }}>
              Find golfers. Book tee times. Track every round.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: p.surface }]}>
            <View style={[styles.modeToggle, { backgroundColor: p.backgroundAlt, borderRadius: radii.md }]}>
              {(["sign_in", "sign_up"] as const).map((m) => (
                <Pressable
                  key={m}
                  style={[styles.modeBtn, mode === m && { backgroundColor: p.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 }]}
                  onPress={() => setMode(m)}
                >
                  <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: mode === m ? p.text : p.muted }}>
                    {m === "sign_in" ? "Sign in" : "Create account"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ gap: spacing.md }}>
              <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" returnKeyType="next" placeholder="golfer@example.com" />
              <Field label="Password" secureTextEntry placeholder={mode === "sign_in" ? "Your password" : "Choose a password"} returnKeyType="done" onSubmitEditing={handleContinue} />

              {mode === "sign_up" && (
                <Body color={p.muted} style={{ fontSize: fontSizes.tiny, lineHeight: 17 }}>
                  By creating an account you agree to the Terms of Service and Privacy Policy.
                </Body>
              )}

              <Button label={mode === "sign_in" ? "Sign in" : "Create account"} onPress={handleContinue} size="lg" />

              {mode === "sign_in" && (
                <Pressable onPress={() => router.push("/(auth)/reset-password")} style={{ alignItems: "center", paddingVertical: spacing.xs }}>
                  <Text style={{ color: p.primary, fontSize: fontSizes.small, fontWeight: fontWeights.medium }}>Forgot password?</Text>
                </Pressable>
              )}
            </View>

            <View style={[styles.divider, { borderColor: p.border }]}>
              <Text style={{ marginTop: -10, paddingHorizontal: spacing.md, fontSize: fontSizes.tiny, fontWeight: fontWeights.medium, color: p.mutedLight, backgroundColor: p.surface }}>
                or continue with
              </Text>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Button label="Continue with Apple" variant="secondary" onPress={handleContinue} />
              <Button label="Continue with Google" variant="secondary" onPress={handleContinue} />
            </View>

            <Muted style={{ textAlign: "center" }}>Demo: demo@matchplay.test · any password</Muted>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingTop: spacing.xxl, paddingBottom: spacing.xxl, paddingHorizontal: spacing.xl, gap: spacing.sm },
  logoMark: { width: 72, height: 72, borderRadius: radii.xl, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: spacing.xs },
  logoText: { fontSize: 36 },
  brandName: { fontSize: fontSizes.display, fontWeight: fontWeights.heavy, letterSpacing: -0.5 },
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.xxl, borderRadius: radii.xl, padding: spacing.xl, gap: spacing.lg, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 10 },
  modeToggle: { flexDirection: "row", padding: 4 },
  modeBtn: { flex: 1, paddingVertical: spacing.sm + 2, alignItems: "center", borderRadius: radii.sm + 2 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, alignItems: "center", marginVertical: spacing.xs },
});
