import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { HomeHeader } from "../components/HomeHeader";
import { CalorieSummaryCard } from "../components/CalorieSummaryCard";
import { MacroSummaryCard } from "../components/MacroSummaryCard";
import { MealShortcutList } from "../../meals/components/MealShortcutList";
import { useTodayDayLog } from "../hooks/useDayLog";
import { DayLogSummary } from "../types";
import { MealShortcut } from "../../meals/types";
import { styles } from "./styles/HomeDashboardScreen.styles";

const EMPTY_SUMMARY: DayLogSummary = {
  date: "",
  caloriesEaten: 0,
  caloriesTarget: 0,
  macros: [
    { key: "protein", current: 0, target: 0 },
    { key: "carbs", current: 0, target: 0 },
    { key: "fat", current: 0, target: 0 },
    { key: "fiber", current: 0, target: 0 },
  ],
};

export function HomeDashboardScreen() {
  const { i18n } = useTranslation();
  const { data: summary = EMPTY_SUMMARY } = useTodayDayLog();

  function handleMealTypeSelect(type: MealShortcut["type"]) {
    router.push(`/(app)/meal/add-item?mealType=${type}`);
  }

  return (
    <TabScreenLayout activeTab="home">
      <View key={i18n.language} style={styles.root}>
        <View pointerEvents="none" style={styles.backgroundLayer}>
          <View style={styles.glowTop} />
          <View style={styles.glowLeft} />
          <View style={styles.glowBottom} />
        </View>

        <View style={styles.headerWrapper}>
          <HomeHeader />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <CalorieSummaryCard
              eaten={summary.caloriesEaten}
              target={summary.caloriesTarget}
            />
          </View>

          <View style={styles.section}>
            <MacroSummaryCard macros={summary.macros} />
          </View>

          {/* Keeps the shortcuts in the original vertical position after AddMealButton removal */}
          <View style={[styles.actionSection, { minHeight: 58 }]} />

          <View style={styles.shortcutsSection}>
            <MealShortcutList onSelect={handleMealTypeSelect} />
          </View>
        </ScrollView>
      </View>
    </TabScreenLayout>
  );
}
