import { Redirect } from "expo-router";
import { useAppStore } from "@/stores/appStore";

export default function Index() {
  const profile = useAppStore((state) => state.profile);
  const isOnboarded = useAppStore((state) => state.isOnboarded);
  if (!profile) {
    return <Redirect href="/(auth)/login" />;
  }
  if (!isOnboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }
  return <Redirect href="/(tabs)" />;
}
