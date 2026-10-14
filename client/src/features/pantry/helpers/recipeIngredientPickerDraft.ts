import { PantryProduct } from "../types";

export type PickerDraft = {
  product: PantryProduct;
  quantity: string;
  unit: "grams" | "servings";
};

export type RecipeIngredientSelection = {
  product: PantryProduct;
  quantity: string;
  unit: "grams" | "servings";
};
