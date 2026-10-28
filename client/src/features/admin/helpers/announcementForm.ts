import { DateKey, toDateKey } from "../../../shared/helpers/dateKey";
import { isAnnouncementRoute, isSafeLink } from "../../announcements/helpers/announcementContent";
import {
  AnnouncementActionType,
  AnnouncementDisplay,
  AnnouncementKind,
  AnnouncementPlatform,
} from "../../announcements/types";
import { AdminAnnouncement, AnnouncementPayload } from "../types";

export type AnnouncementFormState = {
  kind: AnnouncementKind;
  display: AnnouncementDisplay;
  titleHe: string;
  titleEn: string;
  bodyHe: string;
  bodyEn: string;
  actionType: AnnouncementActionType;
  route: string;
  url: string;
  actionLabelHe: string;
  actionLabelEn: string;
  platforms: AnnouncementPlatform[];
  minAppVersion: string;
  maxAppVersion: string;
  startDate: DateKey | null;
  startTime: string;
  endDate: DateKey | null;
  endTime: string;
};

export type AnnouncementFormField = keyof AnnouncementFormState;
export type AnnouncementFormErrors = Partial<Record<AnnouncementFormField, string>>;

export type AnnouncementFormMessages = {
  required: string;
  tooLong: string;
  invalidUrl: string;
  invalidRoute: string;
  invalidVersion: string;
  versionOrder: string;
  invalidTime: string;
  endBeforeStart: string;
};

const VERSION_PATTERN = /^\d{1,4}(\.\d{1,4}){0,2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const EMPTY_ANNOUNCEMENT_FORM: AnnouncementFormState = {
  kind: "UPDATE",
  display: "BANNER",
  titleHe: "",
  titleEn: "",
  bodyHe: "",
  bodyEn: "",
  actionType: "NONE",
  route: "",
  url: "",
  actionLabelHe: "",
  actionLabelEn: "",
  platforms: [],
  minAppVersion: "",
  maxAppVersion: "",
  startDate: null,
  startTime: "09:00",
  endDate: null,
  endTime: "23:59",
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function splitDate(value: string | null): { date: DateKey | null; time: string | null } {
  if (!value) return { date: null, time: null };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: null, time: null };
  return { date: toDateKey(date), time: `${pad(date.getHours())}:${pad(date.getMinutes())}` };
}

export function formFromAnnouncement(item: AdminAnnouncement): AnnouncementFormState {
  const start = splitDate(item.publishAt);
  const end = splitDate(item.expiresAt);
  return {
    kind: item.kind,
    display: item.display,
    titleHe: item.titleHe,
    titleEn: item.titleEn,
    bodyHe: item.bodyHe,
    bodyEn: item.bodyEn,
    actionType: item.actionType,
    route: item.actionType === "ROUTE" ? (item.actionTarget ?? "") : "",
    url: item.actionType === "URL" ? (item.actionTarget ?? "") : "",
    actionLabelHe: item.actionLabelHe ?? "",
    actionLabelEn: item.actionLabelEn ?? "",
    platforms: item.platforms,
    minAppVersion: item.minAppVersion ?? "",
    maxAppVersion: item.maxAppVersion ?? "",
    startDate: start.date,
    startTime: start.time ?? EMPTY_ANNOUNCEMENT_FORM.startTime,
    endDate: end.date,
    endTime: end.time ?? EMPTY_ANNOUNCEMENT_FORM.endTime,
  };
}

export function combineDateTime(date: DateKey | null, time: string): Date | null {
  if (!date) return null;
  const match = TIME_PATTERN.exec(time.trim());
  if (!match) return null;
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, Number(match[1]), Number(match[2]));
}

function compareVersions(a: string, b: string) {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function buildAnnouncementPayload(
  state: AnnouncementFormState,
  messages: AnnouncementFormMessages,
): { payload: AnnouncementPayload | null; errors: AnnouncementFormErrors } {
  const errors: AnnouncementFormErrors = {};
  const text = (field: AnnouncementFormField, max: number, required = true) => {
    const value = String(state[field] ?? "").trim();
    if (required && !value) errors[field] = messages.required;
    else if (value.length > max) errors[field] = messages.tooLong;
    return value;
  };

  const titleHe = text("titleHe", 120);
  const titleEn = text("titleEn", 120);
  const bodyHe = text("bodyHe", 2000);
  const bodyEn = text("bodyEn", 2000);

  let actionTarget: string | null = null;
  let actionLabelHe: string | null = null;
  let actionLabelEn: string | null = null;
  if (state.actionType !== "NONE") {
    if (state.actionType === "ROUTE") {
      if (!isAnnouncementRoute(state.route)) errors.route = messages.invalidRoute;
      actionTarget = state.route;
    } else {
      const url = state.url.trim();
      if (!isSafeLink(url) || url.length > 500) errors.url = messages.invalidUrl;
      actionTarget = url;
    }
    actionLabelHe = text("actionLabelHe", 40);
    actionLabelEn = text("actionLabelEn", 40);
  }

  const minAppVersion = state.minAppVersion.trim() || null;
  const maxAppVersion = state.maxAppVersion.trim() || null;
  if (minAppVersion && !VERSION_PATTERN.test(minAppVersion)) errors.minAppVersion = messages.invalidVersion;
  if (maxAppVersion && !VERSION_PATTERN.test(maxAppVersion)) errors.maxAppVersion = messages.invalidVersion;
  if (
    minAppVersion &&
    maxAppVersion &&
    !errors.minAppVersion &&
    !errors.maxAppVersion &&
    compareVersions(minAppVersion, maxAppVersion) > 0
  ) {
    errors.maxAppVersion = messages.versionOrder;
  }

  const start = combineDateTime(state.startDate, state.startTime);
  const end = combineDateTime(state.endDate, state.endTime);
  if (state.startDate && !start) errors.startTime = messages.invalidTime;
  if (state.endDate && !end) errors.endTime = messages.invalidTime;
  if (start && end && end <= start) errors.endTime = messages.endBeforeStart;

  if (Object.keys(errors).length > 0) return { payload: null, errors };

  return {
    errors,
    payload: {
      kind: state.kind,
      display: state.display,
      titleHe,
      titleEn,
      bodyHe,
      bodyEn,
      actionType: state.actionType,
      actionTarget,
      actionLabelHe,
      actionLabelEn,
      platforms: state.platforms,
      minAppVersion,
      maxAppVersion,
      publishAt: start ? start.toISOString() : null,
      expiresAt: end ? end.toISOString() : null,
    },
  };
}
