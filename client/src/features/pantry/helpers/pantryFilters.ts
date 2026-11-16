import { ProductCategory } from "../types";

export const PANTRY_CHIP_FOCUSES = ["all", "protein", "carbs", "fat"] as const;
export type PantryChipFocus = (typeof PANTRY_CHIP_FOCUSES)[number];

export const FOOD_CATEGORIES = ["all", "protein", "carbs", "fat", "vegetables", "fruits"] as const;
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export function matchesCategory(types: ReadonlyArray<string> | null | undefined, category: ProductCategory | null) {
  if (!category || !types || types.length === 0) return true;
  return types.some((type) => (category === "SNACK" ? type.startsWith("SNACK") : type === category));
}
