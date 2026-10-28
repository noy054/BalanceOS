import { AnnouncementStatus } from '../../../generated/prisma/enums';

export const ANNOUNCEMENT_ROUTES = [
  'HOME',
  'PANTRY',
  'ADD_MEAL',
  'STATISTICS',
  'SETTINGS',
  'NUTRITION_TARGETS',
  'LANGUAGE_DISPLAY',
  'NOTIFICATIONS',
  'ABOUT',
] as const;

export type AnnouncementRoute = (typeof ANNOUNCEMENT_ROUTES)[number];

export const ANNOUNCEMENT_PLATFORMS = ['ios', 'android', 'web'] as const;

export type AnnouncementPlatform = (typeof ANNOUNCEMENT_PLATFORMS)[number];

export const APP_VERSION_PATTERN = /^\d{1,4}(\.\d{1,4}){0,2}$/;

export const ANNOUNCEMENT_STATES = [
  'DRAFT',
  'SCHEDULED',
  'ACTIVE',
  'EXPIRED',
  'ARCHIVED',
] as const;

export type AnnouncementState = (typeof ANNOUNCEMENT_STATES)[number];

export function compareVersions(a: string, b: string): number {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function isSafeHttpsUrl(value: string): boolean {
  if (value.length > 500) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      url.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

export function effectiveState(
  row: {
    status: AnnouncementStatus;
    publishAt: Date | null;
    expiresAt: Date | null;
  },
  now: Date,
): AnnouncementState {
  if (row.status === AnnouncementStatus.ARCHIVED) return 'ARCHIVED';
  if (row.status === AnnouncementStatus.DRAFT) return 'DRAFT';
  if (row.publishAt && row.publishAt > now) return 'SCHEDULED';
  if (row.expiresAt && row.expiresAt <= now) return 'EXPIRED';
  return 'ACTIVE';
}

export function matchesAudience(
  row: {
    platforms: string[];
    minAppVersion: string | null;
    maxAppVersion: string | null;
  },
  client: { platform?: string; appVersion?: string },
): boolean {
  if (row.platforms.length > 0) {
    if (!client.platform || !row.platforms.includes(client.platform)) {
      return false;
    }
  }
  if (row.minAppVersion || row.maxAppVersion) {
    if (!client.appVersion) return false;
    if (
      row.minAppVersion &&
      compareVersions(client.appVersion, row.minAppVersion) < 0
    ) {
      return false;
    }
    if (
      row.maxAppVersion &&
      compareVersions(client.appVersion, row.maxAppVersion) > 0
    ) {
      return false;
    }
  }
  return true;
}
