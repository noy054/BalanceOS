import { useState } from "react";
import { View, Text, Alert, TextInput } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

import { PantryProduct, ProductCatalogProduct } from "../../types";
import { useAddPantryProductFromCatalog } from "../../hooks/usePantry";
import {
  RequiredMacroKey,
  getEffectiveMacro,
  getMissingMacroKeys,
} from "../../helpers/catalogNutrition";
import { MissingNutritionFields } from "./MissingNutritionFields";
import { useAppTheme } from "../../../../shared/theme";
import { Button } from "../../../../shared/components/ui/Button";
import { FormSection } from "../../../../shared/components/ui/FormSection";
import { SegmentedControl } from "../../../../shared/components/ui/SegmentedControl";
import { FoodThumb } from "../food/FoodThumb";
import { FOOD_ICONS } from "../../hooks/useFoodCardModels";
import { formatGrams } from "../../../../shared/helpers/formatNumber";
import { useStyles } from "./styles/ProductCatalogCard.styles";
import { useDirection } from "../../../../shared/hooks/useDirection";

type Props = {
  product: ProductCatalogProduct;
  onScanAnother: () => void;
  onAdded?: (product: PantryProduct) => void;
};

function CatalogNutritionRow({
  label,
  value,
  unit,
  last,
}: {
  label: string;
  value: number | null;
  unit: string;
  last?: boolean;
}) {
  const styles = useStyles();
  const dir = useDirection();

  return (
    <View
      style={[
        styles.nutritionRow,
        !last && styles.nutritionRowBorder,
        dir.row,
      ]}
    >
      <Text
        style={[styles.nutritionLabel, dir.text]}
      >
        {label}
      </Text>
      <Text style={styles.nutritionValue}>
        {value != null ? `${formatGrams(value)} ${unit}` : "—"}
      </Text>
    </View>
  );
}

export function ProductCatalogCard({ product, onScanAnother, onAdded }: Props) {
  const { t } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = useDirection();
  const addMutation = useAddPantryProductFromCatalog();
  const isAdding = addMutation.isPending;
  const [missingValues, setMissingValues] = useState<
    Partial<Record<RequiredMacroKey, string>>
  >({});
  const [missingErrors, setMissingErrors] = useState<
    Partial<Record<RequiredMacroKey, string>>
  >({});
  const [calcMode, setCalcMode] = useState<"grams" | "calories">("grams");
  const [calcInput, setCalcInput] = useState("");
  const [servingSizeStr, setServingSizeStr] = useState(
    product.servingSizeGrams != null ? String(product.servingSizeGrams) : "",
  );
  const [servingSizeError, setServingSizeError] = useState<string | null>(null);
  const [servingTextStr, setServingTextStr] = useState(
    product.servingSizeText ?? "",
  );

  const isFromOFF =
    product.source === "OPEN_FOOD_FACTS" ||
    product.verificationStatus === "AUTO_IMPORTED";

  const missingKeys = getMissingMacroKeys(product);
  const cal100 = getEffectiveMacro(product, "caloriesPer100g", missingValues) ?? 0;
  const protein100 = getEffectiveMacro(product, "proteinPer100g", missingValues) ?? 0;
  const carbs100 = getEffectiveMacro(product, "carbsPer100g", missingValues) ?? 0;
  const fat100 = getEffectiveMacro(product, "fatPer100g", missingValues) ?? 0;

  const servingG = parseFloat(servingSizeStr);
  const hasServing = !isNaN(servingG) && servingG >= 1;

  const perServingPreview = hasServing
    ? {
        cal: Math.round((cal100 * servingG) / 100),
        p:
          Math.round((protein100 * servingG) / 100 * 10) /
          10,
        c:
          Math.round((carbs100 * servingG) / 100 * 10) / 10,
        f:
          Math.round((fat100 * servingG) / 100 * 10) / 10,
      }
    : null;

  const calcVal = parseFloat(calcInput);
  const calcResult = (() => {
    if (isNaN(calcVal) || calcVal <= 0) return null;
    const grams =
      calcMode === "grams"
        ? calcVal
        : cal100 > 0
          ? (calcVal / cal100) * 100
          : null;
    if (grams == null) return null;
    return {
      grams,
      cal: Math.round((cal100 * grams) / 100),
      p: Math.round((protein100 * grams) / 100 * 10) / 10,
      c: Math.round((carbs100 * grams) / 100 * 10) / 10,
      f: Math.round((fat100 * grams) / 100 * 10) / 10,
    };
  })();

  function handleMissingChange(key: RequiredMacroKey, value: string) {
    setMissingValues((prev) => ({ ...prev, [key]: value }));
    setMissingErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateMissing(): boolean {
    const errs: Partial<Record<RequiredMacroKey, string>> = {};
    for (const key of missingKeys) {
      if (getEffectiveMacro(product, key, missingValues) == null) {
        errs[key] = t("errors.invalidNumber");
      }
    }
    setMissingErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAddToPantry() {
    if (isAdding) return;
    if (servingSizeStr.trim() && !hasServing) {
      setServingSizeError(t("errors.invalidNumber"));
      return;
    }
    if (!validateMissing()) return;
    const overrides: Partial<Record<RequiredMacroKey, number>> = {};
    for (const key of missingKeys) {
      overrides[key] = getEffectiveMacro(product, key, missingValues) ?? undefined;
    }
    try {
      const created: PantryProduct = await addMutation.mutateAsync({
        catalogItemId: product.id,
        payload: {
          ...overrides,
          servingSizeG: hasServing ? servingG : undefined,
          servingSizeText: servingTextStr.trim() || undefined,
        },
      });
      onAdded?.(created);
      router.back();
    } catch {
      Alert.alert("", t("errors.saveFailed"));
    }
  }

  const gramsUnit = t("product.gramsUnit");
  const calUnit = t("product.calUnit");

  return (
    <View style={styles.container}>
      <View style={[styles.identityRow, dir.row]}>
        <FoodThumb imageUrl={product.imageUrl} fallbackIcon={FOOD_ICONS.product} size={64} />

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

      {isFromOFF ? (
        <View style={[styles.offBanner, dir.row]}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.offBannerText, dir.text]}>
            {t("barcode.fromOpenFoodFacts")}
          </Text>
        </View>
      ) : null}

      <FormSection title={t("product.per100g")} contentStyle={styles.nutritionCard}>
        <CatalogNutritionRow
          label={t("macros.calories")}
          value={product.caloriesPer100g}
          unit={calUnit}
        />
        <CatalogNutritionRow
          label={t("macros.protein")}
          value={product.proteinPer100g}
          unit={gramsUnit}
        />
        <CatalogNutritionRow
          label={t("macros.carbs")}
          value={product.carbsPer100g}
          unit={gramsUnit}
        />
        <CatalogNutritionRow
          label={t("macros.fat")}
          value={product.fatPer100g}
          unit={gramsUnit}
          last={product.fiberPer100g == null}
        />
        {product.fiberPer100g != null ? (
          <CatalogNutritionRow
            label={t("macros.fiber")}
            value={product.fiberPer100g}
            unit={gramsUnit}
            last
          />
        ) : null}
      </FormSection>

      <MissingNutritionFields
        missingKeys={missingKeys}
        values={missingValues}
        errors={missingErrors}
        onChange={handleMissingChange}
      />

      <FormSection
        title={t("barcode.servingSection.title")}
        hint={t("barcode.servingSection.hint")}
        contentStyle={styles.sectionCard}
      >
        <View style={[styles.servingInputs, dir.row]}>
          <View style={styles.servingSizeField}>
            <Text style={[styles.fieldLabel, dir.text]}>
              {t("barcode.servingSection.sizeLabel")}
            </Text>
            <View
              style={[
                styles.inputFrame,
                servingSizeError ? styles.inputFrameError : null,
                dir.row,
              ]}
            >
              <TextInput
                style={[styles.input, dir.text]}
                keyboardType="decimal-pad"
                value={servingSizeStr}
                onChangeText={(text) => {
                  setServingSizeStr(text);
                  setServingSizeError(null);
                }}
                placeholder="—"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={t("barcode.servingSection.sizeLabel")}
              />
              <Text style={styles.inputUnit}>{gramsUnit}</Text>
            </View>
          </View>

          <View style={styles.servingLabelField}>
            <Text style={[styles.fieldLabel, dir.text]}>
              {t("barcode.servingSection.labelField")}
            </Text>
            <View style={styles.inputFrame}>
              <TextInput
                style={[styles.input, dir.text]}
                value={servingTextStr}
                onChangeText={setServingTextStr}
                placeholder={t("barcode.servingSection.labelPlaceholder")}
                placeholderTextColor={colors.textMuted}
                maxLength={60}
                accessibilityLabel={t("barcode.servingSection.labelField")}
              />
            </View>
          </View>
        </View>

        {servingSizeError ? (
          <Text style={[styles.errorText, dir.text]}>{servingSizeError}</Text>
        ) : null}

        {perServingPreview ? (
          <View style={styles.previewBox}>
            <Text style={[styles.previewLabel, dir.text]}>
              {t("barcode.servingSection.preview", { g: Math.round(servingG) })}
            </Text>
            <Text style={[styles.previewText, dir.text]}>
              {t("barcode.calcSection.resultByGrams", {
                cal: perServingPreview.cal,
                p: perServingPreview.p,
                c: perServingPreview.c,
                f: perServingPreview.f,
              })}
            </Text>
          </View>
        ) : null}
      </FormSection>

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

        {calcResult ? (
          <View style={styles.previewBox}>
            <Text style={[styles.previewText, dir.text]}>
              {calcMode === "grams"
                ? t("barcode.calcSection.resultByGrams", {
                    cal: calcResult.cal,
                    p: calcResult.p,
                    c: calcResult.c,
                    f: calcResult.f,
                  })
                : t("barcode.calcSection.resultByCalories", {
                    grams: Math.round(calcResult.grams * 10) / 10,
                    cal: calcResult.cal,
                    p: calcResult.p,
                    c: calcResult.c,
                    f: calcResult.f,
                  })}
            </Text>
          </View>
        ) : null}
      </FormSection>

      <View style={styles.actions}>
        <Button
          label={t("barcode.addToPantry")}
          icon="plus"
          onPress={handleAddToPantry}
          loading={isAdding}
          fullWidth
        />

        <Button
          label={t("barcode.scanAnother")}
          icon="barcode-scan"
          variant="secondary"
          onPress={onScanAnother}
          fullWidth
        />
      </View>
    </View>
  );
}
