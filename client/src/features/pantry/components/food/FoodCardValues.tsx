import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { fonts, spacing, typography, useAppTheme, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";
import { MacroValues } from "./NutritionLine";
import { macroColor } from "../../../../shared/helpers/macroColors";

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

  return candidates.reduce((best, key) => ((macros[key] ?? 0) > (macros[best] ?? 0) ? key : best));
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
  const fiber = key === "carbs" && visibility.showFiber ? (macros.fiber ?? null) : null;
  const fiberLabel = t("macros.fiber");

  return (
    <View
      style={[styles.row, dir.row]}
      accessible
      accessibilityLabel={`${formatCalories(calories)} ${calorieUnit}, ${label} ${
        value == null ? "—" : `${formatGrams(value)} ${grams}`
      }${fiber != null ? `, ${fiberLabel} ${formatGrams(fiber)} ${grams}` : ""}`}
    >
      <Text style={styles.stat} numberOfLines={1}>
        <Text style={styles.value}>{formatCalories(calories)}</Text>
        {` ${calorieUnit}`}
      </Text>
      <Text style={styles.separator}>·</Text>
      <Text style={styles.stat} numberOfLines={1}>
        <Text style={[styles.value, value == null ? null : { color: macroColor(key, colors) }]}>
          {value == null ? "—" : formatGrams(value)}
        </Text>
        {value == null ? ` ${label}` : ` ${grams} ${label}`}
      </Text>
      {fiber != null ? (
        <>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.stat} numberOfLines={1}>
            <Text style={[styles.value, { color: macroColor("fiber", colors) }]}>{formatGrams(fiber)}</Text>
            {` ${grams} ${fiberLabel}`}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      row: {
        alignItems: "baseline",
        flexWrap: "wrap",
        columnGap: spacing.xs + 2,
      },
      stat: {
        ...typography.footnote,
        color: colors.textSecondary,
      },
      value: {
        ...typography.value,
        fontSize: 15,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
      },
      separator: {
        ...typography.footnote,
        color: colors.textMuted,
      },
    }),
  );
