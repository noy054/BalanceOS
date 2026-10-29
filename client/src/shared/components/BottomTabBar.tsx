import { View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { useAppTheme, spacing } from "../theme";
import { useDirection } from "../hooks/useDirection";
import { useStyles } from "./styles/BottomTabBar.styles";

type TabId = "home" | "pantry" | "add" | "statistics" | "settings";

type TabItem = {
  id: TabId;
  labelKey: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  activeIcon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  route?: string;
};

const TABS: TabItem[] = [
  {
    id: "home",
    labelKey: "home",
    icon: "home-outline",
    activeIcon: "home",
    route: "/(app)/dashboard",
  },
  {
    id: "pantry",
    labelKey: "pantry",
    icon: "package-variant-closed",
    activeIcon: "package-variant",
    route: "/(app)/pantry",
  },
  {
    id: "add",
    labelKey: "add",
    icon: "plus",
    activeIcon: "plus",
    route: "/(app)/meal/add-item",
  },
  {
    id: "statistics",
    labelKey: "statistics",
    icon: "chart-bar",
    activeIcon: "chart-bar",
    route: "/(app)/statistics",
  },
  {
    id: "settings",
    labelKey: "settings",
    icon: "cog-outline",
    activeIcon: "cog",
    route: "/(app)/settings",
  },
];

type Props = {
  activeTab?: TabId;
  onTabPress?: (tab: TabId) => void;
};

export function BottomTabBar({ activeTab = "home", onTabPress }: Props) {
  const { t } = useTranslation("dashboard");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const insets = useSafeAreaInsets();

  function handlePress(tab: TabItem) {
    onTabPress?.(tab.id);

    if (tab.route) {
      router.navigate(tab.route as Parameters<typeof router.navigate>[0]);
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={[styles.bar, dir.row]} accessibilityRole="tablist">
        <View pointerEvents="none" style={styles.barHighlight} />
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const label = t(`nav.${tab.labelKey}`);

          if (tab.id === "add") {
            return (
              <View key={tab.id} style={styles.addSlot}>
                <View pointerEvents="none" style={styles.addHalo} />
                <Pressable
                  onPress={() => handlePress(tab)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                >
                  <MaterialCommunityIcons name="plus" size={30} color={colors.onAccent} />
                </Pressable>
              </View>
            );
          }

          return (
            <Pressable
              key={tab.id}
              style={({ pressed }) => [styles.tabItem, pressed && styles.tabPressed]}
              onPress={() => handlePress(tab)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <MaterialCommunityIcons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? colors.accent : colors.textMuted}
                />
              </View>

              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
