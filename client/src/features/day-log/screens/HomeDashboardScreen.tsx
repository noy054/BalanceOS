import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { HomeHeader } from "../components/HomeHeader";
import { CalorieSummaryCard } from "../components/CalorieSummaryCard";
import { MacroSummaryCard } from "../components/MacroSummaryCard";
import { AddMealButton } from "../../meals/components/AddMealButton";
import { MealShortcutList } from "../../meals/components/MealShortcutList";
import { BottomTabBar } from "../../../shared/components/BottomTabBar";
import { mockDayLogSummary } from "../constants/mockDashboard";
import { styles } from "./styles/HomeDashboardScreen.styles";

// TODO: Replace mockDayLogSummary with a useDayLog() hook that calls the API
const data = mockDayLogSummary;

export function HomeDashboardScreen() {
  const { i18n } = useTranslation();

  return (
    <SafeAreaView
      key={i18n.language}
      style={styles.root}
      edges={["top"]}
    >
      <HomeHeader onSettingsPress={() => router.push('/(app)/settings')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CalorieSummaryCard
          eaten={data.caloriesEaten}
          target={data.caloriesTarget}
        />

        <View style={styles.sectionGap} />

        <MacroSummaryCard macros={data.macros} />

        <View style={styles.sectionGap} />

        <AddMealButton
          onPress={() => {
            // TODO: navigate to add-meal screen
          }}
        />

        <View style={styles.shortcutGap} />

        <MealShortcutList
          onSelect={(_type) => {
            // TODO: navigate to add-meal screen with pre-selected meal type
          }}
        />
      </ScrollView>

      <BottomTabBar activeTab="home" />
    </SafeAreaView>
  );
}
