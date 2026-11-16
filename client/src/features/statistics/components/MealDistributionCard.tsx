import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { formatStat } from "../helpers/nutrients";
import { MealDistributionItem } from "../types";
import { StatCard } from "./StatCard";

type Props = {
  distribution: MealDistributionItem[];
};

const MEAL_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "SNACK_1", "SNACK_2"];

const MEAL_LABEL_KEYS: Record<string, string> = {
  BREAKFAST: "mealTypes.breakfast",
  LUNCH: "mealTypes.lunch",
  DINNER: "mealTypes.dinner",
  SNACK_1: "mealTypes.snack1",
  SNACK_2: "mealTypes.snack2",
};

export function MealDistributionCard({ distribution }: Props) {
  const { t } = useTranslation("statistics");
  const styles = useStyles();
  const dir = useDirection();

  const meals = distribution
    .filter((item) => item.avgCalories > 0)
    .sort((a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType));
  const topPct = Math.max(...meals.map((item) => item.pct), 1);

  return (
    <StatCard title={t("distribution.title")} subtitle={t("distribution.subtitle")}>
      {meals.length === 0 ? (
        <Text style={[styles.empty, dir.text]}>{t("noData")}</Text>
      ) : (
        <View style={styles.list}>
          {meals.map((item) => {
            const label = t((MEAL_LABEL_KEYS[item.mealType] ?? item.mealType) as Parameters<typeof t>[0]);
            const kcal = `${formatStat(item.avgCalories, "kcal")} ${t("units.kcal")}`;
            const top = item.pct === topPct;
            return (
              <View
                key={item.mealType}
                style={styles.row}
                accessible
                accessibilityLabel={`${label}: ${item.pct}%, ${kcal}`}
              >
                <View style={[styles.rowTop, dir.row]}>
                  <Text style={[styles.label, dir.text]} numberOfLines={1}>
                    {label}
                  </Text>
                  <View style={[styles.values, dir.row]}>
                    <Text style={styles.kcal} numberOfLines={1}>
                      {kcal}
                    </Text>
                    <Text style={[styles.pct, top && styles.pctTop]}>{`${item.pct}%`}</Text>
                  </View>
                </View>
                <View style={[styles.track, dir.row]}>
                  <View style={[styles.fill, top && styles.fillTop, { width: `${Math.max(item.pct, 2)}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </StatCard>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      empty: {
        ...typography.callout,
        color: colors.textSecondary,
      },
      list: {
        gap: spacing.md,
      },
      row: {
        gap: spacing.xs + 2,
      },
      rowTop: {
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      label: {
        ...typography.callout,
        flexShrink: 1,
        color: colors.textPrimary,
      },
      values: {
        alignItems: "baseline",
        gap: spacing.sm,
      },
      kcal: {
        ...typography.footnote,
        ...typography.number,
        color: colors.textSecondary,
      },
      pct: {
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.medium,
        minWidth: 40,
        textAlign: "center",
        color: colors.textPrimary,
      },
      pctTop: {
        color: colors.accent,
      },
      track: {
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: colors.glassBorder,
      },
      fill: {
        height: "100%",
        borderRadius: 4,
        backgroundColor: withAlpha(colors.calorieGauge, 0.55),
      },
      fillTop: {
        backgroundColor: colors.calorieGauge,
      },
    }),
  );
