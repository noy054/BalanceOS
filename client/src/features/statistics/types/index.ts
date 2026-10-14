export type StatRange = "7D" | "14D" | "30D";

export type MacroStat = {
  avg: number;
  target: number;
  pct: number;
};

export type DayTrendPoint = {
  date: string;
  calories: number;
  target: number;
};

export type MealDistributionItem = {
  mealType: string;
  avgCalories: number;
  pct: number;
};

export type TopFoodItem = {
  name: string;
  totalCalories: number;
  count: number;
};

export type MostUsedFood = {
  name: string;
  count: number;
  avgCalories: number;
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
  macroAccuracy: {
    calories: MacroStat;
    protein: MacroStat;
    carbs: MacroStat;
    fat: MacroStat;
  };
  mealDistribution: MealDistributionItem[];
  topCalorieSources: TopFoodItem[];
  mostUsedFoods: MostUsedFood[];
};
