import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MacrosSnapshot } from '../nutrition-calculator/nutrition-calculator.service';

export type PantryProductRow = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
};

export type PantryRecipeRow = {
  id: string;
  name: string;
  items: Array<{
    grams: number;
    product: {
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      fiberPer100g: number | null;
    };
  }>;
};

export type SavedMealRow = {
  id: string;
  name: string;
  items: Array<{
    grams: number | null;
    servings: number | null;
    product: {
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      fiberPer100g: number | null;
    } | null;
    recipe: {
      items: Array<{
        grams: number;
        product: {
          caloriesPer100g: number;
          proteinPer100g: number;
          carbsPer100g: number;
          fatPer100g: number;
          fiberPer100g: number | null;
        };
      }>;
    } | null;
  }>;
};

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
  fiber: 25,
};

@Injectable()
export class DayLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserTargets(userId: string) {
    const s = await this.prisma.userNutritionSettings.findUnique({
      where: { userId },
      select: {
        dailyCaloriesTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatTarget: true,
        fiberTarget: true,
      },
    });
    return {
      calories: s?.dailyCaloriesTarget ?? DEFAULT_TARGETS.calories,
      protein: s?.proteinTarget ?? DEFAULT_TARGETS.protein,
      carbs: s?.carbsTarget ?? DEFAULT_TARGETS.carbs,
      fat: s?.fatTarget ?? DEFAULT_TARGETS.fat,
      fiber: s?.fiberTarget ?? DEFAULT_TARGETS.fiber,
    };
  }

  findToday(userId: string, date: string) {
    return this.prisma.dayLog.findUnique({
      where: { userId_date: { userId, date } },
    });
  }

  async findOrCreateToday(userId: string, date: string, targetsSnapshot: object) {
    return this.prisma.dayLog.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, targetsSnapshot },
      update: {},
    });
  }

  async findOrCreateMealEntry(dayLogId: string, mealType: string) {
    return this.prisma.mealEntry.upsert({
      where: { dayLogId_mealType: { dayLogId, mealType } },
      create: { dayLogId, mealType },
      update: {},
    });
  }

  createMealItem(
    mealEntryId: string,
    data: {
      pantryProductId?: string;
      pantryRecipeId?: string;
      savedMealId?: string;
      grams?: number;
      servings?: number;
      macrosSnapshot: MacrosSnapshot;
    },
  ) {
    return this.prisma.mealItem.create({
      data: {
        mealEntryId,
        pantryProductId: data.pantryProductId ?? null,
        pantryRecipeId: data.pantryRecipeId ?? null,
        savedMealId: data.savedMealId ?? null,
        grams: data.grams ?? null,
        servings: data.servings ?? null,
        macrosSnapshot: data.macrosSnapshot as unknown as object,
      },
    });
  }

  findPantryProductForUser(productId: string, userId: string): Promise<PantryProductRow | null> {
    return this.prisma.pantryProduct.findFirst({
      where: { id: productId, userId },
      select: {
        id: true,
        name: true,
        caloriesPer100g: true,
        proteinPer100g: true,
        carbsPer100g: true,
        fatPer100g: true,
        fiberPer100g: true,
      },
    });
  }

  findPantryRecipeForUser(recipeId: string, userId: string): Promise<PantryRecipeRow | null> {
    return this.prisma.pantryRecipe.findFirst({
      where: { id: recipeId, userId },
      select: {
        id: true,
        name: true,
        items: {
          select: {
            grams: true,
            product: {
              select: {
                caloriesPer100g: true,
                proteinPer100g: true,
                carbsPer100g: true,
                fatPer100g: true,
                fiberPer100g: true,
              },
            },
          },
        },
      },
    });
  }

  findSavedMealForUser(savedMealId: string, userId: string): Promise<SavedMealRow | null> {
    return this.prisma.savedMeal.findFirst({
      where: { id: savedMealId, userId },
      select: {
        id: true,
        name: true,
        items: {
          select: {
            grams: true,
            servings: true,
            product: {
              select: {
                caloriesPer100g: true,
                proteinPer100g: true,
                carbsPer100g: true,
                fatPer100g: true,
                fiberPer100g: true,
              },
            },
            recipe: {
              select: {
                items: {
                  select: {
                    grams: true,
                    product: {
                      select: {
                        caloriesPer100g: true,
                        proteinPer100g: true,
                        carbsPer100g: true,
                        fatPer100g: true,
                        fiberPer100g: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findMealItemWithOwnership(itemId: string) {
    return this.prisma.mealItem.findUnique({
      where: { id: itemId },
      include: {
        mealEntry: {
          select: {
            dayLog: { select: { id: true, userId: true } },
          },
        },
      },
    });
  }

  deleteMealItem(itemId: string) {
    return this.prisma.mealItem.delete({ where: { id: itemId } });
  }

  async recalculateAndSaveTotals(dayLogId: string) {
    const items = await this.prisma.mealItem.findMany({
      where: { mealEntry: { dayLogId } },
      select: { macrosSnapshot: true },
    });

    let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    for (const item of items) {
      const s = item.macrosSnapshot as MacrosSnapshot;
      calories += s.calories;
      protein += s.protein;
      carbs += s.carbs;
      fat += s.fat;
      fiber += s.fiber;
    }

    const r1 = (v: number) => Math.round(v * 10) / 10;

    return this.prisma.dayLog.update({
      where: { id: dayLogId },
      data: {
        caloriesTotal: Math.round(calories),
        proteinTotal: r1(protein),
        carbsTotal: r1(carbs),
        fatTotal: r1(fat),
        fiberTotal: r1(fiber),
      },
    });
  }
}
