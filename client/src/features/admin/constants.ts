import { AdminEntityType, AnnouncementState } from "./types";

export type AnnouncementActionName = "publish" | "unpublish" | "archive" | "restore";

export const ADMIN_ENDPOINTS = {
  OVERVIEW: "/admin/overview",
  ACTIVITY: "/admin/activity",
  ANNOUNCEMENTS: "/admin/announcements",
  ANNOUNCEMENT: (id: string) => `/admin/announcements/${encodeURIComponent(id)}`,
  ANNOUNCEMENT_ACTION: (id: string, action: AnnouncementActionName) =>
    `/admin/announcements/${encodeURIComponent(id)}/${action}`,
} as const;

export const ADMIN_QUERY_KEYS = {
  all: ["admin"] as const,
  overview: ["admin", "overview"] as const,
  activity: (entityType: AdminEntityType | null) => ["admin", "activity", entityType] as const,
  announcementList: (state: AnnouncementState | null, q: string) =>
    ["admin", "announcements", "list", state, q] as const,
  announcement: (id: string) => ["admin", "announcements", "detail", id] as const,
};

export const ADMIN_ROUTES = {
  overview: "/(app)/settings/admin",
  activity: "/(app)/settings/admin/activity",
  submissions: "/(app)/settings/admin/submissions",
  submission: (id: string) => `/(app)/settings/admin/submissions/${encodeURIComponent(id)}`,
  catalog: "/(app)/settings/admin/catalog",
  catalogItem: (id: string) => `/(app)/settings/admin/catalog/${encodeURIComponent(id)}`,
  announcements: "/(app)/settings/admin/announcements",
  announcement: (id: string) => `/(app)/settings/admin/announcements/${encodeURIComponent(id)}`,
} as const;
