import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { macroColor } from "../../../../shared/helpers/macroColors";
import { fonts, radius, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";

type MacroKey = "protein" | "carbs" | "fat" | "fiber";

export type NutritionStripValues = {
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
};

type Props = {
  nutrition: NutritionStripValues | null;
};

export function NutritionStrip({ nutrition }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const { colors } = useAppTheme();
  const visibility = useMacroVisibility();

  const macroKeys: MacroKey[] = [
    "protein",
    ...(visibility.showCarbs ? (["carbs"] as const) : []),
    ...(visibility.showFat ? (["fat"] as const) : []),
    ...(visibility.showFiber ? (["fiber"] as const) : []),
  ];

  return (
    <View style={[styles.nutrition, dir.row, !nutrition && styles.muted]}>
      <View
        style={[styles.calories, dir.alignStart]}
        accessible
        accessibilityLabel={`${nutrition ? formatCalories(nutrition.calories) : "—"} ${t("product.calUnit")}`}
      >
        <Text style={styles.caloriesValue} numberOfLines={1}>
          {nutrition ? formatCalories(nutrition.calories) : "—"}
        </Text>
        <Text style={styles.caloriesUnit}>{t("product.calUnit")}</Text>
      </View>
      <View style={styles.divider} />
      {macroKeys.map((key) => (
        <View
          key={key}
          style={styles.macro}
          accessible
          accessibilityLabel={`${t(`macros.${key}`)} ${nutrition ? formatGrams(nutrition[key]) : "—"}`}
        >
          <Text style={[styles.macroValue, nutrition ? { color: macroColor(key, colors) } : null]} numberOfLines={1}>
            {nutrition ? formatGrams(nutrition[key]) : "—"}
          </Text>
          <Text style={styles.macroLabel} numberOfLines={1}>
            {t(`macros.${key}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      nutrition: {
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.ms,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassCard,
      },
      muted: {
        opacity: 0.55,
      },
      calories: {
        minWidth: 56,
      },
      caloriesValue: {
        ...typography.value,
        fontSize: 20,
        lineHeight: 24,
        color: colors.textPrimary,
      },
      caloriesUnit: {
        ...typography.caption,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      divider: {
        width: StyleSheet.hairlineWidth,
        alignSelf: "stretch",
        backgroundColor: colors.glassBorder,
      },
      macro: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        gap: 1,
      },
      macroValue: {
        ...typography.callout,
        ...typography.number,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      macroLabel: {
        ...typography.caption,
        fontSize: 11,
        fontFamily: fonts.regular,
        color: colors.textMuted,
      },
    }),
  );
