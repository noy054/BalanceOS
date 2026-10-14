import {
  NutritionTotals as NutritionTotalsType,
  PantryProduct,
  PantryRecipe,
  RecipeItemProduct,
  SavedMealItem,
  SavedMealItemRecipe,
} from "../types";
import { sumNutrition } from "./nutrition";

export type SavedMealDraftProduct = PantryProduct | RecipeItemProduct;

export type SavedMealDraftRecipe =
  | PantryRecipe
  | (SavedMealItemRecipe & {
      totals: NutritionTotalsType;
    });

export type ProductDraftItem = {
  kind: "product";
  key: string;
  product: SavedMealDraftProduct;
  grams: string;
};

export type RecipeDraftItem = {
  kind: "recipe";
  key: string;
  recipe: SavedMealDraftRecipe;
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

function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}

function calcProductDraftNutrition(
  product: SavedMealDraftProduct,
  grams: number,
): NutritionTotalsType {
  const factor = grams / 100;

  return {
    calories: Math.round(product.caloriesPer100g * factor),
    protein: roundMacro(product.proteinPer100g * factor),
    carbs: roundMacro(product.carbsPer100g * factor),
    fat: roundMacro(product.fatPer100g * factor),
    fiber: roundMacro((product.fiberPer100g ?? 0) * factor),
  };
}

export function calcRecipeTotals(
  recipe: SavedMealDraftRecipe,
  servings: number,
): NutritionTotalsType {
  return {
    calories: Math.round(recipe.totals.calories * servings),
    protein: roundMacro(recipe.totals.protein * servings),
    carbs: roundMacro(recipe.totals.carbs * servings),
    fat: roundMacro(recipe.totals.fat * servings),
    fiber: roundMacro(recipe.totals.fiber * servings),
  };
}


export function createSavedMealDraftFromProduct(
  product: PantryProduct,
): ProductDraftItem {
  return {
    kind: "product",
    key: makeSavedMealDraftKey(),
    product,
    grams: "100",
  };
}

export function createSavedMealDraftFromRecipe(
  recipe: PantryRecipe,
): RecipeDraftItem {
  return {
    kind: "recipe",
    key: makeSavedMealDraftKey(),
    recipe,
    servings: "1",
  };
}

export function createSavedMealDraftFromSavedMealItem(
  item: SavedMealItem,
): SavedMealDraftItem | null {
  if (item.product && item.grams != null) {
    return {
      kind: "product",
      key: item.id,
      product: item.product,
      grams: String(item.grams),
    };
  }

  if (item.recipe && item.servings != null) {
    const liveTotals = sumNutrition(
      item.recipe.items.map((ri) => calcProductDraftNutrition(ri.product, ri.grams)),
    );
    return {
      kind: "recipe",
      key: item.id,
      recipe: {
        ...item.recipe,
        totals: liveTotals,
      },
      servings: String(item.servings),
    };
  }

  return null;
}

export function calculateSavedMealDraftTotals(items: SavedMealDraftItem[]) {
  const nutritionList = items
    .map((item) => {
      if (item.kind === "product") {
        const grams = parsePositiveNumber(item.grams);

        if (grams) {
          return calcProductDraftNutrition(item.product, grams);
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
