export const ANALYTICS_FEATURES = [
  'food_logging',
  'barcode',
  'super',
  'pantry',
  'calculator',
  'saved_meals',
  'recipes',
  'statistics',
  'pdf_export',
] as const;

export type AnalyticsFeature = (typeof ANALYTICS_FEATURES)[number];

export const ANALYTICS_ACTIONS: Record<string, AnalyticsFeature> = {
  meal_item_added: 'food_logging',
  meal_item_updated: 'food_logging',
  meal_item_removed: 'food_logging',
  meal_copied: 'food_logging',
  barcode_scanned: 'barcode',
  super_opened: 'super',
  super_product_added: 'super',
  super_product_removed: 'super',
  product_created: 'pantry',
  product_updated: 'pantry',
  product_deleted: 'pantry',
  calculator_added_to_meal: 'calculator',
  saved_meal_created: 'saved_meals',
  saved_meal_updated: 'saved_meals',
  saved_meal_logged: 'saved_meals',
  recipe_created: 'recipes',
  recipe_updated: 'recipes',
  recipe_logged: 'recipes',
  statistics_viewed: 'statistics',
  pdf_exported: 'pdf_export',
};

export const ANALYTICS_STATUSES = ['completed', 'failed'] as const;

export const MAX_EVENTS_PER_BATCH = 50;
export const MAX_EVENT_AGE_DAYS = 7;
export const MAX_DASHBOARD_DAYS = 366;

export const DEFAULT_EXCLUDED_EMAIL_PATTERNS = [
  '%@example.com',
  '%@example.org',
  '%@test.com',
  '%@balanceos.test',
  '%+test@%',
];
