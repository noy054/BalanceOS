export const BODY_METRICS = [
  'weightKg',
  'waistCm',
  'hipsCm',
  'chestCm',
  'upperArmCm',
  'thighCm',
] as const;

export type BodyMetric = (typeof BODY_METRICS)[number];

export const WEIGHT_RANGE = { min: 20, max: 400 } as const;
export const LENGTH_RANGE = { min: 10, max: 300 } as const;

export const NOTE_MAX_LENGTH = 500;
export const MAX_PHOTOS_PER_ENTRY = 4;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_ENTRY_FUTURE_DAYS = 1;

export const ENTRIES_PAGE_SIZE = 30;
export const ENTRIES_MAX_PAGE_SIZE = 100;
