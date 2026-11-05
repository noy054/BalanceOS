import { NutritionBasis } from "../pantry/types";

export type ReportTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type ReportItem = {
  name: string;
  kind: "PRODUCT" | "RECIPE" | "SAVED_MEAL";
  grams: number | null;
  servings: number | null;
  milliliters?: number | null;
  serving: {
    nutritionBasis: NutritionBasis;
    servingSizeG: number | null;
    servingSizeMl?: number | null;
    servingQuantity: number | null;
    servingUnit: string | null;
  } | null;
  totals: ReportTotals;
};

export type ReportMeal = {
  mealType: string;
  totals: ReportTotals;
  items: ReportItem[];
};

export type ReportDay = {
  date: string;
  logged: boolean;
  totals: ReportTotals;
  targets: ReportTotals;
  meals: ReportMeal[];
};

export type NutritionReport = {
  from: string;
  to: string;
  rangeDays: number;
  loggedDays: number;
  totals: ReportTotals;
  averages: ReportTotals;
  averageTargets: ReportTotals;
  days: ReportDay[];
};

export type ReportPeriod = "day" | "week" | "month";
