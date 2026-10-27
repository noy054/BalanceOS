import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { formatGrams } from "../../../shared/helpers/formatNumber";
import { StatisticsSummary } from "../types";
import { useStyles as useSectionStyles } from "./styles/SectionCard.styles";
import { useStyles } from "./styles/RangeSummaryCard.styles";

type Props = {
  summary: StatisticsSummary;
  isRTL: boolean;
};

type Tone = "default" | "good" | "attention";

type SummaryItem = {
  key: string;
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
};

function absValue(value: number) {
  return Math.abs(Math.round(value));
}

export function RangeSummaryCard({ summary, isRTL }: Props) {
  const { t } = useTranslation("statistics");
  const sectionStyles = useSectionStyles();
  const styles = useStyles();

  const textAlign = isRTL ? "right" : "left";
  const rowDirection = isRTL ? "row-reverse" : "row";
  const kcal = t("units.kcal");
  const grams = t("units.g");

  const calorieGapValue =
    summary.avgDailyCalorieGap === 0
      ? t("summary.onExactTarget")
      : `${absValue(summary.avgDailyCalorieGap)} ${kcal}`;

  const calorieGapSub =
    summary.avgDailyCalorieGap > 0
      ? t("summary.aboveDailyTarget")
      : summary.avgDailyCalorieGap < 0
        ? t("summary.belowDailyTarget")
        : t("summary.onExactTarget");

  const proteinGapValue =
    summary.proteinGap === 0
      ? t("summary.onExactTarget")
      : `${formatGrams(Math.abs(summary.proteinGap))} ${grams}`;

  const proteinGapSub =
    summary.proteinGap > 0
      ? t("summary.aboveProteinTarget")
      : summary.proteinGap < 0
        ? t("summary.belowProteinTarget")
        : t("summary.onExactTarget");

  const balanceValue =
    summary.calorieBalance === 0
      ? t("summary.onExactTarget")
      : `${absValue(summary.calorieBalance)} ${kcal}`;

  const balanceSub =
    summary.calorieBalance > 0
      ? t("summary.totalSurplus")
      : summary.calorieBalance < 0
        ? t("summary.totalDeficit")
        : t("summary.onExactTarget");

  const accuracyTone: Tone =
    summary.nutritionAccuracy >= 85
      ? "good"
      : summary.nutritionAccuracy < 65
        ? "attention"
        : "default";

  const keyStats: SummaryItem[] = [
    {
      key: "avgProtein",
      label: t("summary.avgProtein"),
      value: `${formatGrams(summary.avgProtein)} ${grams}`,
      sub: t("summary.target", { value: `${summary.targetProtein} ${grams}` }),
    },
    {
      key: "loggedDays",
      label: t("summary.loggedDays"),
      value: `${summary.loggedDays} / ${summary.rangeDays}`,
      sub: t("summary.loggedDaysSub"),
    },
    {
      key: "onTarget",
      label: t("summary.onTarget"),
      value: `${summary.onTargetDays} / ${summary.rangeDays}`,
      sub: t("summary.onTargetSub"),
    },
  ];

  const gapRows: SummaryItem[] = [
    {
      key: "avgDailyGap",
      label: t("summary.avgDailyGap"),
      value: calorieGapValue,
      sub: calorieGapSub,
      tone:
        summary.avgDailyCalorieGap > 0
          ? "attention"
          : summary.avgDailyCalorieGap < 0
            ? "good"
            : "default",
    },
    {
      key: "proteinGap",
      label: t("summary.proteinGap"),
      value: proteinGapValue,
      sub: proteinGapSub,
      tone:
        summary.proteinGap < 0
          ? "attention"
          : summary.proteinGap > 0
            ? "good"
            : "default",
    },
    {
      key: "calorieBalance",
      label: t("summary.calorieBalance"),
      value: balanceValue,
      sub: balanceSub,
      tone:
        summary.calorieBalance > 0
          ? "attention"
          : summary.calorieBalance < 0
            ? "good"
            : "default",
    },
  ];

  function toneStyle(tone?: Tone) {
    if (tone === "good") return styles.valueGood;
    if (tone === "attention") return styles.valueAttention;
    return null;
  }

  return (
    <View style={sectionStyles.card}>
      <Text style={[sectionStyles.cardTitle, { textAlign }]}>
        {t("summary.title")}
      </Text>

      <View style={[styles.heroRow, { flexDirection: rowDirection }]}>
        <View style={styles.heroCell}>
          <Text style={[styles.heroLabel, { textAlign }]} numberOfLines={1}>
            {t("summary.avgCalories")}
          </Text>
          <View style={[styles.heroValueRow, { flexDirection: rowDirection }]}>
            <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>
              {summary.avgCalories}
            </Text>
            <Text style={styles.heroUnit}>{kcal}</Text>
          </View>
          <Text style={[styles.heroSub, { textAlign }]} numberOfLines={1}>
            {t("summary.target", { value: `${summary.targetCalories} ${kcal}` })}
          </Text>
        </View>

        <View style={styles.heroDivider} />

        <View style={styles.heroCell}>
          <Text style={[styles.heroLabel, { textAlign }]} numberOfLines={1}>
            {t("summary.nutritionAccuracy")}
          </Text>
          <Text
            style={[styles.heroValue, toneStyle(accuracyTone), { textAlign }]}
            numberOfLines={1}
          >
            {summary.nutritionAccuracy}%
          </Text>
          <Text style={[styles.heroSub, { textAlign }]} numberOfLines={2}>
            {t("summary.nutritionAccuracySub")}
          </Text>
        </View>
      </View>

      <View style={[styles.statsRow, { flexDirection: rowDirection }]}>
        {keyStats.map((item) => (
          <View key={item.key} style={styles.statCell}>
            <Text style={[styles.statValue, { textAlign }]} numberOfLines={1} adjustsFontSizeToFit>
              {item.value}
            </Text>
            <Text style={[styles.statLabel, { textAlign }]} numberOfLines={1}>
              {item.label}
            </Text>
            {item.sub ? (
              <Text style={[styles.statSub, { textAlign }]} numberOfLines={2}>
                {item.sub}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.gapList}>
        {gapRows.map((item, index) => (
          <View
            key={item.key}
            style={[
              styles.gapRow,
              { flexDirection: rowDirection },
              index > 0 && styles.gapRowBorder,
            ]}
          >
            <View style={styles.gapText}>
              <Text style={[styles.gapLabel, { textAlign }]} numberOfLines={1}>
                {item.label}
              </Text>
              {item.sub ? (
                <Text style={[styles.gapSub, { textAlign }]} numberOfLines={1}>
                  {item.sub}
                </Text>
              ) : null}
            </View>

            <Text style={[styles.gapValue, toneStyle(item.tone)]} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
