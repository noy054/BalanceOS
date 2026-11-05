import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
  fiber: 25,
};

@Injectable()
export class StatisticsRepository {
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

  findDayLogsInRange(userId: string, startDate: string, endDate: string) {
    return this.prisma.dayLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        date: true,
        caloriesTotal: true,
        proteinTotal: true,
        carbsTotal: true,
        fatTotal: true,
        fiberTotal: true,
        targetsSnapshot: true,
        mealEntries: {
          select: {
            mealType: true,
            items: {
              select: {
                macrosSnapshot: true,
                pantryProduct: { select: { imageUrl: true } },
                pantryRecipe: { select: { imageUrl: true } },
                savedMeal: { select: { imageUrl: true } },
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  findReportDays(userId: string, startDate: string, endDate: string) {
    return this.prisma.dayLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        date: true,
        targetsSnapshot: true,
        mealEntries: {
          select: {
            mealType: true,
            items: {
              orderBy: { createdAt: 'asc' },
              select: {
                grams: true,
                servings: true,
                milliliters: true,
                macrosSnapshot: true,
                pantryProductId: true,
                pantryRecipeId: true,
                savedMealId: true,
                pantryProduct: {
                  select: {
                    nutritionBasis: true,
                    servingSizeG: true,
                    servingSizeMl: true,
                    servingQuantity: true,
                    servingUnit: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}
