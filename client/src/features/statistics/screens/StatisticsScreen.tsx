import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { TabHeader } from "../../../shared/components/TabHeader";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import { StateView } from "../../../shared/components/ui/StateView";
import { STAT_RANGES } from "../constants";
import { useStatistics } from "../hooks/useStatistics";
import { StatRange } from "../types";
import { CaloriesTrendCard } from "../components/CaloriesTrendCard";
import { FoodInsightsCard } from "../components/FoodInsightsCard";
import { MacroAccuracyCard } from "../components/MacroAccuracyCard";
import { MealDistributionCard } from "../components/MealDistributionCard";
import { RangeSummaryCard } from "../components/RangeSummaryCard";
import { useStyles } from "./styles/StatisticsScreen.styles";

export function StatisticsScreen() {
  const { t, i18n } = useTranslation("statistics");
  const styles = useStyles();
  const queryClient = useQueryClient();

  const isRTL = i18n.dir(i18n.language) === "rtl";

  const [range, setRange] = useState<StatRange>("7D");

  const { data, isLoading, isFetching, isError, isSuccess } =
    useStatistics(range);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["statistics"],
      });
    }, [queryClient]),
  );

  const shouldShowLoading = isLoading || isFetching;
  const hasNoData = isSuccess && !!data && data.summary.loggedDays === 0;

  const rangeOptions = STAT_RANGES.map((item) => ({
    value: item,
    label: t(`ranges.${item}`),
  }));

  return (
    <TabScreenLayout activeTab="statistics">
      <View style={styles.root}>
        <TabHeader title={t("title")} subtitle={t("subtitle")} />

        <View style={styles.rangeWrap}>
          <SegmentedControl options={rangeOptions} value={range} onChange={setRange} />
        </View>

        {shouldShowLoading ? (
          <StateView variant="loading" />
        ) : isError ? (
          <StateView variant="error" message={t("errors.loadFailed")} />
        ) : hasNoData || !data ? (
          <StateView
            variant="empty"
            icon="chart-bar"
            title={t("empty.title")}
            message={t("empty.subtitle")}
          />
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <RangeSummaryCard summary={data.summary} isRTL={isRTL} />

            <CaloriesTrendCard trend={data.dailyTrend} isRTL={isRTL} />

            <MacroAccuracyCard
              accuracy={data.macroAccuracy}
              isRTL={isRTL}
              loggedDays={data.summary.loggedDays}
              rangeDays={data.summary.rangeDays}
            />

            <MealDistributionCard
              distribution={data.mealDistribution}
              isRTL={isRTL}
            />

            <FoodInsightsCard
              topCalorieSources={data.topCalorieSources}
              mostUsedFoods={data.mostUsedFoods}
              isRTL={isRTL}
            />
          </ScrollView>
        )}
      </View>
    </TabScreenLayout>
  );
}
