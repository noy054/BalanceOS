import { Text, TextInput, View } from "react-native";
import { TFunction } from "i18next";

import { useAppTheme } from "../../../../shared/theme";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import { CalculatedNutrition } from "../../types";
import { CalculatorUnit } from "../../hooks/useProductCalculator";
import { NutritionRow } from "../nutrition/NutritionRow";
import { getDirectionStyles } from "../../screens/styles/ProductDetailScreen.styles";
import { useStyles } from "./styles/ProductCalculatorCard.styles";

type Props = {
  quantity: string;
  unit: CalculatorUnit;
  servingSizeG?: number | null;
  calcResult: CalculatedNutrition | null;
  gramsResult: number | null;
  isRTL: boolean;
  t: TFunction<"pantry">;
  onChangeQuantity: (value: string) => void;
  onSelectUnit: (unit: CalculatorUnit) => void;
  onCalculate: () => void;
  plain?: boolean;
};

export function ProductCalculatorCard({
  quantity,
  unit,
  servingSizeG,
  calcResult,
  gramsResult,
  isRTL,
  t,
  onChangeQuantity,
  onSelectUnit,
  onCalculate,
  plain = false,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  const hasServing = servingSizeG != null && servingSizeG > 0;

  const placeholder =
    unit === "servings"
      ? t("productDetail.calculatorPlaceholderServings")
      : unit === "calories"
        ? t("productDetail.calculatorPlaceholderCalories")
        : t("productDetail.calculatorPlaceholder");

  const unitOptions: { value: CalculatorUnit; label: string }[] = [
    { value: "grams", label: t("productDetail.calculatorByGrams") },
    ...(hasServing
      ? [{ value: "servings" as CalculatorUnit, label: t("productDetail.calculatorByServings") }]
      : []),
    { value: "calories", label: t("productDetail.calculatorByCalories") },
  ];

  return (
    <View style={plain ? styles.plain : styles.calculatorCard}>
      {plain ? null : (
        <View style={styles.headerBlock}>
          <Text style={[styles.sectionTitle, dir.text]}>
            {t("productDetail.calculator")}
          </Text>

          <Text style={[styles.sectionHint, dir.text]}>
            {t("productDetail.calculatorHint")}
          </Text>
        </View>
      )}

      <SegmentedControl
        options={unitOptions}
        value={unit}
        size="sm"
        onChange={(next) => onSelectUnit(next)}
      />

      <View style={[styles.calcRow, dir.row]}>
        <TextInput
          style={[
            styles.calcInput,
            {
              textAlign: isRTL ? "right" : "left",
              writingDirection: isRTL ? "rtl" : "ltr",
            },
          ]}
          value={quantity}
          onChangeText={onChangeQuantity}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          returnKeyType="done"
          onSubmitEditing={onCalculate}
          accessibilityLabel={placeholder}
        />

        <IconButton
          icon="calculator-variant-outline"
          variant="filled"
          size={48}
          iconSize={22}
          accessibilityLabel={t("productDetail.calculateAction")}
          onPress={onCalculate}
        />
      </View>

      {calcResult ? (
        <View style={styles.calcResultCard}>
          <Text style={[styles.calcResultTitle, dir.text]}>
            {t("productDetail.calculatorResult")}
          </Text>

          {gramsResult != null && (
            <NutritionRow
              label={t("productDetail.calculatorQuantity")}
              value={gramsResult}
              unit={t("product.gramsUnit")}
              highlight
              isRTL={isRTL}
            />
          )}

          <NutritionRow
            label={t("macros.calories")}
            value={calcResult.calories}
            unit={t("product.calUnit")}
            highlight={gramsResult == null}
            isRTL={isRTL}
          />

          <NutritionRow
            label={t("macros.protein")}
            value={calcResult.protein}
            unit={t("product.gramsUnit")}
            isRTL={isRTL}
          />

          <NutritionRow
            label={t("macros.carbs")}
            value={calcResult.carbs}
            unit={t("product.gramsUnit")}
            isRTL={isRTL}
          />

          <NutritionRow
            label={t("macros.fat")}
            value={calcResult.fat}
            unit={t("product.gramsUnit")}
            last={calcResult.fiber == null}
            isRTL={isRTL}
          />

          {calcResult.fiber != null ? (
            <NutritionRow
              label={t("macros.fiber")}
              value={calcResult.fiber}
              unit={t("product.gramsUnit")}
              last
              isRTL={isRTL}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
