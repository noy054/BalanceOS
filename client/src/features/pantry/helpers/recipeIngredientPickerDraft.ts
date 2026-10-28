import { PantryProduct } from "../types";
import { AmountUnit } from "./serving";

export type PickerDraft = {
  product: PantryProduct;
  quantity: string;
  unit: AmountUnit;
};

export type RecipeIngredientSelection = {
  product: PantryProduct;
  quantity: string;
  unit: AmountUnit;
};
