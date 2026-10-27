import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { formatGrams } from "../../../shared/helpers/formatNumber";
import { PantryProduct, PantryRecipe, SavedMeal } from "../types";
import { MacroValues } from "../components/food/NutritionLine";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type FoodCardModel = {
  title: string;
  meta: string;
  imageUrl: string | null;
  fallbackIcon: IconName;
  calories: number;
  macros: MacroValues;
};

type WithOptionalImage = { imageUrl?: string | null };

export const FOOD_ICONS = {
  product: "food-apple-outline",
  recipe: "chef-hat",
  savedMeal: "silverware-fork-knife",
} as const satisfies Record<string, IconName>;

function getRecipeImageUrl(recipe: PantryRecipe & WithOptionalImage) {
  return (
    recipe.imageUrl ||
    recipe.items.find((item) => item.product?.imageUrl)?.product?.imageUrl ||
    null
  );
}

function getSavedMealImageUrl(meal: SavedMeal) {
  if (meal.imageUrl) {
    return meal.imageUrl;
  }

  const productImage = meal.items.find((item) => item.product?.imageUrl)?.product?.imageUrl;

  if (productImage) {
    return productImage;
  }

  return (
    meal.items
      .flatMap((item) => item.recipe?.items ?? [])
      .find((item) => item.product?.imageUrl)?.product?.imageUrl ?? null
  );
}

function joinMeta(parts: Array<string | null | undefined | false>) {
  return parts.filter(Boolean).join(" · ");
}

export function useFoodCardModels() {
  const { t } = useTranslation("pantry");

  function productBasisLabel(product: Pick<PantryProduct, "servingSizeG">) {
    const hasServing = product.servingSizeG != null && product.servingSizeG > 0;

    return hasServing
      ? t("foodCard.perServingSize", { size: formatGrams(product.servingSizeG) })
      : t("product.per100g");
  }

  function mealTypeLabel(mealType: string | null) {
    return mealType ? t(`mealTypes.${mealType}` as Parameters<typeof t>[0]) : null;
  }

  function product(item: PantryProduct): FoodCardModel {
    const hasServing = item.servingSizeG != null && item.servingSizeG > 0;
    const mul = hasServing ? (item.servingSizeG as number) / 100 : 1;
    const categories = (item.mealCategories ?? [])
      .map((cat) => t(`categories.${cat}` as Parameters<typeof t>[0]))
      .join(", ");

    return {
      title: item.name,
      meta: joinMeta([item.brand, productBasisLabel(item), categories]),
      imageUrl: item.imageUrl ?? null,
      fallbackIcon: FOOD_ICONS.product,
      calories: item.caloriesPer100g * mul,
      macros: {
        protein: item.proteinPer100g * mul,
        carbs: item.carbsPer100g * mul,
        fat: item.fatPer100g * mul,
        fiber: item.fiberPer100g != null ? item.fiberPer100g * mul : null,
      },
    };
  }

  function recipe(item: PantryRecipe): FoodCardModel {
    return {
      title: item.name,
      meta: joinMeta([
        t("foodCard.recipeTotal"),
        t("recipeDetail.itemsCount", { count: item.items.length }),
        mealTypeLabel(item.mealType),
      ]),
      imageUrl: getRecipeImageUrl(item),
      fallbackIcon: FOOD_ICONS.recipe,
      calories: item.totals.calories,
      macros: item.totals,
    };
  }

  function savedMeal(item: SavedMeal): FoodCardModel {
    return {
      title: item.name,
      meta: joinMeta([
        t("foodCard.mealTotal"),
        t("savedMealDetail.itemsCount", { count: item.items.length }),
        mealTypeLabel(item.mealType),
      ]),
      imageUrl: getSavedMealImageUrl(item),
      fallbackIcon: FOOD_ICONS.savedMeal,
      calories: item.totals.calories,
      macros: item.totals,
    };
  }

  return { product, recipe, savedMeal, productBasisLabel };
}
