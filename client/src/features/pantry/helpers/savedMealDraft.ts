import {
  NutritionTotals as NutritionTotalsType,
  PantryProduct,
  PantryRecipe,
} from "../types";
import { calcProductNutrition, sumNutrition } from "./nutrition";

export type ProductDraftItem = {
  kind: "product";
  key: string;
  product: PantryProduct;
  grams: string;
};

export type RecipeDraftItem = {
  kind: "recipe";
  key: string;
  recipe: PantryRecipe;
  servings: string;
};

export type SavedMealDraftItem = ProductDraftItem | RecipeDraftItem;

export type SavedMealPayloadItem =
  | {
      productId: string;
      grams: number;
    }
  | {
      recipeId: string;
      servings: number;
    };

export function makeSavedMealDraftKey() {
  return Math.random().toString(36).slice(2);
}

export function parsePositiveNumber(value: string) {
  const parsed = parseFloat(value.replace(",", "."));
  return !Number.isNaN(parsed) && parsed > 0 ? parsed : null;
}

export function calcRecipeTotals(
  recipe: PantryRecipe,
  servings: number,
): NutritionTotalsType {
  return {
    calories: Math.round(recipe.totals.calories * servings),
    protein: Math.round(recipe.totals.protein * servings * 10) / 10,
    carbs: Math.round(recipe.totals.carbs * servings * 10) / 10,
    fat: Math.round(recipe.totals.fat * servings * 10) / 10,
    fiber: Math.round(recipe.totals.fiber * servings * 10) / 10,
  };
}

export function calculateSavedMealDraftTotals(items: SavedMealDraftItem[]) {
  const nutritionList = items
    .map((item) => {
      if (item.kind === "product") {
        const grams = parsePositiveNumber(item.grams);

        if (grams) {
          return calcProductNutrition(item.product, grams);
        }

        return null;
      }

      const servings = parsePositiveNumber(item.servings);

      if (servings) {
        return calcRecipeTotals(item.recipe, servings);
      }

      return null;
    })
    .filter((item): item is NutritionTotalsType => item !== null);

  return sumNutrition(nutritionList);
}

export function buildSavedMealPayloadItems(
  items: SavedMealDraftItem[],
): SavedMealPayloadItem[] {
  return items
    .map((item) => {
      if (item.kind === "product") {
        const grams = parsePositiveNumber(item.grams);

        if (grams) {
          return {
            productId: item.product.id,
            grams,
          };
        }

        return null;
      }

      const servings = parsePositiveNumber(item.servings);

      if (servings) {
        return {
          recipeId: item.recipe.id,
          servings,
        };
      }

      return null;
    })
    .filter((item): item is SavedMealPayloadItem => item !== null);
}
