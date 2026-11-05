import { StatisticsResponse } from "../types";

export type Insight =
  | { kind: "coverage"; missing: number; range: number }
  | { kind: "protein"; count: number; logged: number }
  | { kind: "caloriesWithin"; pct: number }
  | { kind: "caloriesAbove" | "caloriesBelow"; value: number }
  | { kind: "topSource"; name: string; pct: number };

const MIN_LOGGED_DAYS = 3;
const PROTEIN_REACHED = 0.9;
const CALORIES_WITHIN = 0.1;
const TOP_SOURCE_SHARE = 0.2;

export function buildInsights(data: StatisticsResponse): Insight[] {
  const logged = data.dailyTrend.filter((day) => day.logged);
  if (logged.length < MIN_LOGGED_DAYS) return [];

  const insights: Insight[] = [];
  const missing = data.summary.rangeDays - logged.length;
  if (missing > 0) {
    insights.push({ kind: "coverage", missing, range: data.summary.rangeDays });
  }

  const withProteinTarget = logged.filter((day) => day.targets.protein > 0);
  if (withProteinTarget.length > 0) {
    const count = withProteinTarget.filter(
      (day) => day.protein >= day.targets.protein * PROTEIN_REACHED,
    ).length;
    insights.push({ kind: "protein", count, logged: withProteinTarget.length });
  }

  const withCalorieTarget = logged.filter((day) => day.targets.calories > 0);
  if (withCalorieTarget.length > 0) {
    const eaten = withCalorieTarget.reduce((sum, day) => sum + day.calories, 0);
    const target = withCalorieTarget.reduce((sum, day) => sum + day.targets.calories, 0);
    const diff = (eaten - target) / withCalorieTarget.length;
    const ratio = target > 0 ? Math.abs(eaten - target) / target : 0;
    if (ratio <= CALORIES_WITHIN) {
      insights.push({ kind: "caloriesWithin", pct: Math.max(1, Math.round(ratio * 100)) });
    } else {
      insights.push({
        kind: diff > 0 ? "caloriesAbove" : "caloriesBelow",
        value: Math.round(Math.abs(diff)),
      });
    }
  }

  const loggedCalories = logged.reduce((sum, day) => sum + day.calories, 0);
  const top = data.topCalorieSources[0];
  if (top && loggedCalories > 0) {
    const share = top.totalCalories / loggedCalories;
    if (share >= TOP_SOURCE_SHARE) {
      insights.push({ kind: "topSource", name: top.name, pct: Math.round(share * 100) });
    }
  }

  return insights;
}
