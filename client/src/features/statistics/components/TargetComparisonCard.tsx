import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { formatStat, NutrientMeta } from "../helpers/nutrients";
import { MacroStat, NutrientKey, StatisticsSummary } from "../types";
import { StatCard } from "./StatCard";

type Props = {
  nutrients: NutrientMeta[];
  accuracy: Record<NutrientKey, MacroStat>;
  summary: StatisticsSummary;
};

function signed(value: number, unit: "kcal" | "g") {
  if (value === 0) return "0";
  const text = formatStat(Math.abs(value), unit);
  return value > 0 ? `+${text}` : `−${text}`;
}

export function TargetComparisonCard({ nutrients, accuracy, summary }: Props) {
  const { t } = useTranslation("statistics");
  const styles = useStyles();
  const dir = useDirection();
  const kcal = t("units.kcal");
  const grams = t("units.g");

  const gaps = [
    {
      key: "dailyGap",
      label: t("summary.avgDailyGap"),
      sub: t("summary.avgDailyGapSub"),
      value: signed(summary.avgDailyCalorieGap, "kcal"),
      unit: kcal,
    },
    {
      key: "proteinGap",
      label: t("summary.proteinGap"),
      sub: t("comparison.proteinGapSub"),
      value: signed(summary.proteinGap, "g"),
      unit: grams,
    },
    {
      key: "balance",
      label: t("summary.calorieBalance"),
      sub: t("summary.balanceSub"),
      value: signed(summary.calorieBalance, "kcal"),
      unit: kcal,
    },
  ];

  return (
    <StatCard title={t("comparison.title")} subtitle={t("comparison.subtitle")}>
      <View>
        <View style={[styles.row, styles.headRow, dir.row]}>
          <Text style={[styles.headCell, styles.nameCell, dir.text]}>{t("comparison.nutrient")}</Text>
          <Text style={[styles.headCell, styles.numCell]}>{t("comparison.average")}</Text>
          <Text style={[styles.headCell, styles.numCell]}>{t("comparison.target")}</Text>
          <Text style={[styles.headCell, styles.numCell]}>{t("comparison.difference")}</Text>
        </View>

        {nutrients.map((nutrient) => {
          const stat = accuracy[nutrient.key];
          const unit = t(`units.${nutrient.unit}`);
          const name = t(`macros.${nutrient.key}`);
          return (
            <View
              key={nutrient.key}
              style={[styles.row, styles.divider, dir.row]}
              accessible
              accessibilityLabel={`${name}: ${t("comparison.average")} ${formatStat(stat.avg, nutrient.unit)} ${unit}, ${t("comparison.target")} ${formatStat(stat.target, nutrient.unit)} ${unit}`}
            >
              <View style={[styles.nameCell, styles.nameWrap, dir.row]}>
                <MaterialCommunityIcons name={nutrient.icon} size={16} color={nutrient.color} />
                <Text style={[styles.name, dir.text]} numberOfLines={1}>
                  {name}
                </Text>
              </View>
              <Text style={[styles.num, styles.numCell, styles.numStrong]}>
                {formatStat(stat.avg, nutrient.unit)}
              </Text>
              <Text style={[styles.num, styles.numCell]}>
                {stat.target > 0 ? formatStat(stat.target, nutrient.unit) : "—"}
              </Text>
              <Text style={[styles.num, styles.numCell]}>
                {stat.target > 0 ? signed(stat.avg - stat.target, nutrient.unit) : "—"}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.gaps}>
        {gaps.map((gap) => (
          <View
            key={gap.key}
            style={[styles.gapRow, dir.row]}
            accessible
            accessibilityLabel={`${gap.label}: ${gap.value} ${gap.unit}. ${gap.sub}`}
          >
            <View style={styles.gapText}>
              <Text style={[styles.gapLabel, dir.text]}>{gap.label}</Text>
              <Text style={[styles.gapSub, dir.text]}>{gap.sub}</Text>
            </View>
            <View style={[styles.gapAmount, dir.row]}>
              <Text style={styles.gapValue}>{gap.value}</Text>
              <Text style={styles.gapUnit}>{gap.unit}</Text>
            </View>
          </View>
        ))}
      </View>
    </StatCard>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        minHeight: 40,
        gap: spacing.xs,
      },
      headRow: {
        minHeight: 28,
      },
      divider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
      },
      headCell: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },
      nameCell: {
        flex: 1.4,
        minWidth: 0,
      },
      nameWrap: {
        alignItems: "center",
        gap: spacing.xs + 2,
      },
      numCell: {
        flex: 1,
        textAlign: "center",
      },
      name: {
        ...typography.callout,
        flexShrink: 1,
        color: colors.textPrimary,
      },
      num: {
        writingDirection: "ltr",
        ...typography.callout,
        ...typography.number,
        color: colors.textSecondary,
      },
      numStrong: {
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },
      gaps: {
        gap: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
      },
      gapRow: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      gapText: {
        flex: 1,
        minWidth: 0,
      },
      gapLabel: {
        ...typography.callout,
        color: colors.textPrimary,
      },
      gapSub: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },
      gapAmount: {
        alignItems: "baseline",
        gap: spacing.xs,
      },
      gapUnit: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      gapValue: {
        writingDirection: "ltr",
        ...typography.value,
        fontSize: 16,
        color: colors.textPrimary,
      },
    }),
  );
