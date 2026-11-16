import { useCallback, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, ScrollView, View } from "react-native";
import type { ScrollViewInstance } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { TabHeader } from "../../../shared/components/TabHeader";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { StateView } from "../../../shared/components/ui/StateView";
import { useAppTheme } from "../../../shared/theme";
import { useMacroVisibility } from "../../pantry/hooks/useMacroVisibility";
import { ProgressEntryCard } from "../../progress/components/ProgressEntryCard";
import { STAT_RANGES } from "../constants";
import { useStatistics } from "../hooks/useStatistics";
import { enabledNutrients } from "../helpers/nutrients";
import { buildInsights } from "../helpers/insights";
import { NutrientKey, StatRange } from "../types";
import { SummaryCard } from "../components/SummaryCard";
import { CalorieBarsCard } from "../components/CalorieBarsCard";
import { MealDistributionCard } from "../components/MealDistributionCard";
import { NutrientProgressCard } from "../components/NutrientProgressCard";
import { NutrientTrendCard } from "../components/NutrientTrendCard";
import { FoodRankingCard, useFoodRankingRows } from "../components/FoodRankingCard";
import { TargetComparisonCard } from "../components/TargetComparisonCard";
import { InsightsCard } from "../components/InsightsCard";
import { StatsPeriodNavigator } from "../components/StatsPeriodNavigator";
import { router } from "expo-router";
import { useHasProAccess } from "../../billing/hooks/useBilling";
import { isSubscriptionRequired } from "../../billing/helpers/billingErrors";
import { BILLING_ROUTE } from "../../billing/constants";
import { useStyles } from "./styles/StatisticsScreen.styles";
import { track } from "../../analytics/analytics";

export function StatisticsScreen() {
  const { t } = useTranslation("statistics");
  const styles = useStyles();
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const visibility = useMacroVisibility();
  const rankingRows = useFoodRankingRows();

  const [range, setRange] = useState<StatRange>("7D");
  const [nutrientKey, setNutrientKey] = useState<NutrientKey>("calories");
  const [weekOffset, setWeekOffset] = useState(0);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const trendY = useRef(0);

  const handleTrendLayout = useCallback((event: LayoutChangeEvent) => {
    trendY.current = event.nativeEvent.layout.y;
  }, []);

  const showNutrientTrend = useCallback((key: NutrientKey) => {
    setNutrientKey(key);
    scrollRef.current?.scrollTo({ y: Math.max(0, trendY.current - 12), animated: true });
  }, []);

  const { t: tBilling } = useTranslation("billing");
  const access = useHasProAccess();
  const { data, isLoading, isError, error, refetch, window, today } = useStatistics(
    range,
    weekOffset,
    access.hasProAccess,
  );
  const needsPro = (!access.isLoading && !access.hasProAccess) || isSubscriptionRequired(error);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      track("statistics_viewed");
    }, [queryClient]),
  );

  const nutrients = useMemo(() => enabledNutrients(visibility, colors), [visibility, colors]);
  const selectedNutrient = nutrients.some((item) => item.key === nutrientKey)
    ? nutrientKey
    : "calories";
  const insights = useMemo(() => (data ? buildInsights(data) : []), [data]);
  const hasNoData = Boolean(data) && data?.summary.loggedDays === 0;
  const showStats = !needsPro && Boolean(data) && !hasNoData;

  const rangeOptions = STAT_RANGES.map((item) => ({ value: item, label: t(`ranges.${item}`) }));

  return (
    <TabScreenLayout activeTab="statistics" backgroundColor={colors.canvas}>
      <View style={styles.root}>
        <TabHeader title={t("title")} subtitle={t("subtitle")} />

        <View style={styles.rangeWrap}>
          <SegmentedControl
            options={rangeOptions}
            value={range}
            onChange={setRange}
            pill
            style={styles.rangeTrack}
          />
          <StatsPeriodNavigator
            start={window.start}
            end={window.end}
            today={today}
            weekOffset={range === "7D" ? weekOffset : null}
            onPrevious={() => setWeekOffset((value) => value - 1)}
            onNext={() => setWeekOffset((value) => Math.min(0, value + 1))}
          />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {needsPro ? (
            <StateView
              variant="empty"
              compact
              icon="star-four-points-outline"
              title={tBilling("paywall.title")}
              message={tBilling("paywall.message")}
              actionLabel={tBilling("paywall.action")}
              onAction={() => router.push(BILLING_ROUTE)}
            />
          ) : (access.isLoading || isLoading) && !data ? (
            <StateView variant="loading" compact />
          ) : isError && !data ? (
            <StateView
              variant="error"
              compact
              message={t("errors.loadFailed")}
              actionLabel={t("errors.retry")}
              onAction={() => void refetch()}
            />
          ) : hasNoData || !data ? (
            <StateView
              variant="empty"
              compact
              icon="chart-bar"
              title={t("empty.title")}
              message={t("empty.subtitle")}
            />
          ) : (
            <>
              <SummaryCard summary={data.summary} />
              <CalorieBarsCard trend={data.dailyTrend} />
              <NutrientProgressCard
                nutrients={nutrients}
                accuracy={data.macroAccuracy}
                loggedDays={data.summary.loggedDays}
                rangeDays={data.summary.rangeDays}
                selected={selectedNutrient}
                onSelect={showNutrientTrend}
              />
              <View onLayout={handleTrendLayout}>
                <NutrientTrendCard
                  trend={data.dailyTrend}
                  nutrients={nutrients}
                  selected={selectedNutrient}
                  onSelect={setNutrientKey}
                />
              </View>
              <FoodRankingCard
                title={t("foodInsights.topCalories")}
                subtitle={t("foodInsights.topCaloriesSub")}
                rows={rankingRows.byCalories(data.topCalorieSources)}
              />
              <FoodRankingCard
                title={t("foodInsights.mostUsed")}
                subtitle={t("foodInsights.mostUsedSub")}
                rows={rankingRows.byFrequency(data.mostUsedFoods)}
              />
              <TargetComparisonCard
                nutrients={nutrients}
                accuracy={data.macroAccuracy}
                summary={data.summary}
              />
              {insights.length > 0 ? <InsightsCard insights={insights} /> : null}
            </>
          )}

          {showStats && data ? <MealDistributionCard distribution={data.mealDistribution} /> : null}
          <ProgressEntryCard />

        </ScrollView>
      </View>
    </TabScreenLayout>
  );
}
