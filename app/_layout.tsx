import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/design-system/components";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";
import { fetchProfile } from "@/lib/auth";
import { useAppStore } from "@/stores/appStore";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function AuthListener() {
  const setAuthSession = useAppStore((s) => s.setAuthSession);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    if (env.EXPO_PUBLIC_USE_MOCK_AUTH) return;

    // Hydrate on mount
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (user) {
        const profile = await fetchProfile(user.id);
        setAuthSession(user.id, profile);
      }
    });

    // Listen to future auth changes (skip token refreshes — profile hasn't changed)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        logout();
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        const user = session.user;
        const profile = await fetchProfile(user.id);
        setAuthSession(user.id, profile);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [setAuthSession, logout]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthListener />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
