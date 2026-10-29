import { BODY_METRICS } from "./constants";

export type BodyMetric = (typeof BODY_METRICS)[number];

export type MetricValues = Record<BodyMetric, number | null>;

export type ProgressPhotoRef = {
  id: string;
  createdAt: string;
};

export type BodyEntry = MetricValues & {
  id: string;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  photos: ProgressPhotoRef[];
};

export type BodyEntryPage = {
  items: BodyEntry[];
  nextCursor: string | null;
};

export type MetricPoint = { date: string; value: number };

export type MetricSummary = {
  points: MetricPoint[];
  start: MetricPoint | null;
  end: MetricPoint | null;
  change: number | null;
  min: number | null;
  max: number | null;
};

export type ProgressOverview = {
  from: string | null;
  to: string | null;
  entryCount: number;
  rangeEntryCount: number;
  profileWeightKg: number | null;
  latest: Record<BodyMetric, MetricPoint | null>;
  metrics: Record<BodyMetric, MetricSummary>;
};

export type BodyEntryPayload = Partial<MetricValues> & {
  date?: string;
  note?: string | null;
};

export type ProgressPeriod = "30D" | "90D" | "180D" | "365D" | "ALL";
