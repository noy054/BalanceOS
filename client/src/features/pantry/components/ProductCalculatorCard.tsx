import { Text, TextInput, Pressable, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";

import { colors } from "../../../shared/theme";
import { CalculatedNutrition } from "../types";
import { NutritionRow } from "./NutritionRow";
import { getDirectionStyles } from "../screens/styles/ProductDetailScreen.styles";
import { styles } from "./styles/ProductCalculatorCard.styles";

type Props = {
  grams: string;
  calcResult: CalculatedNutrition | null;
  isRTL: boolean;
  t: TFunction<"pantry">;
  onChangeGrams: (value: string) => void;
  onCalculate: () => void;
};

export function ProductCalculatorCard({
  grams,
  calcResult,
  isRTL,
  t,
  onChangeGrams,
  onCalculate,
}: Props) {
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={styles.calculatorCard}>
      <View style={styles.headerBlock}>
        <Text style={[styles.sectionTitle, dir.text]}>
          {t("productDetail.calculator")}
        </Text>

        <Text style={[styles.sectionHint, dir.text]}>
          {t("productDetail.calculatorHint")}
        </Text>
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
          value={grams}
          onChangeText={onChangeGrams}
          placeholder={t("productDetail.calculatorPlaceholder")}
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

          <NutritionRow
            label={t("macros.calories")}
            value={calcResult.calories}
            unit={t("product.calUnit")}
            highlight
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
