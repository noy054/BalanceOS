import { router } from "expo-router";

import { ADMIN_ROUTES } from "../constants";
import { AdminHistoryEntry } from "../types";

export function openHistoryEntity(entry: AdminHistoryEntry) {
  switch (entry.entityType) {
    case "CATALOG_SUBMISSION":
      router.push(ADMIN_ROUTES.submission(entry.entityId));
      return;
    case "CATALOG_ITEM":
      router.push(ADMIN_ROUTES.catalogItem(entry.entityId));
      return;
    case "ANNOUNCEMENT":
      if (entry.action !== "ANNOUNCEMENT_DELETED") {
        router.push(ADMIN_ROUTES.announcement(entry.entityId));
      }
      return;
  }
}

export function readParam<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : null;
}
