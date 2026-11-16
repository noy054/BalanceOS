import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { StateView } from "../../../shared/components/ui/StateView";
import { DailySummaryCard } from "../components/DailySummaryCard";
import { MealSectionCard } from "../components/MealSectionCard";
import { MealsSectionHeader } from "../components/MealsSectionHeader";
import { CopyMealModal } from "../components/CopyMealModal";
import { MoveMealOption, MoveMealSheet, MoveTarget } from "../components/MoveMealSheet";
import { showToast } from "../../../shared/helpers/toast";
import { MEAL_SHORTCUTS } from "../../meals/constants/mealShortcuts";
import { DayHeader } from "../components/DayHeader";
import { DayPickerSheet } from "../components/DayPickerSheet";
import { useGreeting } from "../hooks/useGreeting";
import { prefetchDay, useDayLog, useDayMeals, useMoveMealItem } from "../hooks/useDayLog";
import { useSelectedDate } from "../hooks/useSelectedDate";
import { HomeAnnouncements } from "../../announcements/components/HomeAnnouncements";
import { addDays } from "../../../shared/helpers/dateKey";
import { useMealRemoval } from "../hooks/useMealRemoval";
import { DAY_LOG_QUERY_KEYS } from "../constants";
import { CopyTarget, DayLogSummary, MealEntrySummary } from "../types";
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
  const { date, today, maxDate, isToday, setDate, shiftDate, goToToday } = useSelectedDate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const greeting = useGreeting();

  const {
    data: summary = EMPTY_SUMMARY,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    isPlaceholderData: isSummaryStale,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useDayLog(date);
  const {
    data: mealsData,
    isLoading: isMealsLoading,
    isError: isMealsError,
    isPlaceholderData: isMealsStale,
    isFetching: isMealsFetching,
    refetch: refetchMeals,
  } = useDayMeals(date);
  const isSwitchingDay = (isSummaryStale && isSummaryFetching) || (isMealsStale && isMealsFetching);

  useEffect(() => {
    prefetchDay(queryClient, addDays(date, -1));
    prefetchDay(queryClient, addDays(date, 1));
  }, [queryClient, date]);

  useFocusEffect(
    useCallback(() => {
      void queryClient.refetchQueries({ queryKey: DAY_LOG_QUERY_KEYS.day(date), stale: true });
    }, [queryClient, date]),
  );
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
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null);
  const moveItem = useMoveMealItem(date);

  const moveOptions = useMemo<MoveMealOption[]>(() => {
    const options: MoveMealOption[] = MEAL_SHORTCUTS.map((shortcut) => ({
      mealType: shortcut.type,
      label: t(`mealTypes.${shortcut.labelKey}`),
      icon: shortcut.icon as MoveMealOption["icon"],
    }));
    for (const section of sections) {
      if (!options.some((option) => option.mealType === section.mealType)) {
        options.push({ mealType: section.mealType, label: t(`mealTypes.${section.labelKey}`), icon: "food-apple" });
      }
    }
    return options;
  }, [sections, t]);

  function handleMove(target: MoveTarget, option: MoveMealOption) {
    setMoveTarget(null);
    moveItem.mutate(
      { itemId: target.itemId, mealType: option.mealType },
      {
        onSuccess: () => showToast({ message: t("moveMeal.success", { name: target.name, meal: option.label }) }),
        onError: () => showToast({ message: t("moveMeal.failed") }),
      },
    );
  }
  const [mealsExpanded, setMealsExpanded] = useState(true);
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
    <TabScreenLayout activeTab="home" backgroundColor={colors.homeCanvas}>
      <View key={i18n.language} style={styles.root}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
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
            greeting={greeting}
            date={date}
            today={today}
            onPrevious={() => shiftDate(-1)}
            onNext={() => shiftDate(1)}
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
                  isToday={isToday}
                  showPercentages={settings?.showProgressPercentages ?? true}
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
                    date={date}
                    mealType={section.mealType}
                    labelKey={section.labelKey}
                    meal={section.meal}
                    expanded={mealsExpanded}
                    pendingIds={removal.pendingIds}
                    onAdd={handleMealTypeSelect}
                    onCopy={setCopyTarget}
                    onMoveItem={(item, mealType) => setMoveTarget({ itemId: item.id, name: item.name, mealType })}
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

      <MoveMealSheet
        target={moveTarget}
        options={moveOptions}
        onSelect={handleMove}
        onClose={() => setMoveTarget(null)}
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
