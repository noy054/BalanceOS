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
  id: string | null;
  date: string;
  targetsSnapshot: DayLogTargetsSnapshot;
  caloriesTotal: number;
  proteinTotal: number;
  carbsTotal: number;
  fatTotal: number;
  fiberTotal: number;
};

export type MealMacros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type MealItemSource = "PRODUCT" | "RECIPE" | "SAVED_MEAL";

export type MealItemServing = {
  nutritionBasis: "PER_100G" | "PER_SERVING";
  servingSizeG: number | null;
  servingQuantity: number | null;
  servingUnit: string | null;
};

export type MealItemSummary = MealMacros & {
  id: string;
  name: string;
  source?: MealItemSource | null;
  grams?: number | null;
  servings?: number | null;
  serving?: MealItemServing | null;
};

export type UpdateMealItemPayload = {
  itemId: string;
  grams?: number;
  servings?: number;
};

export type MealEntrySummary = MealMacros & {
  id: string;
  mealType: string;
  items: MealItemSummary[];
};

export type DayLogMealsResponse = {
  meals: MealEntrySummary[];
};

export type DayLogCalendarDay = {
  date: string;
  calories: number;
  itemCount: number;
};

export type DayLogCalendarResponse = {
  days: DayLogCalendarDay[];
};

export type AddMealItemPayload = {
  mealType: string;
  pantryProductId?: string;
  grams?: number;
  pantryRecipeId?: string;
  servings?: number;
  savedMealId?: string;
};

export type CopyTarget = {
  kind: "meal" | "item";
  id: string;
  name: string;
};

export type CopyToDaysPayload = {
  target: CopyTarget;
  targetDates: string[];
};
