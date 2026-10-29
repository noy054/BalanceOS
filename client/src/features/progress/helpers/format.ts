import { BodyMetric } from "../types";

export function metricUnitKey(metric: BodyMetric): "units.kg" | "units.cm" {
  return metric === "weightKg" ? "units.kg" : "units.cm";
}

export function formatMetricNumber(value: number, locale: string): string {
  return value.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

export function formatChange(change: number, locale: string): string {
  if (change === 0) return formatMetricNumber(0, locale);
  const sign = change > 0 ? "+" : "−";
  return `${sign}${formatMetricNumber(Math.abs(change), locale)}`;
}
