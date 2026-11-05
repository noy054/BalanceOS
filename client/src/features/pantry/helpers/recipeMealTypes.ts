import { MEAL_TYPES } from "../constants";
import { MealType, PantryRecipe } from "../types";

export function recipeMealTypes(recipe: Pick<PantryRecipe, "mealType" | "mealTypes">): MealType[] {
  const stored = recipe.mealTypes?.length
    ? recipe.mealTypes
    : recipe.mealType
      ? [recipe.mealType]
      : [];
  return MEAL_TYPES.filter((type) => stored.includes(type));
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= items.length) return items;
  const target = Math.max(0, Math.min(items.length - 1, to));
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved);
  return next;
}
