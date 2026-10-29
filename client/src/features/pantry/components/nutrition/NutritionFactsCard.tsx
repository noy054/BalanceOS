import { Text, View } from "react-native";
import { TFunction } from "i18next";

import { CategoryChips } from "../../../../shared/components/CategoryChips";
import { PantryProduct } from "../../types";
import { NutritionRow } from "../nutrition/NutritionRow";
import { ZoomableThumb } from "../food/ZoomableThumb";
import { FOOD_ICONS } from "../../hooks/useFoodCardModels";
import { useServingFormat } from "../../hooks/useServingFormat";
import { getServing } from "../../helpers/serving";
import { getDirectionStyles } from "../../screens/styles/ProductDetailScreen.styles";
import { useStyles } from "./styles/NutritionFactsCard.styles";
import { nutritionPer100g, nutritionPerServing } from "../../helpers/nutrition";

type Props = {
  product: PantryProduct;
  t: TFunction<"pantry">;
  isRTL: boolean;
};

export function NutritionFactsCard({ product, t, isRTL }: Props) {
  const styles = useStyles();
  const dir = getDirectionStyles(isRTL);
  const format = useServingFormat();
  const serving = getServing(product);

  const hasServing = serving !== null;
  const values = (hasServing ? nutritionPerServing(product) : nutritionPer100g(product)) ?? null;

  const displayCalories = values?.calories ?? 0;
  const displayProtein = values?.protein ?? 0;
  const displayCarbs = values?.carbs ?? 0;
  const displayFat = values?.fat ?? 0;
  const displayFiber = values?.fiber ?? null;

  const sectionLabel = hasServing
    ? t("productDetail.nutritionFor", { basis: format.perServing(product) })
    : t("productDetail.nutritionSection");
  const unitWeight = serving?.unit ? format.unitWeight(product) : null;

  const hasCategories = (product.mealCategories ?? []).length > 0;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.identityRow, dir.row]}>
        <ZoomableThumb imageUrl={product.imageUrl} fallbackIcon={FOOD_ICONS.product} name={product.name} />

        <View style={styles.identityText}>
          <Text style={[styles.productName, dir.text]} numberOfLines={3}>
            {product.name}
          </Text>

          {product.brand ? (
            <Text style={[styles.metaText, dir.text]} numberOfLines={1}>
              {product.brand}
            </Text>
          ) : null}

          {hasCategories ? (
            <CategoryChips categories={product.mealCategories ?? []} isRTL={isRTL} />
          ) : null}
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={[styles.heroLabel, dir.text]}>{sectionLabel}</Text>
        {unitWeight ? (
          <Text style={[styles.metaMuted, dir.text]}>{unitWeight}</Text>
        ) : null}

        <NutritionRow
          label={t("macros.calories")}
          value={displayCalories}
          unit={t("product.calUnit")}
          highlight
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.protein")} macro="protein"
          value={displayProtein}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.carbs")} macro="carbs"
          value={displayCarbs}
          unit={t("product.gramsUnit")}
          isRTL={isRTL}
        />

        <NutritionRow
          label={t("macros.fat")} macro="fat"
          value={displayFat}
          unit={t("product.gramsUnit")}
          last={displayFiber == null}
          isRTL={isRTL}
        />

        {displayFiber != null ? (
          <NutritionRow
            label={t("macros.fiber")} macro="fiber"
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
