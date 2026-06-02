export const PANTRY_ENDPOINTS = {
  BASE: "/pantry/products",
  BY_ID: (id: string) => `/pantry/products/${id}`,
  BARCODE: (barcode: string) => `/pantry/products/barcode/${barcode}`,
} as const;

export const RECIPE_ENDPOINTS = {
  BASE: "/pantry/recipes",
  BY_ID: (id: string) => `/pantry/recipes/${id}`,
} as const;

export const SAVED_MEAL_ENDPOINTS = {
  BASE: "/pantry/saved-meals",
  BY_ID: (id: string) => `/pantry/saved-meals/${id}`,
} as const;

export const PANTRY_QUERY_KEYS = {
  list: ["pantry", "products"] as const,
  detail: (id: string) => ["pantry", "products", id] as const,
};

export const RECIPE_QUERY_KEYS = {
  list: ["pantry", "recipes"] as const,
  detail: (id: string) => ["pantry", "recipes", id] as const,
};

export const SAVED_MEAL_QUERY_KEYS = {
  list: ["pantry", "saved-meals"] as const,
  detail: (id: string) => ["pantry", "saved-meals", id] as const,
};

import { MealType } from "./types";

export const MEAL_TYPES: MealType[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK_1",
  "SNACK_2",
];
