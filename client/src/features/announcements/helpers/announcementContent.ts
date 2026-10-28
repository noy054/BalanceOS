import { Linking, Platform } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";

import { ANNOUNCEMENT_ROUTE_PATHS } from "../constants";
import { ANNOUNCEMENT_ROUTES, AnnouncementContent, AnnouncementRoute } from "../types";

export function localizeAnnouncement(content: AnnouncementContent, language: string) {
  const hebrew = language.startsWith("he");
  return {
    title: hebrew ? content.titleHe : content.titleEn,
    body: hebrew ? content.bodyHe : content.bodyEn,
    actionLabel:
      content.actionType === "NONE"
        ? null
        : (hebrew ? content.actionLabelHe : content.actionLabelEn) || null,
  };
}

export function isAnnouncementRoute(value: string | null): value is AnnouncementRoute {
  return ANNOUNCEMENT_ROUTES.includes(value as AnnouncementRoute);
}

export function isSafeLink(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function canOpenAction(content: AnnouncementContent) {
  if (content.actionType === "ROUTE") return isAnnouncementRoute(content.actionTarget);
  if (content.actionType === "URL") return isSafeLink(content.actionTarget);
  return false;
}

export async function openAnnouncementAction(content: AnnouncementContent) {
  if (content.actionType === "ROUTE" && isAnnouncementRoute(content.actionTarget)) {
    router.push(ANNOUNCEMENT_ROUTE_PATHS[content.actionTarget]);
    return;
  }
  if (content.actionType === "URL" && isSafeLink(content.actionTarget)) {
    await Linking.openURL(content.actionTarget);
  }
}

export function clientAudience() {
  const platform = Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "web";
  const version = Constants.expoConfig?.version;
  return {
    platform,
    ...(version && /^\d{1,4}(\.\d{1,4}){0,2}$/.test(version) ? { appVersion: version } : {}),
  };
}
