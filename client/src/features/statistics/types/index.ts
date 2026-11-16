export type StatRange = "7D" | "14D" | "30D";

export type MacroStat = {
  avg: number;
  target: number;
  pct: number;
};

export type NutrientKey = "calories" | "protein" | "carbs" | "fat" | "fiber";

export type NutrientTargets = Record<NutrientKey, number>;

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

export type FoodBasis = "serving" | "100g" | "100ml" | "meal";

export type TopFoodItem = {
  name: string;
  totalCalories: number;
  count: number;
  imageUrl: string | null;
  unitCalories: number | null;
  unitBasis: FoodBasis | null;
};

export type MostUsedFood = {
  name: string;
  count: number;
  avgCalories: number;
  imageUrl: string | null;
  isSnack: boolean;
};

export type StatisticsSummary = {
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

export type StatisticsResponse = {
  range: StatRange;
  startDate: string;
  endDate: string;
  summary: StatisticsSummary;
  dailyTrend: DayTrendPoint[];
  macroAccuracy: Record<NutrientKey, MacroStat>;
  mealDistribution: MealDistributionItem[];
  topCalorieSources: TopFoodItem[];
  mostUsedFoods: MostUsedFood[];
};
