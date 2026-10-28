import { StyleProp, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

import { spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";
import { MacroValues } from "./NutritionLine";

type MacroKey = "protein" | "carbs" | "fat" | "fiber";

type Cell = {
  key: string;
  value: string;
  label: string;
  spoken: string;
};

type Props = {
  calories: number;
  macros: MacroValues;
  style?: StyleProp<ViewStyle>;
};

export function NutritionStrip({ calories, macros, style }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const { showCarbs, showFat, showFiber } = useMacroVisibility();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const gramsUnit = t("strip.gramsUnit");

  const macroCell = (key: MacroKey, value: number | null | undefined): Cell => ({
    key,
    value: value != null ? formatGrams(value) : "—",
    label: isCompact ? t(`strip.${key}Short`) : t(`macros.${key}`),
    spoken: `${t(`macros.${key}`)} ${value != null ? `${formatGrams(value)} ${gramsUnit}` : "—"}`,
  });

  const caloriesText = formatCalories(calories);
  const cells: Cell[] = [
    macroCell("protein", macros.protein),
    ...(showCarbs ? [macroCell("carbs", macros.carbs)] : []),
    ...(showFat ? [macroCell("fat", macros.fat)] : []),
    ...(showFiber ? [macroCell("fiber", macros.fiber)] : []),
  ];

  const accessibilityLabel = [
    `${t("macros.calories")} ${caloriesText}`,
    ...cells.map((cell) => cell.spoken),
  ].join(", ");

  return (
    <View style={[styles.row, dir.row, style]} accessible accessibilityLabel={accessibilityLabel}>
      <View style={[styles.cell, styles.caloriesCell, dir.alignStart]}>
        <Text style={styles.caloriesValue} numberOfLines={1}>
          {caloriesText}
        </Text>
        <Text style={[styles.label, dir.text]} numberOfLines={1}>
          {t("product.calUnit")}
        </Text>
      </View>

      {cells.map((cell) => (
        <View key={cell.key} style={[styles.cell, dir.alignStart]}>
          <Text style={styles.value} numberOfLines={1}>
            {cell.value}
          </Text>
          <Text style={[styles.label, dir.text]} numberOfLines={1}>
            {cell.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "flex-end",
        gap: spacing.sm,
      },
      cell: {
        flex: 1,
        minWidth: 0,
        gap: 1,
      },
      caloriesCell: {
        flex: 1.15,
      },
      caloriesValue: {
        ...typography.headline,
        ...typography.number,
        fontWeight: "700",
        color: colors.textPrimary,
      },
      value: {
        ...typography.callout,
        ...typography.number,
        fontWeight: "600",
        color: colors.textPrimary,
      },
      label: {
        ...typography.caption,
        fontWeight: "400",
        color: colors.textMuted,
      },
    }),
  );
