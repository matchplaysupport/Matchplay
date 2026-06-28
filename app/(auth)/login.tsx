import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Button, Field, Muted, useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, radii, spacing } from "@/design-system/theme";
import { env } from "@/lib/env";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { useAppStore } from "@/stores/appStore";

export default function LoginScreen() {
  const [email, setEmail] = useState(env.EXPO_PUBLIC_USE_MOCK_AUTH ? "demo@matchplay.test" : "");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [loading, setLoading] = useState(false);
  const signIn = useAppStore((state) => state.signIn);
  const p = useTheme();

  const handleContinue = async () => {
    if (env.EXPO_PUBLIC_USE_MOCK_AUTH) {
      signIn(email);
      router.replace("/(tabs)");
      return;
    }

    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "sign_in") {
        await signInWithEmail(email, password);
        // AuthListener in _layout.tsx handles the session and redirects
      } else {
        await signUpWithEmail(email, password);
        // New user — send them through onboarding; AuthListener sets authUserId
        router.replace("/(auth)/onboarding");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
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
                  style={[
                    styles.modeBtn,
                    mode === m && {
                      backgroundColor: p.surface,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 3,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setMode(m)}
                >
                  <Text
                    style={{
                      fontSize: fontSizes.small,
                      fontWeight: fontWeights.semibold,
                      color: mode === m ? p.text : p.muted,
                    }}
                  >
                    {m === "sign_in" ? "Sign in" : "Create account"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ gap: spacing.md }}>
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                placeholder="golfer@example.com"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={mode === "sign_in" ? "Your password" : "Choose a password (min. 6 chars)"}
                returnKeyType="done"
                onSubmitEditing={() => void handleContinue()}
              />

              {mode === "sign_up" && (
                <Body color={p.muted} style={{ fontSize: fontSizes.tiny, lineHeight: 17 }}>
                  By creating an account you agree to the Terms of Service and Privacy Policy.
                </Body>
              )}

              <Button
                label={loading ? "Please wait…" : mode === "sign_in" ? "Sign in" : "Create account"}
                onPress={() => void handleContinue()}
                size="lg"
              />

              {mode === "sign_in" && (
                <Pressable
                  onPress={() => router.push("/(auth)/reset-password")}
                  style={{ alignItems: "center", paddingVertical: spacing.xs }}
                >
                  <Text style={{ color: p.primary, fontSize: fontSizes.small, fontWeight: fontWeights.medium }}>
                    Forgot password?
                  </Text>
                </Pressable>
              )}
            </View>

            {env.EXPO_PUBLIC_USE_MOCK_AUTH && (
              <Muted style={{ textAlign: "center" }}>Demo mode · any password works</Muted>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  logoText: { fontSize: 36 },
  brandName: { fontSize: fontSizes.display, fontWeight: fontWeights.heavy, letterSpacing: -0.5 },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  modeToggle: { flexDirection: "row", padding: 4 },
  modeBtn: { flex: 1, paddingVertical: spacing.sm + 2, alignItems: "center", borderRadius: radii.sm + 2 },
});
