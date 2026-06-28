import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, radii, shadows, spacing } from "@/design-system/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, focused, label, isCenter }: { name: IoniconsName; focused: boolean; label: string; isCenter?: boolean }) {
  const p = useTheme();
  if (isCenter) {
    return (
      <View style={[styles.centerButton, { backgroundColor: p.primary }]}>
        <Ionicons name={name} size={28} color="#FFFFFF" />
      </View>
    );
  }
  return (
    <View style={styles.tabIcon}>
      <Ionicons name={focused ? name : (name.replace("-outline", "") + "-outline") as IoniconsName} size={24} color={focused ? p.primary : p.mutedLight} />
      <Text style={{ fontSize: fontSizes.micro, fontWeight: focused ? fontWeights.semibold : fontWeights.regular, color: focused ? p.primary : p.mutedLight, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const p = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: p.tabBar, borderTopColor: p.border }],
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="tee-times"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="calendar-outline" focused={focused} label="Tee Times" />,
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="golf" focused={focused} label="Play" isCenter />,
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="trophy-outline" focused={focused} label="Events" />,
        }}
      />
      <Tabs.Screen
        name="leaderboards"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} label="Profile" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 82 : 62,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...shadows.sm,
  },
  tabIcon: {
    alignItems: "center",
    gap: 3,
    paddingTop: 6,
    minWidth: 56,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Platform.OS === "ios" ? 12 : 8,
    ...shadows.md,
  },
});
