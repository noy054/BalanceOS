export type AnnouncementKind = "UPDATE" | "NOTICE" | "IMPORTANT";
export type AnnouncementDisplay = "BANNER" | "POPUP";
export type AnnouncementActionType = "NONE" | "ROUTE" | "URL";

export const ANNOUNCEMENT_ROUTES = [
  "HOME",
  "PANTRY",
  "ADD_MEAL",
  "STATISTICS",
  "SETTINGS",
  "NUTRITION_TARGETS",
  "LANGUAGE_DISPLAY",
  "NOTIFICATIONS",
  "ABOUT",
] as const;

export type AnnouncementRoute = (typeof ANNOUNCEMENT_ROUTES)[number];

export const ANNOUNCEMENT_PLATFORMS = ["ios", "android", "web"] as const;
export type AnnouncementPlatform = (typeof ANNOUNCEMENT_PLATFORMS)[number];

export type AnnouncementContent = {
  kind: AnnouncementKind;
  display: AnnouncementDisplay;
  titleHe: string;
  titleEn: string;
  bodyHe: string;
  bodyEn: string;
  actionType: AnnouncementActionType;
  actionTarget: string | null;
  actionLabelHe: string | null;
  actionLabelEn: string | null;
};

export type ActiveAnnouncement = AnnouncementContent & {
  id: string;
  publishAt: string | null;
  expiresAt: string | null;
  seen: boolean;
};
