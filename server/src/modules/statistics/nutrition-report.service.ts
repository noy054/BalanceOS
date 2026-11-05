import { BadRequestException, Injectable } from '@nestjs/common';
import { MacrosSnapshot } from '../nutrition-calculator/nutrition-calculator.service';
import { NutrientTargets } from './dto/statistics-response.dto';
import { StatisticsRepository } from './statistics.repository';
import { snapshotTargets } from './statistics.service';

export const MAX_REPORT_DAYS = 31;

const MEAL_ORDER = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK_1', 'SNACK_2'];
const DAY_MS = 24 * 60 * 60 * 1000;

type Totals = NutrientTargets;

function r1(value: number) {
  return Math.round(value * 10) / 10;
}

function emptyTotals(): Totals {
  return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
}

function addTo(target: Totals, values: Totals) {
  target.calories += values.calories;
  target.protein += values.protein;
  target.carbs += values.carbs;
  target.fat += values.fat;
  target.fiber += values.fiber;
}

function rounded(values: Totals): Totals {
  return {
    calories: Math.round(values.calories),
    protein: r1(values.protein),
    carbs: r1(values.carbs),
    fat: r1(values.fat),
    fiber: r1(values.fiber),
  };
}

function snapshotTotals(snapshot: MacrosSnapshot): Totals {
  return {
    calories: snapshot.calories ?? 0,
    protein: snapshot.protein ?? 0,
    carbs: snapshot.carbs ?? 0,
    fat: snapshot.fat ?? 0,
    fiber: snapshot.fiber ?? 0,
  };
}

@Injectable()
export class NutritionReportService {
  constructor(private readonly repo: StatisticsRepository) {}

  async report(userId: string, from: string, to: string) {
    const start = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    const dayCount = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      dayCount < 1 ||
      dayCount > MAX_REPORT_DAYS
    ) {
      throw new BadRequestException('Invalid report period');
    }

    const [logs, currentTargets] = await Promise.all([
      this.repo.findReportDays(userId, from, to),
      this.repo.findUserTargets(userId),
    ]);
    const byDate = new Map(logs.map((log) => [log.date, log]));

    const sum = emptyTotals();
    const targetSum = emptyTotals();
    let loggedDays = 0;

    const days = Array.from({ length: dayCount }, (_, index) => {
      const date = new Date(start.getTime() + index * DAY_MS)
        .toISOString()
        .slice(0, 10);
      const log = byDate.get(date);
      const targets = log
        ? snapshotTargets(log.targetsSnapshot, currentTargets)
        : currentTargets;
      const meals = (log?.mealEntries ?? [])
        .filter((entry) => entry.items.length > 0)
        .sort(
          (a, b) =>
            MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType),
        )
        .map((entry) => {
          const mealTotals = emptyTotals();
          const items = entry.items.map((item) => {
            const snapshot = item.macrosSnapshot as MacrosSnapshot;
            const values = snapshotTotals(snapshot);
            addTo(mealTotals, values);
            const product = item.pantryProduct;
            return {
              name: snapshot.name,
              kind: item.pantryProductId
                ? ('PRODUCT' as const)
                : item.pantryRecipeId
                  ? ('RECIPE' as const)
                  : item.savedMealId
                    ? ('SAVED_MEAL' as const)
                    : ('PRODUCT' as const),
              grams: item.grams,
              servings: item.servings,
              milliliters: item.milliliters,
              serving: product
                ? {
                    nutritionBasis: product.nutritionBasis,
                    servingSizeG: product.servingSizeG,
                    servingSizeMl: product.servingSizeMl,
                    servingQuantity: product.servingQuantity,
                    servingUnit: product.servingUnit,
                  }
                : null,
              totals: rounded(values),
            };
          });
          return {
            mealType: entry.mealType,
            totals: rounded(mealTotals),
            items,
          };
        });

      const dayTotals = emptyTotals();
      meals.forEach((meal) => addTo(dayTotals, meal.totals));
      const logged = meals.length > 0;
      if (logged) {
        loggedDays += 1;
        addTo(sum, dayTotals);
      }
      addTo(targetSum, targets);

      return { date, logged, totals: rounded(dayTotals), targets, meals };
    });

    const average = (value: number) =>
      loggedDays > 0 ? value / loggedDays : 0;

    return {
      from,
      to,
      rangeDays: dayCount,
      loggedDays,
      totals: rounded(sum),
      averages: rounded({
        calories: average(sum.calories),
        protein: average(sum.protein),
        carbs: average(sum.carbs),
        fat: average(sum.fat),
        fiber: average(sum.fiber),
      }),
      averageTargets: rounded({
        calories: targetSum.calories / dayCount,
        protein: targetSum.protein / dayCount,
        carbs: targetSum.carbs / dayCount,
        fat: targetSum.fat / dayCount,
        fiber: targetSum.fiber / dayCount,
      }),
      days,
    };
  }
}
