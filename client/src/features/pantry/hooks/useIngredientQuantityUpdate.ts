import { useState } from "react";

import { AmountPayload, AmountUnit, amountFromStored, ServingSource } from "../helpers/serving";
import { IngredientEditTarget, useIngredientEdit } from "../ingredientEditStore";
import { SavedMealPayloadItem } from "../helpers/savedMealDraft";
import { useRecipe, useUpdateRecipe } from "./useRecipes";
import { useSavedMeal, useUpdateSavedMeal } from "./useSavedMeals";

type BaseContext = {
  target: IngredientEditTarget;
  amount: string;
  unit: AmountUnit;
  parentName: string | null;
};

export type IngredientContext =
  | (BaseContext & { mode: "draft"; key: string })
  | (BaseContext & { mode: "saved"; parentId: string; itemId: string });

function stored(item: { grams?: number | null; servings?: number | null; milliliters?: number | null }): AmountPayload {
  if (item.grams != null) return { grams: item.grams };
  if (item.milliliters != null) return { milliliters: item.milliliters };
  if (item.servings != null) return { servings: item.servings };
  return {};
}

export function useIngredientQuantityUpdate(context: IngredientContext | null) {
  const savedMealId = context?.mode === "saved" && context.target === "savedMeal" ? context.parentId : "";
  const recipeId = context?.mode === "saved" && context.target === "recipe" ? context.parentId : "";
  const { data: meal } = useSavedMeal(savedMealId);
  const { data: recipe } = useRecipe(recipeId);
  const updateMeal = useUpdateSavedMeal(savedMealId);
  const updateRecipe = useUpdateRecipe(recipeId);
  const setPending = useIngredientEdit((state) => state.setPending);
  const [isSaving, setIsSaving] = useState(false);

  const parentName = context?.parentName || meal?.name || recipe?.name || null;

  async function apply(product: ServingSource, amount: AmountPayload): Promise<boolean> {
    if (!context) return false;

    if (context.mode === "draft") {
      const next = amountFromStored(product, amount);
      setPending(context.target, { key: context.key, amount: next.amount, unit: next.unit });
      return true;
    }

    setIsSaving(true);
    try {
      if (context.target === "savedMeal") {
        if (!meal) return false;
        const items = meal.items.flatMap((item): SavedMealPayloadItem[] => {
          if (item.productId && item.product) {
            return [{ productId: item.productId, ...(item.id === context.itemId ? amount : stored(item)) }];
          }
          if (item.recipeId && item.recipe) {
            return [{ recipeId: item.recipeId, servings: item.servings ?? 1 }];
          }
          return [];
        });
        await updateMeal.mutateAsync({ items });
        return true;
      }

      if (!recipe) return false;
      const items = recipe.items.map((item) => ({
        productId: item.productId,
        ...(item.id === context.itemId ? amount : stored(item)),
      }));
      await updateRecipe.mutateAsync({ items });
      return true;
    } catch {
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return { parentName, apply, isSaving, ready: context?.mode !== "saved" || Boolean(meal || recipe) };
}
