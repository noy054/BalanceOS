import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { NutritionTotals as NutritionTotalsType } from "../../types";
import { useNutritionSettings } from "../../../settings/hooks/useSettings";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/NutritionSummaryPanel.styles";

type Props = {
  totals: NutritionTotalsType;
};

type MacroCell = {
  key: string;
  label: string;
  value: number;
};

function formatNumber(value: number) {
  return Math.round(value || 0);
}

export function NutritionSummaryPanel({ totals }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { data: settings } = useNutritionSettings();
  const styles = useStyles();

  const isRTL = i18n.dir(i18n.language) === "rtl";
  const dir = getDirectionStyles(isRTL);

  const gramsUnit = t("product.gramsUnit");

  const showCarbs = settings?.showCarbsOnHome ?? true;
  const showFat = settings?.showFatOnHome ?? true;
  const showFiber = (settings?.showFiberOnHome ?? true) && totals.fiber > 0;

  const macros: MacroCell[] = [
    { key: "protein", label: t("macros.protein"), value: totals.protein },
    ...(showCarbs
      ? [{ key: "carbs", label: t("macros.carbs"), value: totals.carbs }]
      : []),
    ...(showFat
      ? [{ key: "fat", label: t("macros.fat"), value: totals.fat }]
      : []),
    ...(showFiber
      ? [{ key: "fiber", label: t("macros.fiber"), value: totals.fiber }]
      : []),
  ];

  return (
    <View style={styles.panel}>
      <View style={[styles.caloriesRow, dir.row]}>
        <Text style={[styles.caloriesLabel, dir.text]} numberOfLines={1}>
          {t("macros.calories")}
        </Text>

        <Text style={[styles.caloriesValue, dir.text]} numberOfLines={1}>
          {formatNumber(totals.calories)}
          <Text style={styles.caloriesUnit}> {t("product.calUnit")}</Text>
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={[styles.macrosRow, dir.row]}>
        {macros.map((macro) => (
          <View key={macro.key} style={styles.macroCell}>
            <Text style={styles.macroLabel} numberOfLines={1}>
              {macro.label}
            </Text>

            <Text
              style={[styles.macroValue, dir.writing]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {formatNumber(macro.value)}
              <Text style={styles.macroUnit}> {gramsUnit}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
