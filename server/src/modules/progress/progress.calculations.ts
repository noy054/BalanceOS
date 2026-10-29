import { BODY_METRICS, BodyMetric } from './progress.constants';

export type MetricValues = Record<BodyMetric, number | null>;

export type EntryForCalculation = MetricValues & {
  date: string;
  createdAt: Date;
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

export type LatestValue = { value: number; date: string };

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function chronological(entries: EntryForCalculation[]): EntryForCalculation[] {
  return [...entries].sort((a, b) =>
    a.date === b.date
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : a.date < b.date
        ? -1
        : 1,
  );
}

export function metricSeries(
  entries: EntryForCalculation[],
  metric: BodyMetric,
): MetricPoint[] {
  const byDate = new Map<string, number>();
  for (const entry of chronological(entries)) {
    const value = entry[metric];
    if (value !== null) byDate.set(entry.date, value);
  }
  return [...byDate.entries()].map(([date, value]) => ({ date, value }));
}

export function summarizeMetric(
  entries: EntryForCalculation[],
  metric: BodyMetric,
): MetricSummary {
  const points = metricSeries(entries, metric);
  if (points.length === 0) {
    return {
      points,
      start: null,
      end: null,
      change: null,
      min: null,
      max: null,
    };
  }
  const values = points.map((point) => point.value);
  const start = points[0];
  const end = points[points.length - 1];
  return {
    points,
    start,
    end,
    change: points.length > 1 ? round1(end.value - start.value) : null,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function summarizeMetrics(
  entries: EntryForCalculation[],
): Record<BodyMetric, MetricSummary> {
  const result = {} as Record<BodyMetric, MetricSummary>;
  for (const metric of BODY_METRICS) {
    result[metric] = summarizeMetric(entries, metric);
  }
  return result;
}

export function latestValues(
  entries: EntryForCalculation[],
): Record<BodyMetric, LatestValue | null> {
  const ordered = chronological(entries);
  const result = {} as Record<BodyMetric, LatestValue | null>;
  for (const metric of BODY_METRICS) {
    let latest: LatestValue | null = null;
    for (const entry of ordered) {
      const value = entry[metric];
      if (value !== null) latest = { value, date: entry.date };
    }
    result[metric] = latest;
  }
  return result;
}
