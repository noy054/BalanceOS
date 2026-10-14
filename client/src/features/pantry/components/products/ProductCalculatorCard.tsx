import { Pressable, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";

import { useAppTheme } from "../../../../shared/theme";
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

  return (
    <View style={styles.calculatorCard}>
      <View style={[styles.sectionHeaderRow, dir.row]}>
        <View style={styles.headerBlock}>
          <Text style={[styles.sectionTitle, dir.text]}>
            {t("productDetail.calculator")}
          </Text>

          <Text style={[styles.sectionHint, dir.text]}>
            {t("productDetail.calculatorHint")}
          </Text>
        </View>

        <View style={styles.unitToggleRow}>
          <Pressable
            style={[styles.unitBtn, unit === "grams" && styles.unitBtnActive]}
            onPress={() => unit !== "grams" && onSelectUnit("grams")}
          >
            <Text
              style={[
                styles.unitBtnText,
                unit === "grams" && styles.unitBtnTextActive,
              ]}
            >
              {t("addProduct.per100g")}
            </Text>
          </Pressable>

          {hasServing && (
            <Pressable
              style={[
                styles.unitBtn,
                unit === "servings" && styles.unitBtnActive,
              ]}
              onPress={() => unit !== "servings" && onSelectUnit("servings")}
            >
              <Text
                style={[
                  styles.unitBtnText,
                  unit === "servings" && styles.unitBtnTextActive,
                ]}
              >
                {t("addProduct.perServing")}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.unitBtn, unit === "calories" && styles.unitBtnActive]}
            onPress={() => unit !== "calories" && onSelectUnit("calories")}
          >
            <Text
              style={[
                styles.unitBtnText,
                unit === "calories" && styles.unitBtnTextActive,
              ]}
            >
              {t("productDetail.calculatorByCalories")}
            </Text>
          </Pressable>
        </View>
      </View>

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
        />

        <Pressable
          style={({ pressed }) => [
            styles.calcBtn,
            pressed && styles.calcBtnPressed,
          ]}
          onPress={onCalculate}
        >
          <MaterialCommunityIcons
            name="calculator"
            size={21}
            color={colors.background}
          />
        </Pressable>
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
