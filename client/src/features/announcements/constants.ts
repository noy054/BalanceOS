import type { Href } from "expo-router";

import { AnnouncementRoute } from "./types";

export const ANNOUNCEMENT_ENDPOINTS = {
  ACTIVE: "/announcements/active",
  SEEN: (id: string) => `/announcements/${encodeURIComponent(id)}/seen`,
  DISMISS: (id: string) => `/announcements/${encodeURIComponent(id)}/dismiss`,
} as const;

export const ANNOUNCEMENT_QUERY_KEYS = {
  active: ["announcements", "active"] as const,
};

export const ANNOUNCEMENT_ROUTE_PATHS: Record<AnnouncementRoute, Href> = {
  HOME: "/(app)/dashboard",
  PANTRY: "/(app)/pantry",
  ADD_MEAL: "/(app)/meal/add-item",
  STATISTICS: "/(app)/statistics",
  SETTINGS: "/(app)/settings",
  NUTRITION_TARGETS: "/(app)/settings/nutrition-targets",
  LANGUAGE_DISPLAY: "/(app)/settings/language-display",
  NOTIFICATIONS: "/(app)/settings/notifications",
  ABOUT: "/(app)/settings/about",
};
