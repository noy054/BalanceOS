import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TFunction } from "i18next";

import { useAppTheme } from "../../../../shared/theme";
import { CategoryChips } from "../../../../shared/components/CategoryChips";
import { PantryProduct } from "../../types";
import { NutritionRow } from "../nutrition/NutritionRow";
import { FoodThumb } from "../food/FoodThumb";
import { FOOD_ICONS } from "../../hooks/useFoodCardModels";
import { getDirectionStyles } from "../../screens/styles/ProductDetailScreen.styles";
import { useStyles } from "./styles/NutritionFactsCard.styles";

type Props = {
  product: PantryProduct;
  t: TFunction<"pantry">;
  isRTL: boolean;
};

function r1(n: number) {
  return Math.round(n * 10) / 10;
}

export function NutritionFactsCard({ product, t, isRTL }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);

  const hasServing = product.servingSizeG != null && product.servingSizeG > 0;
  const mul = hasServing ? product.servingSizeG! / 100 : 1;

  const displayCalories = r1(product.caloriesPer100g * mul);
  const displayProtein = r1(product.proteinPer100g * mul);
  const displayCarbs = r1(product.carbsPer100g * mul);
  const displayFat = r1(product.fatPer100g * mul);
  const displayFiber =
    product.fiberPer100g != null ? r1(product.fiberPer100g * mul) : null;

  const sectionLabel = hasServing
    ? t("productDetail.nutritionPerServing", { size: product.servingSizeG })
    : t("productDetail.nutritionSection");

  const hasMeta =
    Boolean(product.brand) ||
    Boolean(product.barcode) ||
    (product.mealCategories ?? []).length > 0;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.identityRow, dir.row]}>
        <FoodThumb imageUrl={product.imageUrl} fallbackIcon={FOOD_ICONS.product} size={64} />

        <View style={styles.identityText}>
          <Text style={[styles.productName, dir.text]} numberOfLines={3}>
            {product.name}
          </Text>

          {product.brand ? (
            <Text style={[styles.metaText, dir.text]} numberOfLines={1}>
              {product.brand}
            </Text>
          ) : null}

          {product.barcode ? (
            <View style={[styles.metaRow, dir.row]}>
              <MaterialCommunityIcons name="barcode" size={14} color={colors.textMuted} />
              <Text style={styles.metaMuted} numberOfLines={1}>
                {product.barcode}
              </Text>
            </View>
          ) : null}

          {hasMeta ? (
            <CategoryChips categories={product.mealCategories ?? []} isRTL={isRTL} />
          ) : null}
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={[styles.heroLabel, dir.text]}>{sectionLabel}</Text>

        <NutritionRow
          label={t("macros.calories")}
          value={displayCalories}
          unit={t("product.calUnit")}
          highlight
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.protein")}
          value={displayProtein}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.carbs")}
          value={displayCarbs}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.fat")}
          value={displayFat}
          unit={t("product.gramsUnit")}
          last={displayFiber == null}
          isRTL={isRTL}
        />

        {displayFiber != null ? (
          <NutritionRow
            label={t("macros.fiber")}
            value={displayFiber}
            unit={t("product.gramsUnit")}
            last
            isRTL={isRTL}
          />
        ) : null}
      </View>
    </View>
  );
}
