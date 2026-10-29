import { useState } from "react";
import { View, Text, Alert, TextInput } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { PantryProduct, ProductCatalogProduct } from "../../types";
import { useAddPantryProductFromCatalog } from "../../hooks/usePantry";
import { useServingFormat } from "../../hooks/useServingFormat";
import { hasCompleteNutrition, nutritionForAmount } from "../../helpers/nutrition";
import { getProductSaveErrorKey } from "../../helpers/barcode";
import { useAppTheme } from "../../../../shared/theme";
import { Button } from "../../../../shared/components/ui/Button";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import { FoodThumb } from "../food/FoodThumb";
import { FOOD_ICONS } from "../../hooks/useFoodCardModels";
import { formatCalories, formatGrams } from "../../../../shared/helpers/formatNumber";
import { useStyles } from "./styles/ProductCatalogCard.styles";
import { useDirection } from "../../../../shared/hooks/useDirection";

type Props = {
  product: ProductCatalogProduct;
  onScanAnother: () => void;
  onAdded?: (product: PantryProduct) => void;
  onEdit: () => void;
};

function CatalogNutritionRow({
  label,
  value,
  unit,
  last,
}: {
  label: string;
  value: string | null;
  unit: string;
  last?: boolean;
}) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View style={[styles.nutritionRow, !last && styles.nutritionRowBorder, dir.row]}>
      <Text style={[styles.nutritionLabel, dir.text]}>{label}</Text>
      <Text style={styles.nutritionValue}>{value != null ? `${value} ${unit}` : "—"}</Text>
    </View>
  );
}

function sourceKey(product: ProductCatalogProduct) {
  if (product.verificationStatus === "ADMIN_VERIFIED") return "barcode.sourceVerified";
  if (product.source === "OPEN_FOOD_FACTS") return "barcode.sourceOpenFoodFacts";
  if (product.source === "USDA_FDC") return "barcode.sourceUsda";
  return "barcode.sourceCommunity";
}

export function ProductCatalogCard({ product, onScanAnother, onAdded, onEdit }: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const format = useServingFormat();
  const addMutation = useAddPantryProductFromCatalog();
  const [calcMode, setCalcMode] = useState<"grams" | "calories">("grams");
  const [calcInput, setCalcInput] = useState("");

  const nutritionSource = { ...product, servingSizeG: product.servingSizeGrams };
  const isPerServing = product.nutritionBasis === "PER_SERVING";
  const isComplete = hasCompleteNutrition(nutritionSource);

  const values = isPerServing
    ? {
        calories: product.caloriesPerServing ?? null,
        protein: product.proteinPerServing ?? null,
        carbs: product.carbsPerServing ?? null,
        fat: product.fatPerServing ?? null,
        fiber: product.fiberPerServing ?? null,
      }
    : {
        calories: product.caloriesPer100g,
        protein: product.proteinPer100g,
        carbs: product.carbsPer100g,
        fat: product.fatPer100g,
        fiber: product.fiberPer100g,
      };

  const sectionTitle = isPerServing ? format.perServing(nutritionSource) : t("product.per100g");
  const servingLine =
    !isPerServing && product.servingSizeGrams
      ? format.perServing(nutritionSource)
      : (product.servingSizeText ?? null);

  const kcal100 = product.caloriesPer100g ?? 0;
  const calcVal = parseFloat(calcInput.replace(",", "."));
  const calcGrams =
    Number.isNaN(calcVal) || calcVal <= 0
      ? null
      : calcMode === "grams"
        ? calcVal
        : kcal100 > 0
          ? (calcVal / kcal100) * 100
          : null;
  const calcResult = calcGrams != null ? nutritionForAmount(nutritionSource, { grams: calcGrams }) : null;
  const showCalculator = !isPerServing && isComplete;

  async function handleAddToPantry() {
    if (addMutation.isPending) return;
    try {
      const created = await addMutation.mutateAsync({ catalogItemId: product.id, payload: {} });
      onAdded?.(created);
      router.back();
    } catch (err: unknown) {
      Alert.alert("", t(getProductSaveErrorKey(err)));
    }
  }

  const gramsUnit = t("product.gramsUnit");
  const calUnit = t("product.calUnit");
  const show = (value: number | null) => (value != null ? formatGrams(value) : null);

  return (
    <View style={styles.container}>
      <View style={[styles.identityRow, dir.row]}>
        {product.imageUrl ? <FoodThumb imageUrl={product.imageUrl} fallbackIcon={FOOD_ICONS.product} size={64} /> : null}

        <View style={styles.identityText}>
          <Text style={[styles.productName, dir.text]} numberOfLines={3}>
            {product.name}
          </Text>
          {product.brand ? (
            <Text style={[styles.productBrand, dir.text]} numberOfLines={1}>
              {product.brand}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.offBanner, dir.row]}>
        <MaterialCommunityIcons
          name={product.verificationStatus === "ADMIN_VERIFIED" ? "check-decagram-outline" : "information-outline"}
          size={18}
          color={colors.textSecondary}
        />
        <Text style={[styles.offBannerText, dir.text]}>{t(sourceKey(product))}</Text>
      </View>

      <FormSection title={sectionTitle} contentStyle={styles.nutritionCard}>
        <CatalogNutritionRow
          label={t("macros.calories")}
          value={values.calories != null ? formatCalories(values.calories) : null}
          unit={calUnit}
        />
        <CatalogNutritionRow label={t("macros.protein")} value={show(values.protein)} unit={gramsUnit} />
        <CatalogNutritionRow label={t("macros.carbs")} value={show(values.carbs)} unit={gramsUnit} />
        <CatalogNutritionRow label={t("macros.fat")} value={show(values.fat)} unit={gramsUnit} />
        <CatalogNutritionRow
          label={t("macros.fiber")}
          value={show(values.fiber)}
          unit={gramsUnit}
          last
        />
      </FormSection>

      {servingLine ? (
        <Text style={[styles.servingLine, dir.text]}>{servingLine}</Text>
      ) : null}

      {!isComplete ? (
        <View style={[styles.missingNotice, dir.row]} accessibilityRole="alert">
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.warning} />
          <Text style={[styles.missingNoticeText, dir.text]}>{t("barcode.missingValuesNotice")}</Text>
        </View>
      ) : null}

      {showCalculator ? (
        <FormSection title={t("barcode.calcSection.title")} contentStyle={styles.sectionCard}>
          <View style={[styles.calcRow, dir.row]}>
            <SegmentedControl
              options={[
                { value: "grams" as const, label: t("barcode.calcSection.grams") },
                { value: "calories" as const, label: t("barcode.calcSection.calories") },
              ]}
              value={calcMode}
              size="sm"
              onChange={(mode) => {
                setCalcMode(mode);
                setCalcInput("");
              }}
              style={styles.calcToggle}
            />

            <View style={[styles.inputFrame, styles.calcInputFrame]}>
              <TextInput
                style={[styles.input, dir.text]}
                keyboardType="decimal-pad"
                value={calcInput}
                onChangeText={setCalcInput}
                placeholder={t("barcode.calcSection.placeholder")}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={t("barcode.calcSection.title")}
              />
            </View>
          </View>

          {calcResult && calcGrams != null ? (
            <View style={styles.previewBox}>
              <Text style={[styles.previewText, dir.text]}>
                {calcMode === "grams"
                  ? t("barcode.calcSection.resultByGrams", {
                      cal: calcResult.calories,
                      p: calcResult.protein,
                      c: calcResult.carbs,
                      f: calcResult.fat,
                    })
                  : t("barcode.calcSection.resultByCalories", {
                      grams: Math.round(calcGrams * 10) / 10,
                      cal: calcResult.calories,
                      p: calcResult.protein,
                      c: calcResult.carbs,
                      f: calcResult.fat,
                    })}
              </Text>
            </View>
          ) : null}
        </FormSection>
      ) : null}

      <View style={styles.actions}>
        {isComplete ? (
          <Button
            label={t("barcode.addToPantry")}
            icon="plus"
            onPress={handleAddToPantry}
            loading={addMutation.isPending}
            fullWidth
          />
        ) : null}

        <Button
          label={t("barcode.reviewAndEdit")}
          icon="pencil-outline"
          variant={isComplete ? "secondary" : "primary"}
          onPress={onEdit}
          fullWidth
        />

        <Button
          label={t("barcode.scanAnother")}
          icon="barcode-scan"
          variant="ghost"
          onPress={onScanAnother}
          fullWidth
        />
      </View>
    </View>
  );
}
