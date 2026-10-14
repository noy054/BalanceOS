import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
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
      },
    });
    return {
      calories: s?.dailyCaloriesTarget ?? DEFAULT_TARGETS.calories,
      protein: s?.proteinTarget ?? DEFAULT_TARGETS.protein,
      carbs: s?.carbsTarget ?? DEFAULT_TARGETS.carbs,
      fat: s?.fatTarget ?? DEFAULT_TARGETS.fat,
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
        mealEntries: {
          select: {
            mealType: true,
            items: {
              select: {
                macrosSnapshot: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}
