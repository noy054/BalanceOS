import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { HomeHeader } from "../components/HomeHeader";
import { CalorieSummaryCard } from "../components/CalorieSummaryCard";
import { MacroSummaryCard } from "../components/MacroSummaryCard";
import { MealLogCard } from "../components/MealLogCard";
import { CopyMealModal } from "../components/CopyMealModal";
import { MealShortcutList } from "../../meals/components/MealShortcutList";
import { useTodayDayLog, useTodayMeals } from "../hooks/useDayLog";
import { DayLogSummary, MealEntrySummary } from "../types";
import { useNutritionSettings } from "../../settings/hooks/useSettings";
import { useStyles } from "./styles/HomeDashboardScreen.styles";

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

// Tab bar height + wrapper offset — gives content room to scroll clear of the pill.
const TAB_BAR_CLEARANCE = 100;

export function HomeDashboardScreen() {
  const { i18n } = useTranslation();
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  const { data: summary = EMPTY_SUMMARY } = useTodayDayLog();
  const { data: mealsData } = useTodayMeals();
  const { data: settings } = useNutritionSettings();

  const meals = mealsData?.meals ?? [];

  const visibleMacros = useMemo(() => {
    return summary.macros.filter((macro) => {
      if (macro.key === "protein") {
        return true;
      }

      if (macro.key === "carbs") {
        return settings?.showCarbsOnHome ?? true;
      }

      if (macro.key === "fat") {
        return settings?.showFatOnHome ?? true;
      }

      if (macro.key === "fiber") {
        return settings?.showFiberOnHome ?? true;
      }

      return true;
    });
  }, [
    summary.macros,
    settings?.showCarbsOnHome,
    settings?.showFatOnHome,
    settings?.showFiberOnHome,
  ]);

  const [copyingMeal, setCopyingMeal] = useState<MealEntrySummary | null>(null);

  function handleMealTypeSelect(type: string) {
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
          ]}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <View style={styles.heroSection}>
            <CalorieSummaryCard
              eaten={summary.caloriesEaten}
              target={summary.caloriesTarget}
            />
          </View>

          {visibleMacros.length > 0 && (
            <View style={styles.section}>
              <MacroSummaryCard
                macros={visibleMacros}
                showProgressPercentages={
                  settings?.showProgressPercentages ?? true
                }
              />
            </View>
          )}

          <View style={styles.shortcutsSection}>
            <MealShortcutList onSelect={handleMealTypeSelect} />
          </View>

          {meals.length > 0 && (
            <View style={styles.mealsSection}>
              {meals.map((meal) => (
                <MealLogCard
                  key={meal.id}
                  meal={meal}
                  isRTL={i18n.dir(i18n.language) === "rtl"}
                  onPress={handleMealTypeSelect}
                  onCopy={setCopyingMeal}
                />
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <CopyMealModal
        meal={copyingMeal}
        onClose={() => setCopyingMeal(null)}
      />
    </TabScreenLayout>
  );
}
