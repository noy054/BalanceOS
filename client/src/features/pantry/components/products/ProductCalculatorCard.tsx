import { Text, TextInput, View } from "react-native";
import { TFunction } from "i18next";

import { useAppTheme } from "../../../../shared/theme";
import { Button } from "../../../../shared/components/ui/Button";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import { CalculatorResult, CalculatorUnit } from "../../hooks/useProductCalculator";
import { useServingFormat } from "../../hooks/useServingFormat";
import { getServing, ServingSource } from "../../helpers/serving";
import { NutritionRow } from "../nutrition/NutritionRow";
import { getDirectionStyles } from "../../screens/styles/ProductDetailScreen.styles";
import { useStyles } from "./styles/ProductCalculatorCard.styles";

type Props = {
  quantity: string;
  unit: CalculatorUnit;
  units: CalculatorUnit[];
  serving: ServingSource;
  result: CalculatorResult | null;
  isRTL: boolean;
  t: TFunction<"pantry">;
  onChangeQuantity: (value: string) => void;
  onSelectUnit: (unit: CalculatorUnit) => void;
  onAddToMeal?: () => void;
  plain?: boolean;
};

export function ProductCalculatorCard({
  quantity,
  unit,
  units,
  serving,
  result,
  isRTL,
  t,
  onChangeQuantity,
  onSelectUnit,
  onAddToMeal,
  plain = false,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);
  const servingFormat = useServingFormat();

  const servingUnit = getServing(serving)?.unit ?? null;

  const placeholder =
    unit === "servings"
      ? servingUnit
        ? t("serving.quantityOf", { unit: servingUnit })
        : t("productDetail.calculatorPlaceholderServings")
      : unit === "calories"
        ? t("productDetail.calculatorPlaceholderCalories")
        : t("productDetail.calculatorPlaceholder");

  const labels: Record<CalculatorUnit, string> = {
    grams: t("productDetail.calculatorByGrams"),
    servings: servingUnit ?? t("productDetail.calculatorByServings"),
    calories: t("productDetail.calculatorByCalories"),
  };

  const nutrition = result?.nutrition;

  return (
    <View style={plain ? styles.plain : styles.calculatorCard}>
      {plain ? null : (
        <View style={styles.headerBlock}>
          <Text style={[styles.sectionTitle, dir.text]}>{t("productDetail.calculator")}</Text>
          <Text style={[styles.sectionHint, dir.text]}>{t("productDetail.calculatorHint")}</Text>
        </View>
      )}

      {units.length > 1 ? (
        <SegmentedControl
          options={units.map((value) => ({ value, label: labels[value] }))}
          value={unit}
          size="sm"
          onChange={(next) => onSelectUnit(next)}
        />
      ) : null}

      {units.length === 0 ? (
        <Text style={[styles.sectionHint, dir.text]}>{t("productDetail.calculatorUnavailable")}</Text>
      ) : (
        <View style={[styles.calcRow, dir.row]}>
          <TextInput
            style={[
              styles.calcInput,
              { textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" },
            ]}
            value={quantity}
            onChangeText={onChangeQuantity}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            returnKeyType="done"
            accessibilityLabel={placeholder}
          />
          <Text style={styles.calcUnit} numberOfLines={1}>
            {labels[unit]}
          </Text>
        </View>
      )}

      {result && nutrition ? (
        <View style={styles.calcResultCard}>
          <Text style={[styles.calcResultTitle, dir.text]}>{t("productDetail.calculatorResult")}</Text>
          <Text style={[styles.quantityText, dir.text]} accessibilityLabel={t("productDetail.calculatorQuantity")}>
            {servingFormat.amount(serving, result.amount)}
          </Text>

          <NutritionRow label={t("macros.calories")} value={nutrition.calories} unit={t("product.calUnit")} highlight isRTL={isRTL} />
          <NutritionRow label={t("macros.protein")} macro="protein" value={nutrition.protein} unit={t("product.gramsUnit")} isRTL={isRTL} />
          <NutritionRow label={t("macros.carbs")} macro="carbs" value={nutrition.carbs} unit={t("product.gramsUnit")} isRTL={isRTL} />
          <NutritionRow
            label={t("macros.fat")} macro="fat"
            value={nutrition.fat}
            unit={t("product.gramsUnit")}
            last={nutrition.fiber == null}
            isRTL={isRTL}
          />
          {nutrition.fiber != null ? (
            <NutritionRow label={t("macros.fiber")} macro="fiber" value={nutrition.fiber} unit={t("product.gramsUnit")} last isRTL={isRTL} />
          ) : null}
        </View>
      ) : null}

      {result && onAddToMeal ? (
        <Button label={t("calculatorMeal.addAction")} icon="plus" onPress={onAddToMeal} fullWidth />
      ) : null}
    </View>
  );
}
