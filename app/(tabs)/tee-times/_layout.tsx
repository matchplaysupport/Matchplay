import { Stack } from "expo-router";
import { useTheme } from "@/design-system/components";
import { fontWeights } from "@/design-system/theme";

export default function TeeTimesLayout() {
  const p = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: p.surface },
        headerTintColor: p.primary,
        headerTitleStyle: { fontWeight: fontWeights.bold, color: p.text },
        headerShadowVisible: false,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Tee Times", headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{ title: "Tee Time Details", headerShown: true, presentation: "card" }}
      />
    </Stack>
  );
}
