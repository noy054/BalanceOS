import { ReactNode } from "react";
import { Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";

import { useAppTheme } from "../../../../shared/theme";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { macroColor } from "../../../../shared/helpers/macroColors";
import { MACRO_CONFIG } from "../../../day-log/constants/macros";
import { CalculatorResult, CalculatorUnit } from "../../hooks/useProductCalculator";
import { useServingFormat } from "../../hooks/useServingFormat";
import { useMacroVisibility } from "../../hooks/useMacroVisibility";
import { CALCULATOR_STEPS, calculatorEquivalents, stepQuantity } from "../../helpers/calculatorAmount";
import { formatAmount, getServing, ServingSource } from "../../helpers/serving";
import { getDirectionStyles } from "../../screens/styles/ProductDetailScreen.styles";
import { QuantityRuler } from "./QuantityRuler";
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
  onRulerActiveChange?: (active: boolean) => void;
  children?: ReactNode;
};

type ResultColumn = {
  key: string;
  label: string;
  value: string;
  icon: (typeof MACRO_CONFIG)["protein"]["icon"];
  color: string;
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
  onRulerActiveChange,
  children,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);
  const servingFormat = useServingFormat();
  const visibility = useMacroVisibility();

  const servingUnit = getServing(serving)?.unit ?? null;
  const steps = CALCULATOR_STEPS[unit];
  const numeric = parseFloat(quantity.replace(",", "."));
  const value = Number.isFinite(numeric) ? numeric : 0;

  const toggleLabels: Record<CalculatorUnit, string> = {
    grams: t("productDetail.calculatorByGrams"),
    milliliters: t("productDetail.calculatorByMilliliters"),
    servings: servingUnit ?? t("productDetail.calculatorByServings"),
    calories: t("macros.calories"),
  };

  const unitLabels: Record<CalculatorUnit, string> = {
    grams: t("product.gramsUnit"),
    milliliters: t("product.millilitersUnit"),
    servings: servingUnit ?? t("productDetail.calculatorByServings"),
    calories: t("macros.calories"),
  };

  function setValue(next: number) {
    onChangeQuantity(formatAmount(next));
  }

  const amountText = result ? servingFormat.amount(serving, result.amount) : null;
  const resultTitle =
    unit === "servings"
      ? t("productDetail.resultFor", { amount: amountText ?? "" })
      : t("productDetail.resultFor", { amount: `${quantity} ${unitLabels[unit]}` });

  const nutrition = result?.nutrition;
  const equivalents = result ? calculatorEquivalents(serving, result.amount, result.nutrition.calories) : null;
  const equivalentText = equivalents
    ? [
        unit !== "grams" && equivalents.grams != null
          ? `${formatGrams(equivalents.grams)} ${t("product.gramsShort")}`
          : null,
        unit !== "milliliters" && equivalents.milliliters != null
          ? `${formatGrams(equivalents.milliliters)} ${t("product.mlShort")}`
          : null,
        unit !== "servings" && equivalents.servings != null
          ? `${formatAmount(Math.round(equivalents.servings * 100) / 100)} ${unitLabels.servings}`
          : null,
        unit !== "calories" ? `${formatCalories(equivalents.calories)} ${t("product.calUnit")}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;
  const grams = t("product.gramsShort");
  const columns: ResultColumn[] = nutrition
    ? [
        {
          key: "calories",
          label: t("product.calUnit"),
          value: formatCalories(nutrition.calories),
          icon: "fire",
          color: colors.accent,
        },
        {
          key: "protein",
          label: t("macros.protein"),
          value: formatGrams(nutrition.protein),
          icon: MACRO_CONFIG.protein.icon,
          color: macroColor("protein", colors),
        },
        ...(visibility.showCarbs
          ? [
              {
                key: "carbs",
                label: t("macros.carbs"),
                value: formatGrams(nutrition.carbs),
                icon: MACRO_CONFIG.carbs.icon,
                color: macroColor("carbs", colors),
              },
            ]
          : []),
        ...(visibility.showFat
          ? [
              {
                key: "fat",
                label: t("macros.fat"),
                value: formatGrams(nutrition.fat),
                icon: MACRO_CONFIG.fat.icon,
                color: macroColor("fat", colors),
              },
            ]
          : []),
        ...(visibility.showFiber && nutrition.fiber != null
          ? [
              {
                key: "fiber",
                label: t("macros.fiber"),
                value: formatGrams(nutrition.fiber),
                icon: MACRO_CONFIG.fiber.icon,
                color: macroColor("fiber", colors),
              },
            ]
          : []),
      ]
    : [];

  if (units.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.hint, dir.text]}>{t("productDetail.calculatorUnavailable")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {units.length > 1 ? (
        <SegmentedControl
          options={units.map((option) => ({ value: option, label: toggleLabels[option] }))}
          value={unit}
          onChange={onSelectUnit}
          pill
          style={styles.toggle}
        />
      ) : null}

      <View style={styles.stepper}>
        <IconButton
          icon="minus"
          variant="glass"
          size={48}
          iconSize={24}
          accessibilityLabel={t("productDetail.decrease")}
          onPress={() => setValue(stepQuantity(value, steps.button, -1, steps.precision))}
          disabled={value <= steps.precision}
        />

        <View style={styles.quantityBlock}>
          <TextInput
            style={styles.quantityInput}
            value={quantity}
            onChangeText={onChangeQuantity}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
            accessibilityLabel={`${t("productDetail.calculatorQuantity")}, ${unitLabels[unit]}`}
          />
          <Text style={styles.quantityUnit} numberOfLines={1}>
            {unitLabels[unit]}
          </Text>
          {equivalentText ? (
            <Text style={styles.equivalents} numberOfLines={1} accessibilityLiveRegion="polite">
              {`= ${equivalentText}`}
            </Text>
          ) : null}
        </View>

        <IconButton
          icon="plus"
          variant="glass"
          size={48}
          iconSize={24}
          accessibilityLabel={t("productDetail.increase")}
          onPress={() => setValue(stepQuantity(value, steps.button, 1, steps.precision))}
        />
      </View>

      <QuantityRuler
        value={value}
        steps={steps}
        accessibilityLabel={`${t("productDetail.calculatorQuantity")}, ${unitLabels[unit]}`}
        onChange={setValue}
        onActiveChange={onRulerActiveChange}
      />

      {result && nutrition ? (
        <View style={styles.resultCard}>
          <View style={[styles.resultHeader, dir.row]}>
            <Text style={[styles.resultTitle, dir.text]} numberOfLines={2}>
              {resultTitle}
            </Text>
          </View>

          <View style={[styles.columns, dir.row]}>
            {columns.map((column) => (
              <View
                key={column.key}
                style={styles.column}
                accessible
                accessibilityLabel={`${column.label} ${column.value}${column.key === "calories" ? "" : ` ${grams}`}`}
              >
                <MaterialCommunityIcons name={column.icon} size={18} color={column.color} />
                <Text style={styles.columnValue} numberOfLines={1}>
                  {column.value}
                </Text>
                <Text style={styles.columnLabel} numberOfLines={1}>
                  {column.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <Text style={[styles.hint, dir.text]}>{t("productDetail.calculatorHint")}</Text>
      )}

      {children}
    </View>
  );
}
