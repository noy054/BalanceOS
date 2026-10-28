import { PantryProduct, RecipeItem, RecipeItemPayload, RecipeItemProduct } from "../types";
import { calcProductNutrition, sumNutrition } from "./nutrition";
import {
  AmountUnit,
  amountFromStored,
  defaultAmount,
  defaultAmountUnit,
  toAmountPayload,
} from "./serving";

export type RecipeDraftProduct = PantryProduct | RecipeItemProduct;

export type RecipeIngredientDraft = {
  key: string;
  product: RecipeDraftProduct;
  grams: string;
  unit: AmountUnit;
};

export type RecipeIngredientSelectionInput = {
  product: RecipeDraftProduct;
  quantity: string;
  unit: AmountUnit;
};

export function makeRecipeDraftKey() {
  return Math.random().toString(36).slice(2);
}

export function createRecipeDraftFromProduct(
  product: RecipeDraftProduct,
): RecipeIngredientDraft {
  return {
    key: makeRecipeDraftKey(),
    product,
    grams: defaultAmount(product),
    unit: defaultAmountUnit(product),
  };
}

export function createRecipeDraftFromRecipeItem(
  item: RecipeItem,
): RecipeIngredientDraft | null {
  if (!item.product) return null;
  const stored = amountFromStored(item.product, item);
  return {
    key: item.id,
    product: item.product,
    grams: stored.amount,
    unit: stored.unit,
  };
}

export function createRecipeDraftFromSelection(
  selection: RecipeIngredientSelectionInput,
): RecipeIngredientDraft {
  return {
    key: makeRecipeDraftKey(),
    product: selection.product,
    grams: selection.quantity,
    unit: selection.unit,
  };
}

export function calculateRecipeDraftTotals(
  ingredients: RecipeIngredientDraft[],
) {
  const items = ingredients
    .map((ingredient) => {
      const quantity = parseFloat(ingredient.grams.replace(",", "."));

      if (Number.isNaN(quantity) || quantity <= 0) {
        return null;
      }

      return calcProductNutrition(
        ingredient.product,
        toAmountPayload(ingredient.product, quantity, ingredient.unit),
      );
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return sumNutrition(items);
}

export function hasRecipeDraftTotals(ingredients: RecipeIngredientDraft[]) {
  return ingredients.some((ingredient) => {
    const quantity = parseFloat(ingredient.grams.replace(",", "."));

    return !Number.isNaN(quantity) && quantity > 0;
  });
}

export function buildRecipePayloadItems(
  ingredients: RecipeIngredientDraft[],
): RecipeItemPayload[] {
  return ingredients
    .map((ingredient) => ({
      ingredient,
      quantity: parseFloat(ingredient.grams.replace(",", ".")),
    }))
    .filter(({ quantity }) => !Number.isNaN(quantity) && quantity > 0)
    .map(({ ingredient, quantity }) => ({
      productId: ingredient.product.id,
      ...toAmountPayload(ingredient.product, quantity, ingredient.unit),
    }));
}
