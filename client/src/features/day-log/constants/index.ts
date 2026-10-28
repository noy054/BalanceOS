export const DAY_LOG_ENDPOINTS = {
  DAY: (date: string) => `/day-logs/date/${date}`,
  DAY_MEALS: (date: string) => `/day-logs/date/${date}/meals`,
  ADD_MEAL_ITEM: (date: string) => `/day-logs/date/${date}/meal-items`,
  CALENDAR: '/day-logs/calendar',
  REMOVE_MEAL_ITEM: (itemId: string) => `/day-logs/meal-items/${itemId}`,
  REMOVE_MEAL_ENTRY: (mealEntryId: string) => `/day-logs/meal-entries/${mealEntryId}`,
  COPY_MEAL_ENTRY: (mealEntryId: string) => `/day-logs/meal-entries/${mealEntryId}/copy`,
} as const;

export const DAY_LOG_QUERY_KEYS = {
  all: ['day-log'] as const,
  day: (date: string) => ['day-log', 'day', date] as const,
  meals: (date: string) => ['day-log', 'day', date, 'meals'] as const,
  calendar: (from: string, to: string) => ['day-log', 'calendar', from, to] as const,
};
