import { CalculatedNutrition, NutritionTotals, PantryProduct } from '../types';

export function calculateNutritionForGrams(
  product: PantryProduct,
  grams: number,
): CalculatedNutrition {
  const factor = grams / 100;
  return {
    calories: Math.round(product.caloriesPer100g * factor),
    protein: round1(product.proteinPer100g * factor),
    carbs: round1(product.carbsPer100g * factor),
    fat: round1(product.fatPer100g * factor),
    fiber:
      product.fiberPer100g != null ? round1(product.fiberPer100g * factor) : null,
  };
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

export function calcProductNutrition(
  product: Pick<PantryProduct, 'caloriesPer100g' | 'proteinPer100g' | 'carbsPer100g' | 'fatPer100g' | 'fiberPer100g'>,
  grams: number,
): NutritionTotals {
  const f = grams / 100;
  return {
    calories: Math.round(product.caloriesPer100g * f),
    protein: round1(product.proteinPer100g * f),
    carbs: round1(product.carbsPer100g * f),
    fat: round1(product.fatPer100g * f),
    fiber: round1((product.fiberPer100g ?? 0) * f),
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
