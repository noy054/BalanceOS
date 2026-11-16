import { NutritionTotals, PortionPlan, PortionValues, RecipeYieldFields } from "../types";
import { RecipeIngredientDraft } from "./recipeDraft";
import { toAmountPayload } from "./serving";

type WeighableItem = {
  grams?: number | null;
  servings?: number | null;
  milliliters?: number | null;
  weightG?: number | null;
  product: { servingSizeG?: number | null; servingSizeMl?: number | null };
};

export function itemWeight(item: WeighableItem): number | null {
  if (item.grams) return item.grams;
  if (item.weightG) return item.weightG;
  const servingG = item.product.servingSizeG ?? null;
  if (item.servings && servingG) return item.servings * servingG;
  const servingMl = item.product.servingSizeMl ?? null;
  if (item.milliliters && servingG && servingMl) return (item.milliliters * servingG) / servingMl;
  return null;
}

function parseAmount(value: string | undefined) {
  const parsed = parseFloat((value ?? "").replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function draftWeight(ingredient: RecipeIngredientDraft): number | null {
  const quantity = parseAmount(ingredient.grams);
  if (!quantity) return null;
  return itemWeight({
    ...toAmountPayload(ingredient.product, quantity, ingredient.unit),
    weightG: parseAmount(ingredient.weightG),
    product: ingredient.product,
  });
}

export function draftRawWeight(ingredients: RecipeIngredientDraft[]): number | null {
  if (ingredients.length === 0) return null;
  let total = 0;
  for (const ingredient of ingredients) {
    const weight = draftWeight(ingredient);
    if (weight === null) return null;
    total += weight;
  }
  return round1(total);
}

const EPSILON = 1e-6;

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function portionValues(totals: NutritionTotals, fraction: number, cookedWeightG: number | null): PortionValues {
  return {
    fraction,
    grams: cookedWeightG ? round1(cookedWeightG * fraction) : null,
    calories: Math.round(totals.calories * fraction),
    protein: round1(totals.protein * fraction),
    carbs: round1(totals.carbs * fraction),
    fat: round1(totals.fat * fraction),
    fiber: round1((totals.fiber ?? 0) * fraction),
  };
}

export function netCookedWeight(input: {
  cookedWeightG?: number | null;
  emptyPotWeightG?: number | null;
  potWithFoodWeightG?: number | null;
}): number | null | "invalid" {
  const pot = input.emptyPotWeightG ?? null;
  const total = input.potWithFoodWeightG ?? null;
  if (pot !== null || total !== null) {
    if (pot === null || total === null || total <= pot) return "invalid";
    return round1(total - pot);
  }
  return input.cookedWeightG ?? null;
}

export function planPortions(totals: NutritionTotals, setup: RecipeYieldFields): PortionPlan {
  if (!setup.portionMode) return { status: "none" };
  const weight = setup.cookedWeightG ?? setup.rawWeightG ?? null;
  const weightBasis = setup.cookedWeightG ? ("cooked" as const) : setup.rawWeightG ? ("raw" as const) : null;

  if (setup.portionMode === "COUNT") {
    const count = setup.portionCount ?? 0;
    if (!Number.isInteger(count) || count < 1) return { status: "incomplete", issue: "count" };
    const portion = portionValues(totals, 1 / count, weight);
    return {
      status: "ok",
      mode: "COUNT",
      weightBasis,
      portion,
      basePortion: portion,
      fullPortions: count,
      leftover: null,
      leftoverMode: setup.leftoverMode ?? "UNALLOCATED",
    };
  }

  const value = setup.portionTargetValue ?? 0;
  if (!setup.portionTarget || value <= 0) return { status: "incomplete", issue: "targetValue" };
  let fraction: number;
  if (setup.portionTarget === "GRAMS") {
    if (!weight) return { status: "incomplete", issue: "weight" };
    fraction = value / weight;
  } else if (setup.portionTarget === "CALORIES") {
    if (totals.calories <= 0) return { status: "incomplete", issue: "calories" };
    fraction = value / totals.calories;
  } else {
    if (totals.protein <= 0) return { status: "incomplete", issue: "protein" };
    fraction = value / totals.protein;
  }

  const fullPortions = Math.floor(1 / fraction + EPSILON);
  if (fullPortions < 1) return { status: "incomplete", issue: "tooLarge" };
  const remainder = 1 - fullPortions * fraction;
  const basePortion = portionValues(totals, fraction, weight);
  const leftover = remainder > EPSILON ? portionValues(totals, remainder, weight) : null;
  const leftoverMode = setup.leftoverMode ?? "UNALLOCATED";
  const portion = leftover && leftoverMode === "REDISTRIBUTE" ? portionValues(totals, 1 / fullPortions, weight) : basePortion;
  return { status: "ok", mode: "TARGET", weightBasis, portion, basePortion, fullPortions, leftover, leftoverMode };
}
