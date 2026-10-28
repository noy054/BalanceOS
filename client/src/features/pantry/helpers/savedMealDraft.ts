import {
  NutritionTotals as NutritionTotalsType,
  PantryProduct,
  PantryRecipe,
  RecipeItemProduct,
  SavedMealItem,
  SavedMealItemRecipe,
} from "../types";
import { calcProductNutrition, sumNutrition } from "./nutrition";
import {
  AmountPayload,
  AmountUnit,
  amountFromStored,
  defaultAmount,
  defaultAmountUnit,
  toAmountPayload,
} from "./serving";

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
  unit: AmountUnit;
};

export type RecipeDraftItem = {
  kind: "recipe";
  key: string;
  recipe: SavedMealDraftRecipe;
  servings: string;
};

export type SavedMealDraftItem = ProductDraftItem | RecipeDraftItem;

export type SavedMealPayloadItem =
  | ({
      productId: string;
    } & AmountPayload)
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
    grams: defaultAmount(product),
    unit: defaultAmountUnit(product),
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
  if (item.product && (item.grams != null || item.servings != null)) {
    const stored = amountFromStored(item.product, item);
    return {
      kind: "product",
      key: item.id,
      product: item.product,
      grams: stored.amount,
      unit: stored.unit,
    };
  }

  if (item.recipe && item.servings != null) {
    const liveTotals = sumNutrition(
      item.recipe.items.map((ri) => calcProductNutrition(ri.product, ri)),
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
        const amount = parsePositiveNumber(item.grams);

        if (amount) {
          return calcProductNutrition(
            item.product,
            toAmountPayload(item.product, amount, item.unit),
          );
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
        const amount = parsePositiveNumber(item.grams);

        if (amount) {
          return {
            productId: item.product.id,
            ...toAmountPayload(item.product, amount, item.unit),
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
