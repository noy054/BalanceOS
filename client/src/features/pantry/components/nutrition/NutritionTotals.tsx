import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { NutritionTotals as NutritionTotalsType } from "../../types";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";
import { useStyles, getDirectionStyles } from "./styles/NutritionTotals.styles";

type Props = {
  totals: NutritionTotalsType;
  label?: string;
};

type MacroCell = {
  key: string;
  label: string;
  value: number;
};

export function NutritionTotals({ totals, label }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { showCarbs, showFat, showFiber } = useMacroVisibility();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const macros: MacroCell[] = [
    { key: "protein", label: t("macros.protein"), value: totals.protein },
    ...(showCarbs ? [{ key: "carbs", label: t("macros.carbs"), value: totals.carbs }] : []),
    ...(showFat ? [{ key: "fat", label: t("macros.fat"), value: totals.fat }] : []),
    ...(showFiber && totals.fiber > 0
      ? [{ key: "fiber", label: t("macros.fiber"), value: totals.fiber }]
      : []),
  ];

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, dir.text]}>{label}</Text> : null}

      <View style={[styles.caloriesRow, dir.row]}>
        <Text style={styles.caloriesValue}>{formatCalories(totals.calories)}</Text>
        <Text style={styles.caloriesUnit}>{t("product.calUnit")}</Text>
      </View>

      <View style={[styles.macrosRow, dir.row]}>
        {macros.map((macro) => (
          <View key={macro.key} style={styles.macroCell}>
            <Text style={styles.macroValue} numberOfLines={1}>
              {formatGrams(macro.value)}
              <Text style={styles.macroUnit}> {t("product.gramsUnit")}</Text>
            </Text>
            <Text style={styles.macroLabel} numberOfLines={1}>
              {macro.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
