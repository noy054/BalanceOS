import { AnnouncementContent, AnnouncementPlatform } from "../announcements/types";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type AdminPerson = {
  id: string;
  email: string;
  fullName: string;
};

export type AdminEntityType = "CATALOG_SUBMISSION" | "CATALOG_ITEM" | "ANNOUNCEMENT";

export type AdminHistoryEntry = {
  id: string;
  action: string;
  entityType: AdminEntityType;
  entityId: string;
  summary: string | null;
  details: JsonValue;
  createdAt: string;
  actor: AdminPerson | null;
};

export type AdminOverview = {
  submissions: { pendingCorrections: number; pendingNewProducts: number };
  catalog: { active: number; archived: number };
  announcements: { active: number; scheduled: number; drafts: number };
  recentActivity: AdminHistoryEntry[];
};

export type AnnouncementState = "DRAFT" | "SCHEDULED" | "ACTIVE" | "EXPIRED" | "ARCHIVED";

export type AdminAnnouncement = AnnouncementContent & {
  id: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  state: AnnouncementState;
  platforms: AnnouncementPlatform[];
  minAppVersion: string | null;
  maxAppVersion: string | null;
  publishAt: string | null;
  expiresAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: AdminPerson | null;
  updatedBy: AdminPerson | null;
};

export type AdminAnnouncementDetail = AdminAnnouncement & {
  stats: { seen: number; dismissed: number };
  history: AdminHistoryEntry[];
};

export type AnnouncementPayload = AnnouncementContent & {
  platforms: AnnouncementPlatform[];
  minAppVersion: string | null;
  maxAppVersion: string | null;
  publishAt: string | null;
  expiresAt: string | null;
};
