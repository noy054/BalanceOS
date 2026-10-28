export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type ProductNutritionSource = {
  nutritionBasis?: string | null;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  caloriesPerServing?: number | null;
  proteinPerServing?: number | null;
  carbsPerServing?: number | null;
  fatPerServing?: number | null;
  fiberPerServing?: number | null;
  servingSizeG?: number | null;
};

export type ProductAmount = {
  grams?: number | null;
  servings?: number | null;
};

export type MacroValues = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export const ZERO_TOTALS: NutritionTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
};

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function per100g(p: ProductNutritionSource): MacroValues | null {
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
    fiber: p.fiberPer100g ?? 0,
  };
}

function perServing(p: ProductNutritionSource): MacroValues | null {
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
    fiber: p.fiberPerServing ?? 0,
  };
}

function servingGrams(p: ProductNutritionSource): number | null {
  return p.servingSizeG != null && p.servingSizeG > 0 ? p.servingSizeG : null;
}

function scale(values: MacroValues, factor: number): MacroValues {
  return {
    calories: values.calories * factor,
    protein: values.protein * factor,
    carbs: values.carbs * factor,
    fat: values.fat * factor,
    fiber: values.fiber * factor,
  };
}

export function roundTotals(values: MacroValues): NutritionTotals {
  return {
    calories: Math.round(values.calories),
    protein: round1(values.protein),
    carbs: round1(values.carbs),
    fat: round1(values.fat),
    fiber: round1(values.fiber),
  };
}

export function hasCompleteNutrition(p: ProductNutritionSource): boolean {
  return p.nutritionBasis === 'PER_SERVING'
    ? perServing(p) !== null
    : per100g(p) !== null;
}

export function supportsGrams(p: ProductNutritionSource): boolean {
  return (
    per100g(p) !== null || (perServing(p) !== null && servingGrams(p) !== null)
  );
}

export function supportsServings(p: ProductNutritionSource): boolean {
  return (
    perServing(p) !== null || (per100g(p) !== null && servingGrams(p) !== null)
  );
}

export function productNutrition(
  p: ProductNutritionSource,
  amount: ProductAmount,
): NutritionTotals | null {
  const raw = rawProductNutrition(p, amount);
  return raw ? roundTotals(raw) : null;
}

export function rawProductNutrition(
  p: ProductNutritionSource,
  amount: ProductAmount,
): MacroValues | null {
  const base100 = per100g(p);
  const baseServing = perServing(p);
  const grams = servingGrams(p);

  if (amount.servings != null && amount.servings > 0) {
    if (p.nutritionBasis === 'PER_SERVING' && baseServing) {
      return scale(baseServing, amount.servings);
    }
    if (base100 && grams) {
      return scale(base100, (amount.servings * grams) / 100);
    }
    if (baseServing) {
      return scale(baseServing, amount.servings);
    }
    return null;
  }

  if (amount.grams != null && amount.grams > 0) {
    if (base100) {
      return scale(base100, amount.grams / 100);
    }
    if (baseServing && grams) {
      return scale(baseServing, amount.grams / grams);
    }
    return null;
  }

  return null;
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
    { ...ZERO_TOTALS },
  );
}
