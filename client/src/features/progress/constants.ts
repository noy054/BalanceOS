import type { BodyMetric, ProgressPeriod } from "./types";

export const BODY_METRICS = ["weightKg", "waistCm", "hipsCm", "chestCm", "upperArmCm", "thighCm"] as const;

export const MEASUREMENT_METRICS: BodyMetric[] = ["waistCm", "hipsCm", "chestCm", "upperArmCm", "thighCm"];

export const METRIC_RANGES: Record<BodyMetric, { min: number; max: number }> = {
  weightKg: { min: 20, max: 400 },
  waistCm: { min: 10, max: 300 },
  hipsCm: { min: 10, max: 300 },
  chestCm: { min: 10, max: 300 },
  upperArmCm: { min: 10, max: 300 },
  thighCm: { min: 10, max: 300 },
};

export const NOTE_MAX_LENGTH = 500;
export const MAX_PHOTOS_PER_ENTRY = 4;
export const PHOTO_ASPECT: [number, number] = [3, 4];

export const PROGRESS_PERIODS: ProgressPeriod[] = ["30D", "90D", "180D", "365D", "ALL"];

export const PERIOD_DAYS: Record<Exclude<ProgressPeriod, "ALL">, number> = {
  "30D": 30,
  "90D": 90,
  "180D": 180,
  "365D": 365,
};

export const PROGRESS_ENDPOINTS = {
  OVERVIEW: "/progress/overview",
  ENTRIES: "/progress/entries",
  ENTRY: (id: string) => `/progress/entries/${id}`,
  ENTRY_PHOTOS: (id: string) => `/progress/entries/${id}/photos`,
  PHOTO: (id: string) => `/progress/photos/${id}`,
} as const;

export const PROGRESS_QUERY_KEYS = {
  all: ["progress"] as const,
  overview: (from: string | null, to: string) => ["progress", "overview", from, to] as const,
  entries: (from: string | null, to: string) => ["progress", "entries", from, to] as const,
  entry: (id: string) => ["progress", "entry", id] as const,
  photo: (id: string) => ["progress-photo", id] as const,
};

export const PROGRESS_ROUTES = {
  overview: "/(app)/progress",
  newEntry: "/(app)/progress/new",
  entry: (id: string) => `/(app)/progress/${id}` as const,
} as const;
