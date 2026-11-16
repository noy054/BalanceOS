import { useEffect, useMemo, useRef, useState } from "react";

import { draftRawWeight, draftWeight, netCookedWeight, planPortions } from "../helpers/recipePortions";
import { RecipeIngredientDraft } from "../helpers/recipeDraft";
import { LeftoverMode, NutritionTotals, PantryRecipe, PortionTarget, RecipeYieldFields } from "../types";

export type WeightMethod = "pot" | "net";
export type PortionChoice = "NONE" | "COUNT" | "TARGET";

function parsePositive(value: string): number | null {
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function text(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

export function useRecipeYieldForm(
  totals: NutritionTotals,
  ingredients: RecipeIngredientDraft[],
  existingRecipe?: PantryRecipe,
) {
  const [weightMethod, setWeightMethod] = useState<WeightMethod>("pot");
  const [emptyPot, setEmptyPot] = useState("");
  const [potWithFood, setPotWithFood] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [portionChoice, setPortionChoice] = useState<PortionChoice>("NONE");
  const [count, setCount] = useState("");
  const [target, setTarget] = useState<PortionTarget>("PROTEIN");
  const [targetValue, setTargetValue] = useState("");
  const [leftoverMode, setLeftoverMode] = useState<LeftoverMode | null>(null);
  const hydrated = useRef<string | null>(null);

  useEffect(() => {
    if (!existingRecipe || hydrated.current === existingRecipe.id) return;
    hydrated.current = existingRecipe.id;
    const usesPot = existingRecipe.emptyPotWeightG != null || existingRecipe.potWithFoodWeightG != null;
    setWeightMethod(usesPot || existingRecipe.cookedWeightG == null ? "pot" : "net");
    setEmptyPot(text(existingRecipe.emptyPotWeightG));
    setPotWithFood(text(existingRecipe.potWithFoodWeightG));
    setNetWeight(usesPot ? "" : text(existingRecipe.cookedWeightG));
    setPortionChoice(existingRecipe.portionMode ?? "NONE");
    setCount(text(existingRecipe.portionCount));
    setTarget(existingRecipe.portionTarget ?? "PROTEIN");
    setTargetValue(text(existingRecipe.portionTargetValue));
    setLeftoverMode(existingRecipe.leftoverMode ?? null);
  }, [existingRecipe]);

  const weightInput =
    weightMethod === "pot"
      ? { emptyPotWeightG: parsePositive(emptyPot), potWithFoodWeightG: parsePositive(potWithFood) }
      : { cookedWeightG: parsePositive(netWeight) };
  const potTouched = weightMethod === "pot" && (emptyPot.trim() !== "" || potWithFood.trim() !== "");
  const net = netCookedWeight(weightInput);
  const weightInvalid = potTouched && net === "invalid";
  const cookedWeightG = typeof net === "number" ? net : null;

  const rawWeightG = draftRawWeight(ingredients);
  const setup: RecipeYieldFields = {
    cookedWeightG,
    rawWeightG,
    portionMode: portionChoice === "NONE" ? null : portionChoice,
    portionCount: portionChoice === "COUNT" ? parsePositive(count) : null,
    portionTarget: portionChoice === "TARGET" ? target : null,
    portionTargetValue: portionChoice === "TARGET" ? parsePositive(targetValue) : null,
    leftoverMode,
  };

  const plan = useMemo(
    () => planPortions(totals, setup),
    [totals, setup.cookedWeightG, setup.rawWeightG, setup.portionMode, setup.portionCount, setup.portionTarget, setup.portionTargetValue, setup.leftoverMode],
  );

  const weightlessIngredients =
    plan.status === "incomplete" && plan.issue === "weight" && cookedWeightG === null
      ? ingredients.filter((ingredient) => draftWeight(ingredient) === null)
      : [];

  const needsLeftoverChoice = plan.status === "ok" && plan.leftover !== null && leftoverMode === null;

  function payload(): Omit<RecipeYieldFields, "rawWeightG"> {
    const weights =
      weightMethod === "pot" && cookedWeightG !== null
        ? { emptyPotWeightG: parsePositive(emptyPot), potWithFoodWeightG: parsePositive(potWithFood), cookedWeightG: null }
        : { emptyPotWeightG: null, potWithFoodWeightG: null, cookedWeightG: weightMethod === "net" ? cookedWeightG : null };
    return {
      ...weights,
      portionMode: setup.portionMode,
      portionCount: setup.portionMode === "COUNT" ? setup.portionCount : null,
      portionTarget: setup.portionTarget,
      portionTargetValue: setup.portionTargetValue,
      leftoverMode: plan.status === "ok" && plan.leftover ? leftoverMode : null,
    };
  }

  return {
    weightMethod,
    setWeightMethod,
    emptyPot,
    setEmptyPot,
    potWithFood,
    setPotWithFood,
    netWeight,
    setNetWeight,
    portionChoice,
    setPortionChoice,
    count,
    setCount,
    target,
    setTarget,
    targetValue,
    setTargetValue,
    leftoverMode,
    setLeftoverMode,
    cookedWeightG,
    rawWeightG,
    weightlessIngredients,
    weightInvalid,
    plan,
    needsLeftoverChoice,
    payload,
  };
}
