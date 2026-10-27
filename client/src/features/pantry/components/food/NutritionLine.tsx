import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
import { useTranslation } from "react-i18next";

import { typography, useThemedStyles } from "../../../../shared/theme";
import { useDirection } from "../../../../shared/hooks/useDirection";
import { formatGrams } from "../../../../shared/helpers/formatNumber";

export type MacroValues = {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
};

type Props = {
  macros: MacroValues;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
};

export function useMacroLineText(macros: MacroValues) {
  const { t } = useTranslation("pantry");

  const parts = [
    t("nutritionLine.item", { label: t("macrosShort.protein"), value: formatGrams(macros.protein) }),
    t("nutritionLine.item", { label: t("macrosShort.carbs"), value: formatGrams(macros.carbs) }),
    t("nutritionLine.item", { label: t("macrosShort.fat"), value: formatGrams(macros.fat) }),
  ];

  if (macros.fiber != null && macros.fiber > 0) {
    parts.push(t("nutritionLine.item", { label: t("macrosShort.fiber"), value: formatGrams(macros.fiber) }));
  }

  return parts.join(" · ");
}

export function NutritionLine({ macros, numberOfLines = 2, style }: Props) {
  const styles = useStyles();
  const dir = useDirection();
  const text = useMacroLineText(macros);

  return (
    <Text style={[styles.line, dir.text, style]} numberOfLines={numberOfLines}>
      {text}
    </Text>
  );
}

const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      line: {
        ...typography.caption,
        ...typography.number,
        fontWeight: "400",
        color: colors.textSecondary,
      },
    }),
  );
