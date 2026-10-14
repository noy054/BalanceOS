export const DAY_LOG_ENDPOINTS = {
  TODAY: '/day-logs/today',
  TODAY_MEALS: '/day-logs/today/meals',
  ADD_MEAL_ITEM: '/day-logs/today/meal-items',
  REMOVE_MEAL_ITEM: (itemId: string) => `/day-logs/meal-items/${itemId}`,
  COPY_MEAL_ENTRY: (mealEntryId: string) => `/day-logs/meal-entries/${mealEntryId}/copy`,
} as const;

export const DAY_LOG_QUERY_KEYS = {
  today: ['day-log', 'today'] as const,
  todayMeals: ['day-log', 'today', 'meals'] as const,
};
