import { useState } from "react";
import { View, Text, Pressable, Alert, TextInput } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { PantryProduct, ProductCatalogProduct } from "../../types";
import { pantryApi } from "../../api/pantryApi";
import { PANTRY_QUERY_KEYS } from "../../constants";
import { useAppTheme } from "../../../../shared/theme";
import { useStyles } from "./styles/ProductCatalogCard.styles";

type Props = {
  product: ProductCatalogProduct;
  onScanAnother: () => void;
  onAdded?: (product: PantryProduct) => void;
};

function NutritionRow({
  label,
  value,
  unit,
  isRTL,
}: {
  label: string;
  value: number | null;
  unit: string;
  isRTL: boolean;
}) {
  const styles = useStyles();

  return (
    <View
      style={[
        styles.nutritionRow,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      <Text
        style={[styles.nutritionLabel, { textAlign: isRTL ? "right" : "left" }]}
      >
        {label}
      </Text>
      <Text style={styles.nutritionValue}>
        {value != null
          ? `${value % 1 === 0 ? value : value.toFixed(1)} ${unit}`
          : "—"}
      </Text>
    </View>
  );
}

export function ProductCatalogCard({ product, onScanAnother, onAdded }: Props) {
  const { t, i18n } = useTranslation("pantry");
  const { colors } = useAppTheme();
  const styles = useStyles();
  const queryClient = useQueryClient();
  const isRTL = i18n.dir(i18n.language) === "rtl";
  const [isAdding, setIsAdding] = useState(false);
  const [calcMode, setCalcMode] = useState<"grams" | "calories">("grams");
  const [calcInput, setCalcInput] = useState("");
  const [servingSizeStr, setServingSizeStr] = useState(
    product.servingSizeGrams != null ? String(product.servingSizeGrams) : "",
  );
  const [servingTextStr, setServingTextStr] = useState(
    product.servingSizeText ?? "",
  );

  const isFromOFF =
    product.source === "OPEN_FOOD_FACTS" ||
    product.verificationStatus === "AUTO_IMPORTED";

  const servingG = parseFloat(servingSizeStr);
  const hasServing = !isNaN(servingG) && servingG > 0;

  const perServingPreview = hasServing
    ? {
        cal: Math.round(((product.caloriesPer100g ?? 0) * servingG) / 100),
        p:
          Math.round(((product.proteinPer100g ?? 0) * servingG) / 100 * 10) /
          10,
        c:
          Math.round(((product.carbsPer100g ?? 0) * servingG) / 100 * 10) / 10,
        f:
          Math.round(((product.fatPer100g ?? 0) * servingG) / 100 * 10) / 10,
      }
    : null;

  const cal100 = product.caloriesPer100g ?? 0;
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
      p: Math.round(((product.proteinPer100g ?? 0) * grams) / 100 * 10) / 10,
      c: Math.round(((product.carbsPer100g ?? 0) * grams) / 100 * 10) / 10,
      f: Math.round(((product.fatPer100g ?? 0) * grams) / 100 * 10) / 10,
    };
  })();

  async function handleAddToPantry() {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const created = await pantryApi.create({
        name: product.name,
        brand: product.brand ?? undefined,
        barcode: product.barcode ?? undefined,
        imageUrl: product.imageUrl ?? undefined,
        caloriesPer100g: product.caloriesPer100g ?? 0,
        proteinPer100g: product.proteinPer100g ?? 0,
        carbsPer100g: product.carbsPer100g ?? 0,
        fatPer100g: product.fatPer100g ?? 0,
        fiberPer100g: product.fiberPer100g ?? undefined,
        servingSizeG: hasServing ? servingG : undefined,
        servingSizeText: servingTextStr.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEYS.list });
      onAdded?.(created);
      router.back();
    } catch (err: unknown) {
      if (
        (err as { response?: { status?: number } })?.response?.status === 409
      ) {
        Alert.alert("", t("barcode.alreadyInPantry"));
        router.back();
      } else {
        Alert.alert("", t("errors.saveFailed"));
      }
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color={colors.primaryGreen}
          />
        </View>
        <View style={styles.headerText}>
          <Text
            style={[
              styles.productName,
              { textAlign: isRTL ? "right" : "left" },
            ]}
            numberOfLines={2}
          >
            {product.name}
          </Text>
          {product.brand ? (
            <Text
              style={[
                styles.productBrand,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {product.brand}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Source banner */}
      {isFromOFF ? (
        <View
          style={[
            styles.offBanner,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={14}
            color={colors.textMuted}
          />
          <Text style={styles.offBannerText}>
            {t("barcode.fromOpenFoodFacts")}
          </Text>
        </View>
      ) : null}

      {/* Nutrition per 100g */}
      <View style={styles.nutritionSection}>
        <Text
          style={[
            styles.nutritionTitle,
            { textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {t("product.per100g")}
        </Text>
        <NutritionRow
          label={t("macros.calories")}
          value={product.caloriesPer100g}
          unit={t("product.calUnit")}
          isRTL={isRTL}
        />
        <NutritionRow
          label={t("macros.protein")}
          value={product.proteinPer100g}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />
        <NutritionRow
          label={t("macros.carbs")}
          value={product.carbsPer100g}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />
        <NutritionRow
          label={t("macros.fat")}
          value={product.fatPer100g}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />
        {product.fiberPer100g != null ? (
          <NutritionRow
            label={t("macros.fiber")}
            value={product.fiberPer100g}
            unit={t("product.gramsUnit")}
            isRTL={isRTL}
          />
        ) : null}
      </View>

      {/* Serving size section */}
      <View style={styles.servingSection}>
        <View
          style={[
            styles.servingSectionHeader,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <MaterialCommunityIcons
            name="scale"
            size={16}
            color={colors.primaryGreen}
          />
          <View style={styles.servingSectionHeaderText}>
            <Text
              style={[
                styles.servingSectionTitle,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t("barcode.servingSection.title")}
            </Text>
            <Text
              style={[
                styles.servingSectionHint,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t("barcode.servingSection.hint")}
            </Text>
          </View>
        </View>

        {/* Size (g) + unit */}
        <View
          style={[
            styles.servingInputRow,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <Text
            style={[
              styles.servingFieldLabel,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("barcode.servingSection.sizeLabel")}
          </Text>
          <View
            style={[
              styles.servingInputGroup,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <TextInput
              style={[
                styles.servingSizeInput,
                { color: colors.textPrimary, textAlign: isRTL ? "right" : "left" },
              ]}
              keyboardType="decimal-pad"
              value={servingSizeStr}
              onChangeText={setServingSizeStr}
              placeholder="—"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.servingUnit}>g</Text>
          </View>
        </View>

        {/* Description / label */}
        <View
          style={[
            styles.servingInputRow,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <Text
            style={[
              styles.servingFieldLabel,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("barcode.servingSection.labelField")}
          </Text>
          <TextInput
            style={[
              styles.servingLabelInput,
              { color: colors.textPrimary, textAlign: isRTL ? "right" : "left" },
            ]}
            value={servingTextStr}
            onChangeText={setServingTextStr}
            placeholder={t("barcode.servingSection.labelPlaceholder")}
            placeholderTextColor={colors.textMuted}
            maxLength={60}
          />
        </View>

        {/* Per-serving preview */}
        {perServingPreview ? (
          <View
            style={[
              styles.servingPreview,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <MaterialCommunityIcons
              name="calculator-variant-outline"
              size={13}
              color={colors.primaryGreen}
            />
            <Text style={styles.servingPreviewText} numberOfLines={1}>
              {`${t("barcode.servingSection.preview", { g: Math.round(servingG) })}: `}
              {`${perServingPreview.cal} kcal · `}
              {`${perServingPreview.p}g P · `}
              {`${perServingPreview.c}g C · `}
              {`${perServingPreview.f}g F`}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Calculator */}
      <View style={styles.calcSection}>
        <Text
          style={[
            styles.calcSectionTitle,
            { textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {t("barcode.calcSection.title")}
        </Text>
        <View
          style={[
            styles.calcRow,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View
            style={[
              styles.calcToggleGroup,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <Pressable
              style={[
                styles.calcPill,
                calcMode === "grams" && styles.calcPillActive,
              ]}
              onPress={() => {
                setCalcMode("grams");
                setCalcInput("");
              }}
            >
              <Text
                style={[
                  styles.calcPillText,
                  calcMode === "grams" && styles.calcPillTextActive,
                ]}
              >
                {t("barcode.calcSection.grams")}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.calcPill,
                calcMode === "calories" && styles.calcPillActive,
              ]}
              onPress={() => {
                setCalcMode("calories");
                setCalcInput("");
              }}
            >
              <Text
                style={[
                  styles.calcPillText,
                  calcMode === "calories" && styles.calcPillTextActive,
                ]}
              >
                {t("barcode.calcSection.calories")}
              </Text>
            </Pressable>
          </View>
          <TextInput
            style={[
              styles.calcValueInput,
              {
                color: colors.textPrimary,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
            keyboardType="decimal-pad"
            value={calcInput}
            onChangeText={setCalcInput}
            placeholder={t("barcode.calcSection.placeholder")}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        {calcResult ? (
          <View
            style={[
              styles.calcResultRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={14}
              color={colors.textMuted}
            />
            <Text style={styles.calcResultText} numberOfLines={1}>
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
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            pressed && styles.addBtnPressed,
            isAdding && styles.addBtnDisabled,
          ]}
          onPress={handleAddToPantry}
          disabled={isAdding}
        >
          <Text style={styles.addBtnText}>
            {isAdding ? "..." : t("barcode.addToPantry")}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.scanAnotherBtn,
            pressed && styles.scanAnotherBtnPressed,
          ]}
          onPress={onScanAnother}
        >
          <MaterialCommunityIcons
            name="barcode-scan"
            size={16}
            color={colors.textMuted}
          />
          <Text style={styles.scanAnotherBtnText}>
            {t("barcode.scanAnother")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
