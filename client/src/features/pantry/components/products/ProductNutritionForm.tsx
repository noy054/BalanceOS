import { View } from "react-native";
import { TFunction } from "i18next";

import { FormInput } from "../../../../shared/components/FormInput";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import {
  NutritionMode,
  ProductFormErrors,
  ProductFormState,
  ServingFormState,
} from "../../helpers/productForm";
import { ServingFields } from "./ServingFields";
import { useStyles } from "./styles/ProductNutritionForm.styles";

type Props = {
  t: TFunction<"pantry">;
  language: string;
  isRTL: boolean;
  errors: ProductFormErrors;
  nutritionMode: NutritionMode;
  isPerServing: boolean;
  serving: ServingFormState;
  requireCoreValues?: boolean;
  onSwitchMode: (mode: NutritionMode) => void;
  onChangeServing: (key: keyof ServingFormState, value: string) => void;
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
  serving,
  requireCoreValues = false,
  onSwitchMode,
  onChangeServing,
  field,
}: Props) {
  const styles = useStyles();

  const servingFields = (
    <View style={isPerServing ? styles.servingFirst : styles.servingLast}>
      <ServingFields
        serving={serving}
        perServingMode={isPerServing}
        language={language}
        weightError={errors.servingSizeG}
        quantityError={errors.servingQuantity}
        onChange={onChangeServing}
      />
    </View>
  );

  return (
    <FormSection
      title={t("addProduct.nutritionSection")}
      hint={
        requireCoreValues
          ? t("addProduct.reviewValuesHint")
          : t("addProduct.emptyValuesBecomeZero")
      }
    >
      <View style={styles.modeRow}>
        <SegmentedControl
          options={[
            { value: "per100g" as NutritionMode, label: t("addProduct.per100g") },
            { value: "perServing" as NutritionMode, label: t("addProduct.perServing") },
          ]}
          value={isPerServing ? "perServing" : "per100g"}
          onChange={onSwitchMode}
        />
      </View>

      {isPerServing ? servingFields : null}

      <FormInput
        key={`calories-${language}-${nutritionMode}`}
        label={
          isPerServing
            ? t("addProduct.caloriesPerServingLabel")
            : t("product.caloriesLabel")
        }
        error={errors.caloriesPer100g}
        keyboardType="decimal-pad"
        {...field("caloriesPer100g")}
      />

      <View style={[styles.grid, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={styles.gridCell}>
          <FormInput
            key={`protein-${language}-${nutritionMode}`}
            label={t("product.proteinLabel")}
            error={errors.proteinPer100g}
            keyboardType="decimal-pad"
            {...field("proteinPer100g")}
          />
        </View>

        <View style={styles.gridCell}>
          <FormInput
            key={`carbs-${language}-${nutritionMode}`}
            label={t("product.carbsLabel")}
            error={errors.carbsPer100g}
            keyboardType="decimal-pad"
            {...field("carbsPer100g")}
          />
        </View>
      </View>

      <View style={[styles.grid, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={styles.gridCell}>
          <FormInput
            key={`fat-${language}-${nutritionMode}`}
            label={t("product.fatLabel")}
            error={errors.fatPer100g}
            keyboardType="decimal-pad"
            {...field("fatPer100g")}
          />
        </View>

        <View style={styles.gridCell}>
          <FormInput
            key={`fiber-${language}-${nutritionMode}`}
            label={t("product.fiberLabel")}
            error={errors.fiberPer100g}
            keyboardType="decimal-pad"
            {...field("fiberPer100g")}
          />
        </View>
      </View>

      {isPerServing ? null : servingFields}
    </FormSection>
  );
}
