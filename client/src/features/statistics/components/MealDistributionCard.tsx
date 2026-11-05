import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, spacing, typography, useAppTheme, useThemedStyles } from "../../../shared/theme";
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
  const { colors } = useAppTheme();

  const mealColors: Record<string, string> = {
    BREAKFAST: colors.accentFill,
    LUNCH: colors.success,
    DINNER: colors.textSecondary,
    SNACK_1: colors.textMuted,
    SNACK_2: colors.borderStrong,
  };

  const meals = distribution
    .filter((item) => item.avgCalories > 0)
    .sort((a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType));

  return (
    <StatCard title={t("distribution.title")} subtitle={t("distribution.subtitle")}>
      {meals.length === 0 ? (
        <Text style={[styles.empty, dir.text]}>{t("noData")}</Text>
      ) : (
        <>
          <View style={[styles.bar, dir.row]}>
            {meals.map((item) => (
              <View
                key={item.mealType}
                style={[
                  styles.segment,
                  { flexGrow: Math.max(item.pct, 1), backgroundColor: mealColors[item.mealType] },
                ]}
              />
            ))}
          </View>

          <View style={[styles.legend, dir.row]}>
            {meals.map((item) => {
              const label = t((MEAL_LABEL_KEYS[item.mealType] ?? item.mealType) as Parameters<typeof t>[0]);
              return (
                <View
                  key={item.mealType}
                  style={styles.legendItem}
                  accessible
                  accessibilityLabel={`${label} ${item.pct}%, ${formatStat(item.avgCalories, "kcal")} ${t("units.kcal")}`}
                >
                  <View style={[styles.legendTop, dir.row]}>
                    <View style={[styles.dot, { backgroundColor: mealColors[item.mealType] }]} />
                    <Text style={styles.pct}>{`${item.pct}%`}</Text>
                  </View>
                  <Text style={styles.label} numberOfLines={1}>
                    {label}
                  </Text>
                  <Text style={styles.kcal} numberOfLines={1}>
                    {`${formatStat(item.avgCalories, "kcal")} ${t("units.kcal")}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
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
      bar: {
        height: 12,
        gap: 3,
        borderRadius: 6,
        overflow: "hidden",
      },
      segment: {
        flexBasis: 0,
        borderRadius: 3,
      },
      legend: {
        flexWrap: "wrap",
        rowGap: spacing.ms,
      },
      legendItem: {
        flexBasis: "33.33%",
        flexGrow: 1,
        alignItems: "center",
        gap: 2,
      },
      legendTop: {
        alignItems: "center",
        gap: spacing.xs,
      },
      dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
      },
      pct: {
        ...typography.value,
        fontFamily: fonts.bold,
        fontSize: 17,
        color: colors.textPrimary,
      },
      label: {
        ...typography.caption,
        color: colors.textSecondary,
      },
      kcal: {
        ...typography.caption,
        ...typography.number,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },
    }),
  );
