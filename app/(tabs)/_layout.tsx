import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/design-system/components";
import { fontSizes, fontWeights, spacing } from "@/design-system/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, focused, label }: { name: IoniconsName; focused: boolean; label: string }) {
  return (
    <View style={styles.tabIcon}>
      <Ionicons name={focused ? name : (name.replace("-outline", "") + "-outline") as IoniconsName} size={25} color={focused ? "#BFE8B3" : "rgba(247,243,232,0.72)"} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
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
        tabBarStyle: [styles.tabBar, { backgroundColor: p.header, borderTopColor: "rgba(247,243,232,0.16)" }],
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
          tabBarIcon: ({ focused }) => <TabIcon name="calendar-outline" focused={focused} label="Book" />,
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="golf-outline" focused={focused} label="Play" />,
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
        name="stats"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="upgrade"
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
    height: Platform.OS === "ios" ? 96 : 76,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 12,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minWidth: 62,
  },
  tabLabel: {
    fontSize: fontSizes.tiny,
    fontWeight: fontWeights.medium,
    color: "rgba(247,243,232,0.72)",
  },
  tabLabelActive: {
    color: "#BFE8B3",
    fontWeight: fontWeights.semibold,
  },
});
