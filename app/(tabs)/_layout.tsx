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
      <View style={[styles.centerButton, { backgroundColor: focused ? p.primaryDark : p.primary }]}>
        <Ionicons name={name} size={27} color="#FFFFFF" />
      </View>
    );
  }
  return (
    <View style={[styles.tabIcon, focused && { backgroundColor: p.successLight }]}>
      <Ionicons name={focused ? name : (name.replace("-outline", "") + "-outline") as IoniconsName} size={22} color={focused ? p.primary : p.mutedLight} />
      <Text style={{ fontSize: fontSizes.micro, fontWeight: focused ? fontWeights.semibold : fontWeights.medium, color: focused ? p.primary : p.mutedLight, marginTop: 2 }}>
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
        tabBarStyle: [styles.tabBar, { backgroundColor: p.tabBar, borderTopColor: "rgba(0,0,0,0.06)" }],
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
    height: Platform.OS === "ios" ? 86 : 68,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...shadows.sm,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    minWidth: 56,
  },
  centerButton: {
    width: 62,
    height: 62,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Platform.OS === "ios" ? 14 : 10,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...shadows.md,
  },
});
