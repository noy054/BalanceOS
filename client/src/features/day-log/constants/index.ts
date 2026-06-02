export const DAY_LOG_ENDPOINTS = {
  TODAY: '/day-logs/today',
  ADD_MEAL_ITEM: '/day-logs/today/meal-items',
  REMOVE_MEAL_ITEM: (itemId: string) => `/day-logs/meal-items/${itemId}`,
} as const;

export const DAY_LOG_QUERY_KEYS = {
  today: ['day-log', 'today'] as const,
};
