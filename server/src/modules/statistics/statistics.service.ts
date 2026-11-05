import { Injectable } from '@nestjs/common';
import { MacrosSnapshot } from '../nutrition-calculator/nutrition-calculator.service';
import { StatRange } from './dto/statistics-query.dto';
import {
  DayTrendPoint,
  FoodItem,
  MealDistributionItem,
  MostUsedFood,
  NutrientTargets,
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

export function snapshotTargets(
  snapshot: unknown,
  fallback: NutrientTargets,
): NutrientTargets {
  const source =
    snapshot && typeof snapshot === 'object'
      ? (snapshot as Partial<Record<keyof NutrientTargets, unknown>>)
      : {};
  const pick = (key: keyof NutrientTargets) => {
    const value = source[key];
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? value
      : fallback[key];
  };
  return {
    calories: pick('calories'),
    protein: pick('protein'),
    carbs: pick('carbs'),
    fat: pick('fat'),
    fiber: pick('fiber'),
  };
}

type ItemImages = {
  pantryProduct: { imageUrl: string | null } | null;
  pantryRecipe: { imageUrl: string | null } | null;
  savedMeal: { imageUrl: string | null } | null;
};

function itemImage(item: ItemImages): string | null {
  return (
    item.pantryProduct?.imageUrl ||
    item.pantryRecipe?.imageUrl ||
    item.savedMeal?.imageUrl ||
    null
  );
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
    localToday?: string,
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
    let sumFiber = 0;
    let calorieBalance = 0;
    let onTargetDays = 0;
    let loggedDays = 0;
    const targetSums: NutrientTargets = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    const lastCountedDate =
      localToday && localToday < endDate ? localToday : endDate;
    const totalDays = allDates.filter((date) => date <= lastCountedDate).length;

    const mealCaloriesSum: Record<string, number> = {};
    const foodMap = new Map<
      string,
      { totalCalories: number; count: number; imageUrl: string | null }
    >();
    const dailyTrend: DayTrendPoint[] = [];

    for (const date of allDates) {
      if (date > lastCountedDate) {
        dailyTrend.push({
          date,
          logged: false,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          target: targets.calories,
          targets,
        });
        continue;
      }

      const log = logsByDate.get(date);
      const logged = Boolean(
        log?.mealEntries.some((entry) => entry.items.length > 0),
      );

      const calories = log?.caloriesTotal ?? 0;
      const protein = log?.proteinTotal ?? 0;
      const carbs = log?.carbsTotal ?? 0;
      const fat = log?.fatTotal ?? 0;
      const fiber = log?.fiberTotal ?? 0;
      const dayTargets = log
        ? snapshotTargets(log.targetsSnapshot, targets)
        : targets;

      sumCalories += calories;
      sumProtein += protein;
      sumCarbs += carbs;
      sumFat += fat;
      sumFiber += fiber;

      calorieBalance += calories - dayTargets.calories;
      for (const key of Object.keys(targetSums) as (keyof NutrientTargets)[]) {
        targetSums[key] += dayTargets[key];
      }
      if (logged) loggedDays += 1;

      dailyTrend.push({
        date,
        logged,
        calories: Math.round(calories),
        protein: r1(protein),
        carbs: r1(carbs),
        fat: r1(fat),
        fiber: r1(fiber),
        target: dayTargets.calories,
        targets: dayTargets,
      });

      const diff =
        dayTargets.calories > 0
          ? Math.abs(calories - dayTargets.calories) / dayTargets.calories
          : 1;

      if (logged && diff <= 0.15) {
        onTargetDays += 1;
      }

      if (!log || !logged) {
        continue;
      }

      for (const entry of log.mealEntries) {
        let entryCalories = 0;

        for (const item of entry.items) {
          const snap = item.macrosSnapshot as MacrosSnapshot;

          entryCalories += snap.calories;

          const existing = foodMap.get(snap.name);
          const imageUrl = itemImage(item);

          if (existing) {
            existing.totalCalories += snap.calories;
            existing.count += 1;
            existing.imageUrl = existing.imageUrl ?? imageUrl;
          } else {
            foodMap.set(snap.name, {
              totalCalories: snap.calories,
              count: 1,
              imageUrl,
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
    const avgFiber = totalDays > 0 ? r1(sumFiber / totalDays) : 0;

    const rangeTargets: NutrientTargets = {
      calories: totalDays > 0 ? Math.round(targetSums.calories / totalDays) : 0,
      protein: totalDays > 0 ? r1(targetSums.protein / totalDays) : 0,
      carbs: totalDays > 0 ? r1(targetSums.carbs / totalDays) : 0,
      fat: totalDays > 0 ? r1(targetSums.fat / totalDays) : 0,
      fiber: totalDays > 0 ? r1(targetSums.fiber / totalDays) : 0,
    };

    const avgDailyCalorieGap =
      totalDays > 0 ? Math.round(calorieBalance / totalDays) : 0;
    const proteinGap = r1(avgProtein - rangeTargets.protein);

    const nutritionAccuracy = calculateNutritionAccuracy({
      avgCalories,
      targetCalories: rangeTargets.calories,
      avgProtein,
      targetProtein: rangeTargets.protein,
      loggedDays,
      rangeDays: totalDays,
    });

    const macroAccuracy = {
      calories: {
        avg: avgCalories,
        target: rangeTargets.calories,
        pct: clampPct(avgCalories, rangeTargets.calories),
      },
      protein: {
        avg: avgProtein,
        target: rangeTargets.protein,
        pct: clampPct(avgProtein, rangeTargets.protein),
      },
      carbs: {
        avg: avgCarbs,
        target: rangeTargets.carbs,
        pct: clampPct(avgCarbs, rangeTargets.carbs),
      },
      fat: {
        avg: avgFat,
        target: rangeTargets.fat,
        pct: clampPct(avgFat, rangeTargets.fat),
      },
      fiber: {
        avg: avgFiber,
        target: rangeTargets.fiber,
        pct: clampPct(avgFiber, rangeTargets.fiber),
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
        imageUrl: data.imageUrl,
      }))
      .sort((a, b) => b.totalCalories - a.totalCalories);

    const topCalorieSources: FoodItem[] = sortedByCalories.slice(0, 5);

    const mostUsedFoods: MostUsedFood[] = Array.from(foodMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgCalories: Math.round(data.totalCalories / data.count),
        imageUrl: data.imageUrl,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      range,
      startDate,
      endDate,
      summary: {
        avgCalories,
        targetCalories: rangeTargets.calories,
        avgProtein,
        targetProtein: rangeTargets.protein,
        calorieBalance: Math.round(calorieBalance),
        avgDailyCalorieGap,
        proteinGap,
        onTargetDays,
        totalDays,
        loggedDays,
        rangeDays: totalDays,
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
