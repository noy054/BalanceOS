import { Pressable, Text, View } from "react-native";
import { TFunction } from "i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import {
  NutritionMode,
  ProductFormErrors,
  ProductFormState,
} from "../../helpers/productForm";
import {
  getDirectionStyles,
  useStyles,
} from "./styles/ProductNutritionForm.styles";

type Props = {
  t: TFunction<"pantry">;
  language: string;
  isRTL: boolean;
  errors: ProductFormErrors;
  nutritionMode: NutritionMode;
  isPerServing: boolean;
  servingSizeG: string;
  onSwitchMode: (mode: NutritionMode) => void;
  onChangeServingSize: (value: string) => void;
  field: (key: keyof ProductFormState) => {
    value: string;
    onChangeText: (text: string) => void;
  };
};

export function ProductNutritionForm({
  t,
  language,
  isRTL,
  errors,
  nutritionMode,
  isPerServing,
  servingSizeG,
  onSwitchMode,
  onChangeServingSize,
  field,
}: Props) {
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  return (
    <View style={styles.formCard}>
      <View style={[styles.sectionHeaderRow, dir.row]}>
        <Text style={[styles.sectionTitle, dir.text]}>
          {t("addProduct.nutritionSection")}
        </Text>

        <View style={styles.modeToggleRow}>
          <Pressable
            style={[styles.modeBtn, !isPerServing && styles.modeBtnActive]}
            onPress={() => onSwitchMode("per100g")}
          >
            <Text
              style={[
                styles.modeBtnText,
                !isPerServing && styles.modeBtnTextActive,
              ]}
            >
              {t("addProduct.per100g")}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.modeBtn, isPerServing && styles.modeBtnActive]}
            onPress={() => onSwitchMode("perServing")}
          >
            <Text
              style={[
                styles.modeBtnText,
                isPerServing && styles.modeBtnTextActive,
              ]}
            >
              {t("addProduct.perServing")}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.sectionHint, dir.text]}>
        {t("addProduct.emptyValuesBecomeZero")}
      </Text>

      {isPerServing ? (
        <FormInput
          key={`serving-${language}`}
          label={t("addProduct.servingSizeLabel")}
          value={servingSizeG}
          onChangeText={onChangeServingSize}
          error={errors.servingSizeG}
          keyboardType="decimal-pad"
        />
      ) : null}

      <FormInput
        key={`calories-${language}-${nutritionMode}`}
        label={t("product.caloriesLabel")}
        error={errors.caloriesPer100g}
        keyboardType="decimal-pad"
        {...field("caloriesPer100g")}
      />

      <FormInput
        key={`protein-${language}-${nutritionMode}`}
        label={t("product.proteinLabel")}
        error={errors.proteinPer100g}
        keyboardType="decimal-pad"
        {...field("proteinPer100g")}
      />

      <FormInput
        key={`carbs-${language}-${nutritionMode}`}
        label={t("product.carbsLabel")}
        error={errors.carbsPer100g}
        keyboardType="decimal-pad"
        {...field("carbsPer100g")}
      />

      <FormInput
        key={`fat-${language}-${nutritionMode}`}
        label={t("product.fatLabel")}
        error={errors.fatPer100g}
        keyboardType="decimal-pad"
        {...field("fatPer100g")}
      />

      <FormInput
        key={`fiber-${language}-${nutritionMode}`}
        label={t("product.fiberLabel")}
        error={errors.fiberPer100g}
        keyboardType="decimal-pad"
        {...field("fiberPer100g")}
      />
    </View>
  );
}
