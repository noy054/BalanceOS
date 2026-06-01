export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function calcProductNutrition(
  product: {
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g: number | null;
  },
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
