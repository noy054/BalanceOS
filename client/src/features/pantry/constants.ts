export const PANTRY_ENDPOINTS = {
  BASE: "/pantry/products",
  BY_ID: (id: string) => `/pantry/products/${id}`,
  FROM_CATALOG: (catalogItemId: string) =>
    `/pantry/products/from-catalog/${encodeURIComponent(catalogItemId)}`,
} as const;

export const PANTRY_PAGE_SIZE = 50;

export const FOOD_IMAGE_ENDPOINTS = {
  UPLOAD: "/food-images",
  FILE: (file: string) => `/food-images/${encodeURIComponent(file)}`,
};

export const FOOD_IMAGE_QUERY_KEYS = {
  file: (ref: string) => ["food-image", ref] as const,
};

export const CATALOG_ENDPOINTS = {
  BY_ID: (id: string) => `/product-catalog/${encodeURIComponent(id)}`,
  DEPARTMENTS: "/product-catalog/departments",
  BROWSE: "/product-catalog/browse",
  SUBCATEGORIES: (department: string) =>
    `/product-catalog/departments/${encodeURIComponent(department)}/subcategories`,
} as const;

export const CATALOG_QUERY_KEYS = {
  detail: (id: string) => ["product-catalog", id] as const,
  departments: ["product-catalog", "departments"] as const,
  browseAll: ["product-catalog", "browse"] as const,
  subcategories: (department: string) =>
    ["product-catalog", "departments", department, "subcategories"] as const,
  browse: (department: string | null, search: string, subcategory: string | null = null) =>
    ["product-catalog", "browse", department ?? "all", subcategory ?? "all", search] as const,
};

export const CATALOG_BROWSE_PAGE_SIZE = 30;

export const BARCODE_ENDPOINTS = {
  RESOLVE: (barcode: string) => `/barcode/${encodeURIComponent(barcode)}/resolve`,
} as const;

export const BARCODE_QUERY_KEYS = {
  all: ["barcode"] as const,
  resolve: (barcode: string) => ["barcode", "resolve", barcode] as const,
};

export const BARCODE_RESOLVE_STALE_TIME = 10 * 60 * 1000;

export const SCANNABLE_BARCODE_TYPES = ["ean13", "ean8", "upc_a"] as const;

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
  pages: (search: string, sort: string = "newest") => ["pantry", "products", "pages", search, sort] as const,
  detail: (id: string) => ["pantry", "products", "detail", id] as const,
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
