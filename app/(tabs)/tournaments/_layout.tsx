import { Stack } from "expo-router";

export default function TournamentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" options={{ presentation: "modal" }} />
      <Stack.Screen name="create-scramble" options={{ presentation: "modal" }} />
      <Stack.Screen name="scramble-detail" />
      <Stack.Screen name="detail" />
    </Stack>
  );
}
