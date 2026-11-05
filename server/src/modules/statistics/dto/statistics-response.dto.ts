import { StatRange } from './statistics-query.dto';

export type MacroStat = {
  avg: number;
  target: number;
  pct: number;
};

export type NutrientTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type DayTrendPoint = {
  date: string;
  logged: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  target: number;
  targets: NutrientTargets;
};

export type MealDistributionItem = {
  mealType: string;
  avgCalories: number;
  pct: number;
};

export type FoodItem = {
  name: string;
  totalCalories: number;
  count: number;
  imageUrl: string | null;
};

export type MostUsedFood = {
  name: string;
  count: number;
  avgCalories: number;
  imageUrl: string | null;
};

export type StatisticsResponseDto = {
  range: StatRange;
  startDate: string;
  endDate: string;

  summary: {
    avgCalories: number;
    targetCalories: number;
    avgProtein: number;
    targetProtein: number;
    calorieBalance: number;
    avgDailyCalorieGap: number;
    proteinGap: number;
    onTargetDays: number;
    totalDays: number;
    loggedDays: number;
    rangeDays: number;
    nutritionAccuracy: number;
  };

  dailyTrend: DayTrendPoint[];

  macroAccuracy: {
    calories: MacroStat;
    protein: MacroStat;
    carbs: MacroStat;
    fat: MacroStat;
    fiber: MacroStat;
  };

  mealDistribution: MealDistributionItem[];

  topCalorieSources: FoodItem[];
  mostUsedFoods: MostUsedFood[];
};
