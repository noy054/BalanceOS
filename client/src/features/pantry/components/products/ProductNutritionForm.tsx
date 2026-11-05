import { Text, View } from "react-native";
import { TFunction } from "i18next";

import { FormSection } from "../../../../shared/components/ui/FormSection";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import { useAppTheme } from "../../../../shared/theme";
import { macroColor } from "../../../../shared/helpers/macroColors";
import { MACRO_CONFIG } from "../../../day-log/constants/macros";
import {
  NutritionMode,
  ProductFormErrors,
  ProductFormState,
  ServingFormState,
} from "../../helpers/productForm";
import { NutrientInputTile } from "../form/NutrientInputTile";
import { ServingFields } from "./ServingFields";
import { ServingReference } from "../../helpers/servingReferences";
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
  servingFirst?: boolean;
  servingReferences?: ServingReference[];
  onSwitchMode: (mode: NutritionMode) => void;
  onChangeServing: (key: keyof ServingFormState, value: string) => void;
  onLinkedFocus?: () => void;
  onLinkedBlur?: (key: "calories" | "quantity" | "grams" | "milliliters") => void;
  onApplyReference?: (quantity: number, grams: number) => void;
  scaledBy?: number | null;
  field: (key: keyof ProductFormState) => {
    value: string;
    onChangeText: (text: string) => void;
  };
};

type MacroField = {
  key: "protein" | "carbs" | "fat" | "fiber";
  field: keyof ProductFormState & keyof ProductFormErrors;
};

const MACRO_FIELDS: MacroField[] = [
  { key: "protein", field: "proteinPer100g" },
  { key: "carbs", field: "carbsPer100g" },
  { key: "fat", field: "fatPer100g" },
  { key: "fiber", field: "fiberPer100g" },
];

export function ProductNutritionForm({
  t,
  language,
  isRTL,
  errors,
  nutritionMode,
  isPerServing,
  serving,
  requireCoreValues = false,
  servingFirst = false,
  servingReferences = [],
  onSwitchMode,
  onChangeServing,
  onLinkedFocus,
  onLinkedBlur,
  onApplyReference,
  scaledBy = null,
  field,
}: Props) {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const row = { flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const) };

  const servingFields = (
    <View style={isPerServing || servingFirst ? styles.servingFirst : styles.servingLast}>
      <ServingFields
        references={servingReferences}
        serving={serving}
        perServingMode={isPerServing}
        language={language}
        weightError={errors.servingSizeG}
        volumeError={errors.servingSizeMl}
        volumeRequired={nutritionMode === "per100ml"}
        quantityError={errors.servingQuantity}
        onChange={onChangeServing}
        onLinkedFocus={onLinkedFocus}
        onLinkedBlur={onLinkedBlur}
        onApplyReference={onApplyReference}
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
            { value: "per100ml" as NutritionMode, label: t("addProduct.per100ml") },
            { value: "perServing" as NutritionMode, label: t("addProduct.perServing") },
          ]}
          value={nutritionMode}
          onChange={onSwitchMode}
          pill
          style={styles.modeTrack}
        />
      </View>

      {isPerServing || servingFirst ? servingFields : null}

      <View style={styles.tiles}>
        <NutrientInputTile
          key={`calories-${language}-${nutritionMode}`}
          wide
          icon="fire"
          color={colors.accent}
          label={
            isPerServing
              ? t("addProduct.caloriesPerServingLabel")
              : nutritionMode === "per100ml"
                ? t("product.caloriesPer100mlLabel")
                : t("product.caloriesLabel")
          }
          error={errors.caloriesPer100g}
          onFocus={onLinkedFocus}
          onBlur={() => onLinkedBlur?.("calories")}
          {...field("caloriesPer100g")}
        />

        <View style={[styles.grid, row]}>
          {MACRO_FIELDS.map((macro) => (
            <NutrientInputTile
              key={`${macro.key}-${language}-${nutritionMode}`}
              icon={MACRO_CONFIG[macro.key].icon}
              color={macroColor(macro.key, colors)}
              label={t(`macros.${macro.key}`)}
              unit={t("product.gramsShort")}
              error={errors[macro.field]}
              {...field(macro.field)}
            />
          ))}
        </View>
      </View>

      {isPerServing && scaledBy ? (
        <Text style={[styles.scaledNote, { textAlign: isRTL ? "right" : "left" }]}>
          {t("addProduct.scaledNotice", { factor: Math.round(scaledBy * 100) / 100 })}
        </Text>
      ) : null}

      {isPerServing || servingFirst ? null : servingFields}
    </FormSection>
  );
}
