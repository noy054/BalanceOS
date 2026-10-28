import { CatalogSubmissionKind, CatalogSubmissionStatus } from "./types";

export const ADMIN_CATALOG_ENDPOINTS = {
  SUMMARY: "/admin/catalog/summary",
  SUBMISSIONS: "/admin/catalog/submissions",
  BY_ID: (id: string) => `/admin/catalog/submissions/${encodeURIComponent(id)}`,
  APPROVE: (id: string) => `/admin/catalog/submissions/${encodeURIComponent(id)}/approve`,
  REJECT: (id: string) => `/admin/catalog/submissions/${encodeURIComponent(id)}/reject`,
} as const;

export const ADMIN_CATALOG_QUERY_KEYS = {
  all: ["admin-catalog"] as const,
  summary: ["admin-catalog", "summary"] as const,
  list: (status: CatalogSubmissionStatus, kind: CatalogSubmissionKind) =>
    ["admin-catalog", "list", status, kind] as const,
  detail: (id: string) => ["admin-catalog", "detail", id] as const,
};
