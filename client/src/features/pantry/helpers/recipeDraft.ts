import { PantryProduct, RecipeItem, RecipeItemProduct } from "../types";
import { calcProductNutrition, sumNutrition } from "./nutrition";

export type RecipeDraftProduct = PantryProduct | RecipeItemProduct;

export type RecipeIngredientDraft = {
  key: string;
  product: RecipeDraftProduct;
  grams: string;
  unit: "grams" | "servings";
};

export type RecipeIngredientSelectionInput = {
  product: RecipeDraftProduct;
  quantity: string;
  unit: "grams" | "servings";
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
    grams: product.servingSizeG ? "1" : "100",
    unit: product.servingSizeG ? "servings" : "grams",
  };
}

export function createRecipeDraftFromRecipeItem(
  item: RecipeItem,
): RecipeIngredientDraft | null {
  if (!item.product) return null;
  return {
    key: item.id,
    product: item.product,
    grams: String(item.grams),
    unit: "grams",
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

      const gramsValue =
        ingredient.unit === "servings" && ingredient.product.servingSizeG
          ? quantity * ingredient.product.servingSizeG
          : quantity;

      return calcProductNutrition(ingredient.product, gramsValue);
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

export function buildRecipePayloadItems(ingredients: RecipeIngredientDraft[]) {
  return ingredients
    .map((ingredient) => {
      const quantity = parseFloat(ingredient.grams.replace(",", "."));

      const grams =
        ingredient.unit === "servings" && ingredient.product.servingSizeG
          ? quantity * ingredient.product.servingSizeG
          : quantity;

      return {
        productId: ingredient.product.id,
        grams,
      };
    })
    .filter((item) => !Number.isNaN(item.grams) && item.grams > 0);
}
