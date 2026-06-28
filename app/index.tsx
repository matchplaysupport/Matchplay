import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAppStore } from "@/stores/appStore";

export default function Index() {
  const profile = useAppStore((state) => state.profile);
  const isOnboarded = useAppStore((state) => state.isOnboarded);
  const hasHydrated = useAppStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!profile) return <Redirect href="/(auth)/login" />;
  if (!isOnboarded) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
