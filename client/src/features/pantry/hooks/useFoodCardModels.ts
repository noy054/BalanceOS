import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useServingFormat } from "./useServingFormat";
import { PantryProduct, PantryRecipe, SavedMeal } from "../types";
import { MacroValues } from "../components/food/NutritionLine";
import { hasServing } from "../helpers/serving";
import { nutritionPer100g, nutritionPerServing } from "../helpers/nutrition";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type FoodCardModel = {
  title: string;
  meta: string;
  basis: string | null;
  summary: string;
  tags: string[];
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

export function useFoodCardModels() {
  const { t } = useTranslation("pantry");
  const format = useServingFormat();

  function productBasisLabel(
    product: Pick<
      PantryProduct,
      "nutritionBasis" | "servingSizeG" | "servingQuantity" | "servingUnit"
    >,
  ) {
    return format.perServing(product);
  }

  function mealTypeLabels(mealTypes: readonly string[]) {
    return mealTypes.map((type) => t(`mealTypes.${type}` as Parameters<typeof t>[0]));
  }

  function product(item: PantryProduct, showBrand = false): FoodCardModel {
    const values =
      (hasServing(item) ? nutritionPerServing(item) : nutritionPer100g(item)) ??
      nutritionPer100g(item);
    return {
      title: item.name,
      meta: showBrand && item.brand ? item.brand : "",
      basis: format.basis(item),
      summary: "",
      tags: [],
      imageUrl: item.imageUrl ?? null,
      fallbackIcon: FOOD_ICONS.product,
      calories: values?.calories ?? 0,
      macros: {
        protein: values?.protein ?? 0,
        carbs: values?.carbs ?? 0,
        fat: values?.fat ?? 0,
        fiber: values?.fiber ?? null,
      },
    };
  }

  function recipe(item: PantryRecipe): FoodCardModel {
    return {
      title: item.name,
      meta: "",
      basis: t("foodCard.recipeTotal"),
      summary: t("recipeDetail.itemsCount", { count: item.items.length }),
      tags: mealTypeLabels(item.mealType ? [item.mealType] : []),
      imageUrl: getRecipeImageUrl(item),
      fallbackIcon: FOOD_ICONS.recipe,
      calories: item.totals.calories,
      macros: item.totals,
    };
  }

  function savedMeal(item: SavedMeal): FoodCardModel {
    return {
      title: item.name,
      meta: "",
      basis: t("foodCard.mealTotal"),
      summary: t("savedMealDetail.itemsCount", { count: item.items.length }),
      tags: mealTypeLabels(item.mealTypes),
      imageUrl: getSavedMealImageUrl(item),
      fallbackIcon: FOOD_ICONS.savedMeal,
      calories: item.totals.calories,
      macros: item.totals,
    };
  }

  return { product, recipe, savedMeal, productBasisLabel };
}
