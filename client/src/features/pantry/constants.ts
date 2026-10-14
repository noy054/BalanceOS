export const PANTRY_ENDPOINTS = {
  BASE: "/pantry/products",
  BY_ID: (id: string) => `/pantry/products/${id}`,
  FROM_CATALOG: (catalogItemId: string) =>
    `/pantry/products/from-catalog/${encodeURIComponent(catalogItemId)}`,
} as const;

export const PANTRY_PAGE_SIZE = 50;

export const PRODUCT_CATALOG_ENDPOINTS = {
  SEARCH: "/product-catalog/search",
  BY_ID: (id: string) => `/product-catalog/${encodeURIComponent(id)}`,
} as const;

export const PRODUCT_CATALOG_QUERY_KEYS = {
  search: (q: string) => ["product-catalog", "search", q] as const,
  detail: (id: string) => ["product-catalog", id] as const,
};

export const BARCODE_ENDPOINTS = {
  RESOLVE: (barcode: string) => `/barcode/${encodeURIComponent(barcode)}/resolve`,
} as const;

export const BARCODE_QUERY_KEYS = {
  all: ["barcode"] as const,
  resolve: (barcode: string) => ["barcode", "resolve", barcode] as const,
};

/** Catalog data rarely changes; pantry mutations invalidate these results explicitly */
export const BARCODE_RESOLVE_STALE_TIME = 10 * 60 * 1000;

/** GTIN formats only — the server rejects anything else */
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
  /** Prefix for every product query — invalidate this after any product mutation */
  list: ["pantry", "products"] as const,
  /** Paginated list, kept under its own segment so a search term never collides with a product id */
  pages: (search: string) => ["pantry", "products", "pages", search] as const,
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
