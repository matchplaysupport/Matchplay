import { Stack } from "expo-router";
import { useTheme } from "@/design-system/components";
import { fontWeights } from "@/design-system/theme";

export default function PlayLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="scoring"
        options={{ title: "Scoring", headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="discovery"
        options={{ title: "Find Golfers", headerShown: true, presentation: "card" }}
      />
      <Stack.Screen
        name="course-search"
        options={{ title: "Select Course", headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="hole-map"
        options={{ title: "Hole Map", headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="scorecard"
        options={{ title: "Scorecard", headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}
