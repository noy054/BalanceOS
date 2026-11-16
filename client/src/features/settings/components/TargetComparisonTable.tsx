import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../shared/hooks/useDirection";
import { fonts, radius, spacing, typography, useThemedStyles } from "../../../shared/theme";
import { withAlpha } from "../../../shared/helpers/progressColor";
import { formatCalories } from "../../../shared/helpers/formatNumber";
import { getLocale } from "../../../shared/i18n";
import { useNutritionDisplay } from "./NutritionDisplayProvider";
import { TargetSuggestion, TargetValues } from "../types";

type Props = {
  suggestion: TargetSuggestion;
  goalIsCutting: boolean;
};

type Row = { key: keyof TargetValues; label: string; unit: string };

const COLUMN_WIDTH = 84;

export function TargetComparisonTable({ suggestion, goalIsCutting }: Props) {
  const { t, i18n } = useTranslation("settings");
  const styles = useStyles();
  const dir = useDirection();
  const visibility = useNutritionDisplay();
  const suggested = suggestion.suggested;
  if (!suggested) return null;

  const grams = t("targetSuggestion.gramsUnit");
  const rows: Row[] = [
    { key: "calories", label: t("nutritionTargets.caloriesLabel"), unit: t("targetSuggestion.kcalUnit") },
    { key: "protein", label: t("nutritionTargets.proteinLabel"), unit: grams },
    ...(visibility.showCarbs ? [{ key: "carbs" as const, label: t("nutritionTargets.carbsLabel"), unit: grams }] : []),
    ...(visibility.showFat ? [{ key: "fat" as const, label: t("nutritionTargets.fatLabel"), unit: grams }] : []),
    ...(visibility.showFiber ? [{ key: "fiber" as const, label: t("nutritionTargets.fiberLabel"), unit: grams }] : []),
  ];

  const format = (key: keyof TargetValues, value: number) =>
    key === "calories" ? formatCalories(value) : String(value);

  const weight = suggestion.weight;
  const formatDate = (date: string | null) =>
    date ? new Date(`${date}T12:00:00`).toLocaleDateString(getLocale(i18n.language), { day: "numeric", month: "short" }) : "";
  const basis = weight
    ? weight.basis === "average"
      ? t("targetSuggestion.basisAverage", {
          count: weight.count,
          weight: weight.value,
          from: formatDate(weight.from),
          to: formatDate(weight.to),
        })
      : weight.basis === "latest"
        ? t("targetSuggestion.basisLatest", { weight: weight.value })
        : t("targetSuggestion.basisProfile", { weight: weight.value })
    : null;

  return (
    <View style={styles.root}>
      {basis ? <Text style={[styles.basis, dir.text]}>{basis}</Text> : null}

      <View style={styles.table}>
        <View style={[styles.row, styles.headRow, dir.row]}>
          <Text style={[styles.headCell, styles.nameCell, dir.text]}>{t("targetSuggestion.nutrient")}</Text>
          <Text style={[styles.headCell, styles.valueCell]}>{t("targetSuggestion.current")}</Text>
          <Text style={[styles.headCell, styles.valueCell, styles.suggestedHead]}>{t("targetSuggestion.suggested")}</Text>
        </View>
        {rows.map((row, index) => {
          const current = suggestion.current?.[row.key] ?? null;
          const next = suggested[row.key];
          const changed = current !== next;
          return (
            <View
              key={row.key}
              style={[styles.row, index > 0 && styles.divider, dir.row]}
              accessible
              accessibilityLabel={`${row.label}: ${t("targetSuggestion.current")} ${
                current !== null ? `${format(row.key, current)} ${row.unit}` : t("targetSuggestion.notSet")
              }, ${t("targetSuggestion.suggested")} ${format(row.key, next)} ${row.unit}`}
            >
              <Text style={[styles.name, styles.nameCell, dir.text]} numberOfLines={1}>
                {row.label}
              </Text>
              <Text style={[styles.value, styles.valueCell]} numberOfLines={1}>
                {current !== null ? format(row.key, current) : t("targetSuggestion.notSet")}
              </Text>
              <View style={[styles.valueCell, styles.suggestedCell, changed && styles.suggestedChanged]}>
                <Text style={[styles.value, styles.suggestedValue]} numberOfLines={1}>
                  {format(row.key, next)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={[styles.method, dir.text]}>
        {t("targetSuggestion.method", {
          bmr: formatCalories(suggested.bmr),
          factor: suggested.activityFactor,
          tdee: formatCalories(suggested.tdee),
          protein: goalIsCutting ? 2.2 : 2,
        })}
      </Text>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      root: {
        gap: spacing.ms,
      },
      basis: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      table: {
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
        paddingHorizontal: spacing.md,
      },
      row: {
        alignItems: "center",
        minHeight: 46,
        gap: spacing.sm,
      },
      headRow: {
        minHeight: 38,
      },
      divider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
      },
      headCell: {
        ...typography.caption,
        fontFamily: fonts.medium,
        color: colors.textMuted,
      },
      suggestedHead: {
        color: colors.accent,
      },
      nameCell: {
        flex: 1,
        minWidth: 0,
      },
      valueCell: {
        width: COLUMN_WIDTH,
        textAlign: "center",
        alignItems: "center",
      },
      name: {
        ...typography.callout,
        color: colors.textPrimary,
      },
      value: {
        ...typography.callout,
        ...typography.number,
        textAlign: "center",
        color: colors.textSecondary,
      },
      suggestedCell: {
        paddingVertical: 4,
        borderRadius: radius.sm,
      },
      suggestedChanged: {
        backgroundColor: withAlpha(colors.calorieGauge, 0.12),
      },
      suggestedValue: {
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      method: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },
    }),
  );
