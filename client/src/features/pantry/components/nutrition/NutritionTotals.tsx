import { Text, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";

import { NutritionTotals as NutritionTotalsType } from "../../types";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { useAppTheme } from "../../../../shared/theme";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";
import { MacroKey, macroColor } from "../../helpers/macroColors";
import { useStyles, getDirectionStyles } from "./styles/NutritionTotals.styles";

type Props = {
  totals: NutritionTotalsType;
  label?: string;
};

type MacroCell = {
  key: MacroKey;
  label: string;
  value: number;
};

export function NutritionTotals({ totals, label }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const { showCarbs, showFat, showFiber } = useMacroVisibility();
  const styles = useStyles();
  const { width } = useWindowDimensions();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const macros: MacroCell[] = [
    { key: "protein", label: t("macros.protein"), value: totals.protein },
    ...(showCarbs ? [{ key: "carbs" as const, label: t("macros.carbs"), value: totals.carbs }] : []),
    ...(showFat ? [{ key: "fat" as const, label: t("macros.fat"), value: totals.fat }] : []),
    ...(showFiber && totals.fiber > 0 ? [{ key: "fiber" as const, label: t("macros.fiber"), value: totals.fiber }] : []),
  ];

  const isCompact = width < 360 && macros.length > 3;

  return (
    <View style={styles.container}>
      <View style={styles.caloriesBlock}>
        {label ? <Text style={[styles.label, dir.text]}>{label}</Text> : null}
        <View style={[styles.caloriesRow, dir.row]}>
          <Text style={styles.caloriesValue}>{formatCalories(totals.calories)}</Text>
          <Text style={styles.caloriesUnit}>{t("product.calUnit")}</Text>
        </View>
      </View>

      <View style={[styles.macrosRow, dir.row, isCompact && styles.macrosGrid]}>
        {macros.map((macro) => {
          const color = macroColor(macro.key, colors);
          return (
            <View
              key={macro.key}
              style={[styles.macroCell, isCompact && styles.macroCellHalf]}
              accessible
              accessibilityLabel={`${macro.label} ${formatGrams(macro.value)} ${t("product.gramsUnit")}`}
            >
              <View style={[styles.macroHead, dir.row]}>
                <View style={[styles.macroDot, { backgroundColor: color }]} />
                <Text style={[styles.macroLabel, dir.text]} numberOfLines={1}>
                  {macro.label}
                </Text>
              </View>
              <Text style={[styles.macroValue, dir.text, { color }]} numberOfLines={1}>
                {formatGrams(macro.value)}
                <Text style={styles.macroUnit}> {t("product.gramsUnit")}</Text>
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
