export const LOGGABLE_MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK_1", "SNACK_2"] as const;

export type LoggableMealType = (typeof LOGGABLE_MEAL_TYPES)[number];

export function mealTypeForTime(now: Date): LoggableMealType {
  const hour = now.getHours();
  if (hour < 11) return "BREAKFAST";
  if (hour < 16) return "LUNCH";
  if (hour < 21) return "DINNER";
  return "SNACK_1";
}
