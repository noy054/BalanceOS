import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { StatisticsSummary } from "../types";
import { useStyles as useSectionStyles } from "./styles/SectionCard.styles";
import { useStyles } from "./styles/RangeSummaryCard.styles";

type Props = {
  summary: StatisticsSummary;
  isRTL: boolean;
};

type SummaryItem = {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "danger" | "muted";
};

function absValue(value: number) {
  return Math.abs(Math.round(value));
}

function formatMacroValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function RangeSummaryCard({ summary, isRTL }: Props) {
  const { t } = useTranslation("statistics");
  const sectionStyles = useSectionStyles();
  const styles = useStyles();

  const textAlign = isRTL ? "right" : "left";

  const calorieGapValue =
    summary.avgDailyCalorieGap === 0
      ? t("summary.onExactTarget")
      : `${absValue(summary.avgDailyCalorieGap)} kcal`;

  const calorieGapSub =
    summary.avgDailyCalorieGap > 0
      ? t("summary.aboveDailyTarget")
      : summary.avgDailyCalorieGap < 0
        ? t("summary.belowDailyTarget")
        : t("summary.onExactTarget");

  const proteinGapValue =
    summary.proteinGap === 0
      ? t("summary.onExactTarget")
      : `${formatMacroValue(Math.abs(summary.proteinGap))}g`;

  const proteinGapSub =
    summary.proteinGap > 0
      ? t("summary.aboveProteinTarget")
      : summary.proteinGap < 0
        ? t("summary.belowProteinTarget")
        : t("summary.onExactTarget");

  const balanceValue =
    summary.calorieBalance === 0
      ? t("summary.onExactTarget")
      : `${absValue(summary.calorieBalance)} kcal`;

  const balanceSub =
    summary.calorieBalance > 0
      ? t("summary.totalSurplus")
      : summary.calorieBalance < 0
        ? t("summary.totalDeficit")
        : t("summary.onExactTarget");

  const items: SummaryItem[] = [
    {
      label: t("summary.nutritionAccuracy"),
      value: `${summary.nutritionAccuracy}%`,
      sub: t("summary.nutritionAccuracySub"),
      tone:
        summary.nutritionAccuracy >= 85
          ? "good"
          : summary.nutritionAccuracy < 65
            ? "danger"
            : "default",
    },
    {
      label: t("summary.avgCalories"),
      value: `${summary.avgCalories} kcal`,
      sub: t("summary.target", { value: `${summary.targetCalories} kcal` }),
    },
    {
      label: t("summary.avgDailyGap"),
      value: calorieGapValue,
      sub: calorieGapSub,
      tone:
        summary.avgDailyCalorieGap > 0
          ? "danger"
          : summary.avgDailyCalorieGap < 0
            ? "good"
            : "default",
    },
    {
      label: t("summary.avgProtein"),
      value: `${formatMacroValue(summary.avgProtein)}g`,
      sub: t("summary.target", { value: `${summary.targetProtein}g` }),
    },
    {
      label: t("summary.proteinGap"),
      value: proteinGapValue,
      sub: proteinGapSub,
      tone:
        summary.proteinGap < 0
          ? "danger"
          : summary.proteinGap > 0
            ? "good"
            : "default",
    },
    {
      label: t("summary.loggedDays"),
      value: `${summary.loggedDays} / ${summary.rangeDays}`,
      sub: t("summary.loggedDaysSub"),
    },
    {
      label: t("summary.onTarget"),
      value: `${summary.onTargetDays} / ${summary.rangeDays}`,
      sub: t("summary.onTargetSub"),
    },
    {
      label: t("summary.calorieBalance"),
      value: balanceValue,
      sub: balanceSub,
      tone:
        summary.calorieBalance > 0
          ? "danger"
          : summary.calorieBalance < 0
            ? "good"
            : "default",
    },
  ];

  return (
    <View style={sectionStyles.card}>
      <Text style={[sectionStyles.cardTitle, { textAlign }]}>
        {t("summary.title")}
      </Text>

      <View style={styles.grid}>
        {items.map((item) => {
          const valueStyle =
            item.tone === "good"
              ? styles.valueGood
              : item.tone === "danger"
                ? styles.valueDanger
                : item.tone === "muted"
                  ? styles.valueMuted
                  : styles.valueDefault;

          return (
            <View key={item.label} style={styles.item}>
              <Text style={[styles.label, { textAlign }]} numberOfLines={1}>
                {item.label}
              </Text>

              <Text
                style={[styles.value, valueStyle, { textAlign }]}
                numberOfLines={1}
              >
                {item.value}
              </Text>

              {!!item.sub && (
                <Text style={[styles.sub, { textAlign }]} numberOfLines={2}>
                  {item.sub}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
