import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { fonts, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";
import { MacroValues } from "./NutritionLine";
import { macroColor } from "../../helpers/macroColors";

type Props = {
  calories: number;
  macros: MacroValues;
};

type MainMacro = "protein" | "carbs" | "fat";

export function pickMainMacro(
  macros: MacroValues,
  visible: { showCarbs: boolean; showFat: boolean },
): MainMacro {
  const candidates: MainMacro[] = [
    "protein",
    ...(visible.showCarbs ? (["carbs"] as const) : []),
    ...(visible.showFat ? (["fat"] as const) : []),
  ];

  return candidates.reduce((best, key) =>
    (macros[key] ?? 0) > (macros[best] ?? 0) ? key : best,
  );
}

export function FoodCardValues({ calories, macros }: Props) {
  const { t } = useTranslation("pantry");
  const styles = useStyles();
  const dir = useDirection();
  const visibility = useMacroVisibility();
  const { colors } = useAppTheme();

  const key = pickMainMacro(macros, visibility);
  const value = macros[key];
  const label = t(`macros.${key}`);
  const grams = t("product.gramsShort");
  const calorieUnit = t("product.calUnit");
  const [lineHeight, setLineHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);
  const isWrapped = lineHeight > 0 && rowHeight > lineHeight * 1.5;

  return (
    <View
      style={[styles.row, dir.row]}
      onLayout={(event) => setRowHeight(event.nativeEvent.layout.height)}
    >
      <Text
        onLayout={(event) => setLineHeight(event.nativeEvent.layout.height)}
        style={styles.value}
        numberOfLines={1}
        accessibilityLabel={`${formatCalories(calories)} ${calorieUnit}`}
      >
        {formatCalories(calories)}
        <Text style={styles.unit}> {calorieUnit}</Text>
      </Text>

      {isWrapped ? null : <View style={styles.divider} />}

      <Text
        style={styles.value}
        numberOfLines={1}
        accessibilityLabel={`${label} ${value == null ? "—" : `${formatGrams(value)} ${grams}`}`}
      >
        <Text style={value == null ? null : { color: macroColor(key, colors) }}>
          {value == null ? "—" : formatGrams(value)}
        </Text>
        <Text style={styles.unit}>
          {value == null ? " " : ` ${grams} `}
          {label}
        </Text>
      </Text>
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "center",
        flexWrap: "wrap",
        columnGap: spacing.ms,
        rowGap: spacing.xxs,
      },
      value: {
        ...typography.value,
        color: colors.textPrimary,
      },
      unit: {
        ...typography.callout,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
      },
      divider: {
        width: 1,
        height: 16,
        backgroundColor: colors.borderStrong,
      },
    }),
  );
