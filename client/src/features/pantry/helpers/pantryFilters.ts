import { ProductCategory } from "../types";

export const PANTRY_CHIP_FOCUSES = ["all", "protein", "carbs"] as const;
export type PantryChipFocus = (typeof PANTRY_CHIP_FOCUSES)[number];

export const FOOD_CATEGORIES = ["all", "protein", "carbs", "fat", "vegetables", "fruits"] as const;
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];
export const MACRO_CATEGORIES: ReadonlyArray<FoodCategory> = ["all", "protein", "carbs", "fat"];

type MacroTotals = { protein: number; carbs: number; fat: number };

export function matchesFocus(totals: MacroTotals | null | undefined, focus: FoodCategory) {
  if (focus === "all") return true;
  if (!totals) return false;
  const protein = totals.protein * 4;
  const carbs = totals.carbs * 4;
  const fat = totals.fat * 9;
  if (focus === "protein") return protein > 0 && protein >= carbs && protein >= fat;
  if (focus === "carbs") return carbs > 0 && carbs >= protein && carbs >= fat;
  if (focus === "fat") return fat > 0 && fat >= protein && fat >= carbs;
  return false;
}

export function matchesCategory(types: ReadonlyArray<string> | null | undefined, category: ProductCategory | null) {
  if (!category || !types || types.length === 0) return true;
  return types.some((type) => (category === "SNACK" ? type.startsWith("SNACK") : type === category));
}
