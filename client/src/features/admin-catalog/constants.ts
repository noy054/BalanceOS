import {
  CatalogItemState,
  CatalogSource,
  CatalogSubmissionKind,
  CatalogSubmissionStatus,
} from "./types";

const encode = encodeURIComponent;

export const ADMIN_CATALOG_ENDPOINTS = {
  SUMMARY: "/admin/catalog/summary",
  SUBMISSIONS: "/admin/catalog/submissions",
  BY_ID: (id: string) => `/admin/catalog/submissions/${encode(id)}`,
  APPROVE: (id: string) => `/admin/catalog/submissions/${encode(id)}/approve`,
  REJECT: (id: string) => `/admin/catalog/submissions/${encode(id)}/reject`,
  MERGE: (id: string) => `/admin/catalog/submissions/${encode(id)}/merge`,
  ITEMS: "/admin/catalog/items",
  ITEM: (id: string) => `/admin/catalog/items/${encode(id)}`,
  ARCHIVE_ITEM: (id: string) => `/admin/catalog/items/${encode(id)}/archive`,
  RESTORE_ITEM: (id: string) => `/admin/catalog/items/${encode(id)}/restore`,
} as const;

export const ADMIN_CATALOG_QUERY_KEYS = {
  all: ["admin-catalog"] as const,
  summary: ["admin-catalog", "summary"] as const,
  list: (status: CatalogSubmissionStatus, kind: CatalogSubmissionKind, q: string) =>
    ["admin-catalog", "list", status, kind, q] as const,
  detail: (id: string) => ["admin-catalog", "detail", id] as const,
  items: (state: CatalogItemState, source: CatalogSource | null, q: string) =>
    ["admin-catalog", "items", state, source, q] as const,
  item: (id: string) => ["admin-catalog", "item", id] as const,
};

export const CATALOG_SOURCES: CatalogSource[] = [
  "OPEN_FOOD_FACTS",
  "USDA_FDC",
  "MANUAL",
  "ADMIN",
  "INTERNAL",
];
