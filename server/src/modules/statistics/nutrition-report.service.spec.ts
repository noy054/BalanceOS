import { BadRequestException } from '@nestjs/common';
import { NutritionReportService } from './nutrition-report.service';
import { StatisticsRepository } from './statistics.repository';

const TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
  fiber: 25,
};

function snapshot(name: string, calories: number, protein: number) {
  return { name, calories, protein, carbs: 10, fat: 5, fiber: 1 };
}

function setup() {
  const repo = {
    findUserTargets: jest.fn().mockResolvedValue(TARGETS),
    findReportDays: jest.fn().mockResolvedValue([
      {
        date: '2026-10-01',
        targetsSnapshot: { ...TARGETS, calories: 1800 },
        mealEntries: [
          {
            mealType: 'LUNCH',
            items: [
              {
                grams: 150,
                servings: null,
                macrosSnapshot: snapshot('Rice', 200, 4),
                pantryProductId: 'p1',
                pantryRecipeId: null,
                savedMealId: null,
                pantryProduct: {
                  nutritionBasis: 'PER_100G',
                  servingSizeG: null,
                  servingQuantity: null,
                  servingUnit: null,
                },
              },
            ],
          },
          {
            mealType: 'BREAKFAST',
            items: [
              {
                grams: null,
                servings: 1,
                macrosSnapshot: snapshot('Oat bowl', 400, 20),
                pantryProductId: null,
                pantryRecipeId: 'r1',
                savedMealId: null,
                pantryProduct: null,
              },
            ],
          },
        ],
      },
      {
        date: '2026-10-02',
        targetsSnapshot: TARGETS,
        mealEntries: [{ mealType: 'DINNER', items: [] }],
      },
    ]),
  };
  const service = new NutritionReportService(
    repo as unknown as StatisticsRepository,
  );
  return { service, repo };
}

describe('NutritionReportService', () => {
  it('builds days with ordered meals, totals and the saved targets', async () => {
    const { service } = setup();
    const report = await service.report('u1', '2026-10-01', '2026-10-03');

    expect(report.days.map((day) => day.date)).toEqual([
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ]);
    const first = report.days[0];
    expect(first.logged).toBe(true);
    expect(first.targets.calories).toBe(1800);
    expect(first.meals.map((meal) => meal.mealType)).toEqual([
      'BREAKFAST',
      'LUNCH',
    ]);
    expect(first.totals).toMatchObject({ calories: 600, protein: 24 });
    expect(first.meals[0].items[0].kind).toBe('RECIPE');
  });

  it('averages only logged days and ignores empty day records', async () => {
    const { service } = setup();
    const report = await service.report('u1', '2026-10-01', '2026-10-03');

    expect(report.days[1].logged).toBe(false);
    expect(report.loggedDays).toBe(1);
    expect(report.averages.calories).toBe(600);
    expect(report.averageTargets.calories).toBe(
      Math.round((1800 + 2000 + 2000) / 3),
    );
  });

  it('limits a report to one month', async () => {
    const { service } = setup();
    await expect(
      service.report('u1', '2026-01-01', '2026-03-01'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
