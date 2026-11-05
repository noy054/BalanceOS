import { SavedMeal } from "../types";

export function hasRemovedSavedMealItems(meal: SavedMeal) {
  return meal.items.some((item) => !item.product && !item.recipe);
}
