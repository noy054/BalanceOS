import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { StateView } from "../../../shared/components/ui/StateView";
import { DailySummaryCard } from "../components/DailySummaryCard";
import { MealSectionCard } from "../components/MealSectionCard";
import { MealsSectionHeader } from "../components/MealsSectionHeader";
import { CopyMealModal } from "../components/CopyMealModal";
import { MealItemSheet } from "../components/MealItemSheet";
import { MEAL_SHORTCUTS } from "../../meals/constants/mealShortcuts";
import { DayHeader } from "../components/DayHeader";
import { DayPickerSheet } from "../components/DayPickerSheet";
import { prefetchDay, useDayLog, useDayMeals } from "../hooks/useDayLog";
import { useSelectedDate } from "../hooks/useSelectedDate";
import { HomeAnnouncements } from "../../announcements/components/HomeAnnouncements";
import { addDays } from "../../../shared/helpers/dateKey";
import { useMealRemoval } from "../hooks/useMealRemoval";
import { CopyTarget, DayLogSummary, MealEntrySummary, MealItemSummary } from "../types";
import { useNutritionSettings } from "../../settings/hooks/useSettings";
import { useAppTheme } from "../../../shared/theme";
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

type MealSection = {
  key: string;
  mealType: string;
  labelKey: string;
  meal: MealEntrySummary | null;
};

export function HomeDashboardScreen() {
  const { t, i18n } = useTranslation("dashboard");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const { date, today, maxDate, isToday, setDate, goToToday } = useSelectedDate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    data: summary = EMPTY_SUMMARY,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    isPlaceholderData: isSummaryStale,
    refetch: refetchSummary,
  } = useDayLog(date);
  const {
    data: mealsData,
    isLoading: isMealsLoading,
    isError: isMealsError,
    isPlaceholderData: isMealsStale,
    refetch: refetchMeals,
  } = useDayMeals(date);
  const isSwitchingDay = isSummaryStale || isMealsStale;

  useEffect(() => {
    prefetchDay(queryClient, addDays(date, -1));
    prefetchDay(queryClient, addDays(date, 1));
  }, [queryClient, date]);
  const { data: settings } = useNutritionSettings();

  const meals = useMemo(() => mealsData?.meals ?? [], [mealsData]);

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

  const sections = useMemo<MealSection[]>(() => {
    const usedIds = new Set<string>();

    const base = MEAL_SHORTCUTS.map((shortcut) => {
      const meal = meals.find((m) => m.mealType === shortcut.type) ?? null;
      if (meal) usedIds.add(meal.id);

      return {
        key: shortcut.type,
        mealType: shortcut.type,
        labelKey: shortcut.labelKey,
        meal,
      };
    });

    const extras = meals
      .filter((meal) => !usedIds.has(meal.id))
      .map((meal) => ({
        key: meal.id,
        mealType: meal.mealType,
        labelKey: meal.mealType === "SNACK_2" ? "snack2" : "snack",
        meal,
      }));

    return [...base, ...extras];
  }, [meals]);

  const [copyTarget, setCopyTarget] = useState<CopyTarget | null>(null);
  const [mealsExpanded, setMealsExpanded] = useState(true);
  const [editing, setEditing] = useState<{ item: MealItemSummary; mealLabel: string } | null>(
    null,
  );
  const removal = useMealRemoval(date);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchSummary(), refetchMeals()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchSummary, refetchMeals]);

  function handleMealTypeSelect(type: string) {
    router.push(`/(app)/meal/add-item?mealType=${type}&date=${date}`);
  }

  return (
    <TabScreenLayout activeTab="home">
      <View key={i18n.language} style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.textMuted}
              colors={[colors.accent]}
              progressBackgroundColor={colors.surface}
            />
          }
        >
          <DayHeader
            date={date}
            today={today}
            onPrevious={() => setDate(addDays(date, -1))}
            onNext={() => setDate(addDays(date, 1))}
            canGoNext={date < maxDate}
            onToday={goToToday}
            onOpenCalendar={() => setIsCalendarOpen(true)}
          />

          <View
            style={[styles.content, isSwitchingDay && styles.bodySwitching]}
            pointerEvents={isSwitchingDay ? "none" : "auto"}
          >
            <View style={styles.body}>
              <HomeAnnouncements />

              {isSummaryLoading ? (
                <StateView variant="loading" compact />
              ) : isSummaryError ? (
                <StateView
                  variant="error"
                  compact
                  message={t("errors.loadFailed")}
                  actionLabel={t("errors.retry")}
                  onAction={() => refetchSummary()}
                />
              ) : (
                <DailySummaryCard
                  eaten={summary.caloriesEaten}
                  target={summary.caloriesTarget}
                  macros={visibleMacros}
                  showPercentages={settings?.showProgressPercentages ?? true}
                  isToday={isToday}
                />
              )}
            </View>

            <View style={styles.meals}>
              <MealsSectionHeader
                expanded={mealsExpanded}
                canToggle={sections.some((section) => (section.meal?.items.length ?? 0) > 0)}
                onToggle={() => setMealsExpanded((value) => !value)}
              />

              {isMealsLoading ? (
                <StateView variant="loading" compact />
              ) : isMealsError ? (
                <StateView
                  variant="error"
                  compact
                  message={t("errors.mealsLoadFailed")}
                  actionLabel={t("errors.retry")}
                  onAction={() => refetchMeals()}
                />
              ) : (
                sections.map((section) => (
                  <MealSectionCard
                    key={section.key}
                    mealType={section.mealType}
                    labelKey={section.labelKey}
                    meal={section.meal}
                    expanded={mealsExpanded}
                    pendingIds={removal.pendingIds}
                    onAdd={handleMealTypeSelect}
                    onCopy={setCopyTarget}
                    onEditItem={(item, mealLabel) => setEditing({ item, mealLabel })}
                    onRemoveItem={(item, mealLabel) => void removal.removeItem(item, mealLabel)}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      <CopyMealModal
        target={copyTarget}
        sourceDate={date}
        onClose={() => setCopyTarget(null)}
      />

      <MealItemSheet
        date={date}
        item={editing?.item ?? null}
        mealLabel={editing?.mealLabel ?? ""}
        onClose={() => setEditing(null)}
        onRemove={removal.removeItem}
      />

      <DayPickerSheet
        visible={isCalendarOpen}
        date={date}
        today={today}
        maxDate={maxDate}
        onSelect={setDate}
        onClose={() => setIsCalendarOpen(false)}
      />
    </TabScreenLayout>
  );
}
