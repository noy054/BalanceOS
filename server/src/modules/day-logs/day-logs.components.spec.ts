import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DayLogsService } from './day-logs.service';
import { DayLogsRepository } from './day-logs.repository';
import { NutritionCalculatorService } from '../nutrition-calculator/nutrition-calculator.service';

const cucumber = {
  name: 'Cucumber',
  calories: 15,
  protein: 0.7,
  carbs: 3.6,
  fat: 0.1,
  fiber: 0.5,
};

const salad = {
  name: 'Salad',
  calories: 215,
  protein: 10.7,
  carbs: 13.6,
  fat: 16.1,
  fiber: 4.5,
};

function setup(component: object | null) {
  const repo = {
    withMealItemLock: jest.fn(
      (_id: string, fn: (db: string) => Promise<unknown>) => fn('tx'),
    ),
    findComponentForUpdate: jest.fn().mockResolvedValue(component),
    updateComponentAndItem: jest.fn().mockResolvedValue([]),
    recalculateAndSaveTotals: jest.fn().mockResolvedValue({}),
  };
  const service = new DayLogsService(
    repo as unknown as DayLogsRepository,
    new NutritionCalculatorService(),
  );
  return { service, repo };
}

const component = {
  id: 'c1',
  grams: 100,
  servings: null,
  milliliters: null,
  macrosSnapshot: cucumber,
  mealItem: {
    id: 'i1',
    macrosSnapshot: salad,
    mealEntry: { dayLog: { id: 'log1' } },
  },
};

describe('DayLogsService.updateMealItemComponent', () => {
  it('scales only the ingredient snapshot and moves the logged item by the difference', async () => {
    const { service, repo } = setup(component);
    await service.updateMealItemComponent('u1', 'i1', 'c1', { grams: 250 });
    expect(repo.findComponentForUpdate).toHaveBeenCalledWith(
      'c1',
      'i1',
      'u1',
      'tx',
    );
    expect(repo.updateComponentAndItem).toHaveBeenCalledWith(
      {
        id: 'c1',
        grams: 250,
        servings: null,
        milliliters: null,
        macrosSnapshot: {
          name: 'Cucumber',
          calories: 38,
          protein: 1.8,
          carbs: 9,
          fat: 0.3,
          fiber: 1.3,
        },
      },
      {
        id: 'i1',
        macrosSnapshot: {
          name: 'Salad',
          calories: 238,
          protein: 11.8,
          carbs: 19,
          fat: 16.3,
          fiber: 5.3,
        },
      },
      'tx',
    );
    expect(repo.recalculateAndSaveTotals).toHaveBeenCalledWith('log1');
  });

  it('refuses a different unit and unknown ingredients', async () => {
    const grams = setup(component);
    await expect(
      grams.service.updateMealItemComponent('u1', 'i1', 'c1', { servings: 2 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    const missing = setup(null);
    await expect(
      missing.service.updateMealItemComponent('u2', 'i1', 'c1', { grams: 50 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(grams.repo.updateComponentAndItem).not.toHaveBeenCalled();
    expect(missing.repo.updateComponentAndItem).not.toHaveBeenCalled();
  });
});
