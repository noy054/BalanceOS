import { CalculatedNutrition, NutritionTotals, ProductNutritionFields } from '../types';

export type NutritionSource = Pick<
  ProductNutritionFields,
  'caloriesPer100g' | 'proteinPer100g' | 'carbsPer100g' | 'fatPer100g' | 'fiberPer100g'
> &
  Partial<
    Pick<
      ProductNutritionFields,
      | 'nutritionBasis'
      | 'caloriesPerServing'
      | 'proteinPerServing'
      | 'carbsPerServing'
      | 'fatPerServing'
      | 'fiberPerServing'
      | 'servingSizeG'
    >
  >;

export type ProductAmount = {
  grams?: number | null;
  servings?: number | null;
};

type MacroValues = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
};

function per100g(p: NutritionSource): MacroValues | null {
  if (
    p.caloriesPer100g == null ||
    p.proteinPer100g == null ||
    p.carbsPer100g == null ||
    p.fatPer100g == null
  ) {
    return null;
  }
  return {
    calories: p.caloriesPer100g,
    protein: p.proteinPer100g,
    carbs: p.carbsPer100g,
    fat: p.fatPer100g,
    fiber: p.fiberPer100g ?? null,
  };
}

function perServing(p: NutritionSource): MacroValues | null {
  if (
    p.caloriesPerServing == null ||
    p.proteinPerServing == null ||
    p.carbsPerServing == null ||
    p.fatPerServing == null
  ) {
    return null;
  }
  return {
    calories: p.caloriesPerServing,
    protein: p.proteinPerServing,
    carbs: p.carbsPerServing,
    fat: p.fatPerServing,
    fiber: p.fiberPerServing ?? null,
  };
}

function servingGrams(p: NutritionSource): number | null {
  return p.servingSizeG != null && p.servingSizeG > 0 ? p.servingSizeG : null;
}

function scale(values: MacroValues, factor: number): CalculatedNutrition {
  return {
    calories: Math.round(values.calories * factor),
    protein: round1(values.protein * factor),
    carbs: round1(values.carbs * factor),
    fat: round1(values.fat * factor),
    fiber: values.fiber != null ? round1(values.fiber * factor) : null,
  };
}

export function hasCompleteNutrition(p: NutritionSource): boolean {
  return p.nutritionBasis === 'PER_SERVING' ? perServing(p) !== null : per100g(p) !== null;
}

export function supportsGrams(p: NutritionSource): boolean {
  return per100g(p) !== null || (perServing(p) !== null && servingGrams(p) !== null);
}

export function supportsServings(p: NutritionSource): boolean {
  return perServing(p) !== null || (per100g(p) !== null && servingGrams(p) !== null);
}

export function nutritionForAmount(
  p: NutritionSource,
  amount: ProductAmount,
): CalculatedNutrition | null {
  const base100 = per100g(p);
  const baseServing = perServing(p);
  const grams = servingGrams(p);

  if (amount.servings != null && amount.servings > 0) {
    if (p.nutritionBasis === 'PER_SERVING' && baseServing) {
      return scale(baseServing, amount.servings);
    }
    if (base100 && grams) return scale(base100, (amount.servings * grams) / 100);
    if (baseServing) return scale(baseServing, amount.servings);
    return null;
  }

  if (amount.grams != null && amount.grams > 0) {
    if (base100) return scale(base100, amount.grams / 100);
    if (baseServing && grams) return scale(baseServing, amount.grams / grams);
    return null;
  }

  return null;
}

export function nutritionPer100g(p: NutritionSource): CalculatedNutrition | null {
  return nutritionForAmount(p, { grams: 100 });
}

export function nutritionPerServing(p: NutritionSource): CalculatedNutrition | null {
  return nutritionForAmount(p, { servings: 1 });
}

export function calculateNutritionForGrams(
  product: NutritionSource,
  grams: number,
): CalculatedNutrition | null {
  return nutritionForAmount(product, { grams });
}

export function toTotals(nutrition: CalculatedNutrition | null): NutritionTotals {
  return {
    calories: nutrition?.calories ?? 0,
    protein: nutrition?.protein ?? 0,
    carbs: nutrition?.carbs ?? 0,
    fat: nutrition?.fat ?? 0,
    fiber: nutrition?.fiber ?? 0,
  };
}

export function calcProductNutrition(
  product: NutritionSource,
  amount: ProductAmount,
): NutritionTotals {
  return toTotals(nutritionForAmount(product, amount));
}

export function sumNutrition(items: NutritionTotals[]): NutritionTotals {
  return items.reduce(
    (acc, n) => ({
      calories: acc.calories + n.calories,
      protein: round1(acc.protein + n.protein),
      carbs: round1(acc.carbs + n.carbs),
      fat: round1(acc.fat + n.fat),
      fiber: round1(acc.fiber + n.fiber),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
