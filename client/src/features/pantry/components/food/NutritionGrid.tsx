import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

import { fonts, spacing, typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";
import { MacroValues } from "./NutritionLine";

type Props = {
  macros: MacroValues;
  calories?: number;
  style?: StyleProp<ViewStyle>;
};

type Cell = {
  key: string;
  label: string;
  value: string | null;
  unit: string;
};

const MIN_COLUMNS = 4;

export function NutritionGrid({ macros, calories, style }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const { showCarbs, showFat, showFiber } = useMacroVisibility();
  const grams = t("product.gramsShort");

  const gramCell = (key: string, value: number | null | undefined): Cell => ({
    key,
    label: t(`macros.${key}` as Parameters<typeof t>[0]),
    value: value == null ? null : formatGrams(value),
    unit: grams,
  });

  const cells: Cell[] = [
    ...(calories != null
      ? [
          {
            key: "calories",
            label: t("macros.calories"),
            value: formatCalories(calories),
            unit: t("product.calUnit"),
          },
        ]
      : []),
    gramCell("protein", macros.protein),
    ...(showCarbs ? [gramCell("carbs", macros.carbs)] : []),
    ...(showFat ? [gramCell("fat", macros.fat)] : []),
    ...(showFiber ? [gramCell("fiber", macros.fiber ?? null)] : []),
  ];
  const spacers = Math.max(0, MIN_COLUMNS - cells.length);

  return (
    <View style={[styles.grid, dir.row, style]}>
      {cells.map((cell) => (
        <View
          key={cell.key}
          style={styles.cell}
          accessible
          accessibilityLabel={`${cell.label} ${cell.value ?? "—"}${cell.value ? ` ${cell.unit}` : ""}`}
        >
          <Text style={[styles.label, dir.text]} numberOfLines={1}>
            {cell.label}
          </Text>
          <Text style={[styles.value, dir.text]} numberOfLines={1}>
            {cell.value ?? "—"}
            {cell.value ? <Text style={styles.unit}> {cell.unit}</Text> : null}
          </Text>
        </View>
      ))}
      {Array.from({ length: spacers }, (_, index) => (
        <View key={`spacer-${index}`} style={styles.cell} />
      ))}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      grid: {
        gap: spacing.ms,
      },
      cell: {
        flex: 1,
        minWidth: 0,
        gap: 2,
      },
      label: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      value: {
        ...typography.body,
        ...typography.number,
        fontFamily: fonts.medium,
        color: colors.textPrimary,
      },
      unit: {
        ...typography.footnote,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
    }),
  );
