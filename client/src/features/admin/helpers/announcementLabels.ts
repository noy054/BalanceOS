import type { TFunction } from "i18next";

import { BadgeTone } from "../components/StatusBadge";
import { AnnouncementState } from "../types";
import { AnnouncementPlatform } from "../../announcements/types";

export function announcementStateTone(state: AnnouncementState): BadgeTone {
  switch (state) {
    case "ACTIVE":
      return "success";
    case "SCHEDULED":
      return "accent";
    case "DRAFT":
      return "neutral";
    case "EXPIRED":
      return "warning";
    case "ARCHIVED":
      return "danger";
  }
}

export function audienceSummary(
  audience: {
    platforms: AnnouncementPlatform[];
    minAppVersion: string | null;
    maxAppVersion: string | null;
  },
  t: TFunction<"settings">,
) {
  const platforms =
    audience.platforms.length === 0
      ? t("admin.announcements.allPlatforms")
      : audience.platforms.map((platform) => t(`admin.announcements.platforms.${platform}`)).join(", ");
  const versions =
    audience.minAppVersion && audience.maxAppVersion
      ? t("admin.announcements.versionRange", { min: audience.minAppVersion, max: audience.maxAppVersion })
      : audience.minAppVersion
        ? t("admin.announcements.versionFrom", { min: audience.minAppVersion })
        : audience.maxAppVersion
          ? t("admin.announcements.versionUpTo", { max: audience.maxAppVersion })
          : null;
  return [platforms, versions].filter(Boolean).join(" · ");
}
