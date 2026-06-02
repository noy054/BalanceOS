import { View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { colors, spacing } from "../theme";
import { styles } from "./styles/BottomTabBar.styles";

type TabId = "home" | "pantry" | "add" | "statistics" | "profile";

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
  },
  {
    id: "statistics",
    labelKey: "statistics",
    icon: "chart-bar-stacked",
    activeIcon: "chart-bar-stacked",
  },
  {
    id: "profile",
    labelKey: "profile",
    icon: "account-outline",
    activeIcon: "account",
    route: "/(app)/profile",
  },
];

type Props = {
  activeTab?: TabId;
  onTabPress?: (tab: TabId) => void;
};

export function BottomTabBar({ activeTab = "home", onTabPress }: Props) {
  const { t, i18n } = useTranslation("dashboard");
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const insets = useSafeAreaInsets();

  function handlePress(tab: TabItem) {
    onTabPress?.(tab.id);

    if (tab.route) {
      router.push(tab.route as Parameters<typeof router.push>[0]);
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: isRTL ? "row-reverse" : "row",
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const isAdd = tab.id === "add";

        if (isAdd) {
          return (
            <Pressable
              key={tab.id}
              style={({ pressed }) => [
                styles.tabItem,
                styles.addTabItem,
                pressed && styles.tabPressed,
              ]}
              onPress={() => handlePress(tab)}
              hitSlop={10}
            >
              <View style={styles.addCircle}>
                <MaterialCommunityIcons
                  name="plus"
                  size={28}
                  color={colors.background}
                />
              </View>

              <Text style={styles.tabLabel}>{t(`nav.${tab.labelKey}`)}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.tabItem,
              pressed && styles.tabPressed,
            ]}
            onPress={() => handlePress(tab)}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? colors.primaryGreen : colors.textMuted}
            />

            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {t(`nav.${tab.labelKey}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
