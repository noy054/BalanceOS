import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { TabScreenLayout } from "../../../shared/components/TabScreenLayout";
import { useAppTheme } from "../../../shared/theme";
import { STAT_RANGES } from "../constants";
import { useStatistics } from "../hooks/useStatistics";
import { StatRange } from "../types";
import { CaloriesTrendCard } from "../components/CaloriesTrendCard";
import { FoodInsightsCard } from "../components/FoodInsightsCard";
import { MacroAccuracyCard } from "../components/MacroAccuracyCard";
import { MealDistributionCard } from "../components/MealDistributionCard";
import { RangeSummaryCard } from "../components/RangeSummaryCard";
import { getRangeStyles, useStyles } from "./styles/StatisticsScreen.styles";

const TAB_BAR_CLEARANCE = 100;

export function StatisticsScreen() {
  const { t, i18n } = useTranslation("statistics");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getRangeStyles(isRTL);

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

  return (
    <TabScreenLayout activeTab="statistics">
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={[styles.title, dir.text]}>{t("title")}</Text>
          <Text style={[styles.subtitle, dir.text]}>{t("subtitle")}</Text>

          <View style={[styles.rangeRow, isRTL && dir.row]}>
            {STAT_RANGES.map((item) => {
              const isActive = item === range;

              return (
                <Pressable
                  key={item}
                  style={[styles.rangeChip, isActive && styles.rangeChipActive]}
                  onPress={() => setRange(item)}
                >
                  <Text
                    style={[
                      styles.rangeChipText,
                      isActive && styles.rangeChipTextActive,
                    ]}
                  >
                    {t(`ranges.${item}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {shouldShowLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primaryGreen} />
          </View>
        ) : isError ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{t("errors.loadFailed")}</Text>
          </View>
        ) : hasNoData ? (
          <View style={styles.centered}>
            <Text style={[styles.emptyTitle, dir.text]}>
              {t("empty.title")}
            </Text>
            <Text style={[styles.emptyText, dir.text]}>
              {t("empty.subtitle")}
            </Text>
          </View>
        ) : data ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <RangeSummaryCard summary={data.summary} isRTL={isRTL} />

            <MacroAccuracyCard
              accuracy={data.macroAccuracy}
              isRTL={isRTL}
              loggedDays={data.summary.loggedDays}
              rangeDays={data.summary.rangeDays}
            />

            <CaloriesTrendCard trend={data.dailyTrend} isRTL={isRTL} />

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
        ) : (
          <View style={styles.centered}>
            <Text style={[styles.emptyTitle, dir.text]}>
              {t("empty.title")}
            </Text>
            <Text style={[styles.emptyText, dir.text]}>
              {t("empty.subtitle")}
            </Text>
          </View>
        )}
      </View>
    </TabScreenLayout>
  );
}
