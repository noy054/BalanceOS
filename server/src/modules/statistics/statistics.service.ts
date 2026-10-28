import { Injectable } from '@nestjs/common';
import { MacrosSnapshot } from '../nutrition-calculator/nutrition-calculator.service';
import { StatRange } from './dto/statistics-query.dto';
import {
  DayTrendPoint,
  FoodItem,
  MealDistributionItem,
  MostUsedFood,
  StatisticsResponseDto,
} from './dto/statistics-response.dto';
import { StatisticsRepository } from './statistics.repository';

const MEAL_TYPES = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK_1',
  'SNACK_2',
] as const;

function r1(v: number) {
  return Math.round(v * 10) / 10;
}

function clampPct(avg: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((avg / target) * 100), 200);
}

function dateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cur = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');

  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return dates;
}

function calculateNutritionAccuracy(params: {
  avgCalories: number;
  targetCalories: number;
  avgProtein: number;
  targetProtein: number;
  loggedDays: number;
  rangeDays: number;
}) {
  const {
    avgCalories,
    targetCalories,
    avgProtein,
    targetProtein,
    loggedDays,
    rangeDays,
  } = params;

  const calorieScore =
    targetCalories > 0
      ? Math.max(
          0,
          100 - Math.abs((avgCalories - targetCalories) / targetCalories) * 100,
        )
      : 0;

  const proteinScore =
    targetProtein > 0 ? Math.min((avgProtein / targetProtein) * 100, 100) : 0;

  const loggingScore =
    rangeDays > 0 ? Math.min((loggedDays / rangeDays) * 100, 100) : 0;

  return Math.round(
    calorieScore * 0.45 + proteinScore * 0.35 + loggingScore * 0.2,
  );
}

@Injectable()
export class StatisticsService {
  constructor(private readonly repo: StatisticsRepository) {}

  async getStatistics(
    userId: string,
    range: StatRange,
    clientToday?: string,
  ): Promise<StatisticsResponseDto> {
    const rangeDays = range === '7D' ? 7 : range === '14D' ? 14 : 30;

    const endDate = clientToday ?? new Date().toISOString().slice(0, 10);

    const startUtc = new Date(`${endDate}T00:00:00Z`);
    startUtc.setUTCDate(startUtc.getUTCDate() - (rangeDays - 1));
    const startDate = startUtc.toISOString().slice(0, 10);

    const [dayLogs, targets] = await Promise.all([
      this.repo.findDayLogsInRange(userId, startDate, endDate),
      this.repo.findUserTargets(userId),
    ]);

    const logsByDate = new Map(dayLogs.map((log) => [log.date, log]));
    const allDates = dateRange(startDate, endDate);

    let sumCalories = 0;
    let sumProtein = 0;
    let sumCarbs = 0;
    let sumFat = 0;
    let calorieBalance = 0;
    let onTargetDays = 0;

    const loggedDays = dayLogs.length;
    const totalDays = rangeDays;

    const mealCaloriesSum: Record<string, number> = {};
    const foodMap = new Map<string, { totalCalories: number; count: number }>();

    for (const date of allDates) {
      const log = logsByDate.get(date);

      const calories = log?.caloriesTotal ?? 0;
      const protein = log?.proteinTotal ?? 0;
      const carbs = log?.carbsTotal ?? 0;
      const fat = log?.fatTotal ?? 0;

      sumCalories += calories;
      sumProtein += protein;
      sumCarbs += carbs;
      sumFat += fat;

      calorieBalance += calories - targets.calories;

      const diff =
        targets.calories > 0
          ? Math.abs(calories - targets.calories) / targets.calories
          : 1;

      if (log && diff <= 0.15) {
        onTargetDays += 1;
      }

      if (!log) {
        continue;
      }

      for (const entry of log.mealEntries) {
        let entryCalories = 0;

        for (const item of entry.items) {
          const snap = item.macrosSnapshot as MacrosSnapshot;

          entryCalories += snap.calories;

          const existing = foodMap.get(snap.name);

          if (existing) {
            existing.totalCalories += snap.calories;
            existing.count += 1;
          } else {
            foodMap.set(snap.name, {
              totalCalories: snap.calories,
              count: 1,
            });
          }
        }

        mealCaloriesSum[entry.mealType] =
          (mealCaloriesSum[entry.mealType] ?? 0) + entryCalories;
      }
    }

    const avgCalories = totalDays > 0 ? Math.round(sumCalories / totalDays) : 0;
    const avgProtein = totalDays > 0 ? r1(sumProtein / totalDays) : 0;
    const avgCarbs = totalDays > 0 ? r1(sumCarbs / totalDays) : 0;
    const avgFat = totalDays > 0 ? r1(sumFat / totalDays) : 0;

    const avgDailyCalorieGap =
      totalDays > 0 ? Math.round(calorieBalance / totalDays) : 0;
    const proteinGap = r1(avgProtein - targets.protein);

    const nutritionAccuracy = calculateNutritionAccuracy({
      avgCalories,
      targetCalories: targets.calories,
      avgProtein,
      targetProtein: targets.protein,
      loggedDays,
      rangeDays,
    });

    const dailyTrend: DayTrendPoint[] = allDates.map((date) => {
      const log = logsByDate.get(date);

      return {
        date,
        calories: log ? Math.round(log.caloriesTotal) : 0,
        target: targets.calories,
      };
    });

    const macroAccuracy = {
      calories: {
        avg: avgCalories,
        target: targets.calories,
        pct: clampPct(avgCalories, targets.calories),
      },
      protein: {
        avg: avgProtein,
        target: targets.protein,
        pct: clampPct(avgProtein, targets.protein),
      },
      carbs: {
        avg: avgCarbs,
        target: targets.carbs,
        pct: clampPct(avgCarbs, targets.carbs),
      },
      fat: {
        avg: avgFat,
        target: targets.fat,
        pct: clampPct(avgFat, targets.fat),
      },
    };

    const mealDistribution: MealDistributionItem[] = MEAL_TYPES.map(
      (mealType) => {
        const avgCalories =
          totalDays > 0
            ? Math.round((mealCaloriesSum[mealType] ?? 0) / totalDays)
            : 0;

        return {
          mealType,
          avgCalories,
          pct: 0,
        };
      },
    );

    const totalMealCalories = mealDistribution.reduce(
      (sum, meal) => sum + meal.avgCalories,
      0,
    );

    for (const meal of mealDistribution) {
      meal.pct =
        totalMealCalories > 0
          ? Math.round((meal.avgCalories / totalMealCalories) * 100)
          : 0;
    }

    const sortedByCalories = Array.from(foodMap.entries())
      .map(([name, data]) => ({
        name,
        totalCalories: Math.round(data.totalCalories),
        count: data.count,
      }))
      .sort((a, b) => b.totalCalories - a.totalCalories);

    const topCalorieSources: FoodItem[] = sortedByCalories.slice(0, 5);

    const mostUsedFoods: MostUsedFood[] = Array.from(foodMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgCalories: Math.round(data.totalCalories / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      range,
      startDate,
      endDate,
      summary: {
        avgCalories,
        targetCalories: targets.calories,
        avgProtein,
        targetProtein: targets.protein,
        calorieBalance: Math.round(calorieBalance),
        avgDailyCalorieGap,
        proteinGap,
        onTargetDays,
        totalDays,
        loggedDays,
        rangeDays,
        nutritionAccuracy,
      },
      dailyTrend,
      macroAccuracy,
      mealDistribution,
      topCalorieSources,
      mostUsedFoods,
    };
  }
}
