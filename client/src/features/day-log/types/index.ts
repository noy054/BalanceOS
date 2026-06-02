export type MacroKey = 'protein' | 'carbs' | 'fat' | 'fiber';

export type MacroItem = {
  key: MacroKey;
  current: number;
  target: number;
};

export type DayLogSummary = {
  date: string;
  caloriesEaten: number;
  caloriesTarget: number;
  macros: MacroItem[];
};

// ── Server response types ─────────────────────────────────────────────────────

export type DayLogTargetsSnapshot = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type DayLogResponse = {
  id: string;
  date: string;
  targetsSnapshot: DayLogTargetsSnapshot;
  caloriesTotal: number;
  proteinTotal: number;
  carbsTotal: number;
  fatTotal: number;
  fiberTotal: number;
};

export type AddMealItemPayload = {
  mealType: string;
  pantryProductId?: string;
  grams?: number;
  pantryRecipeId?: string;
  servings?: number;
  savedMealId?: string;
};
