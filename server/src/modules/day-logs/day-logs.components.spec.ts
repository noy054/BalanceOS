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
        baseMacros: {
          amount: 100,
          calories: 15,
          protein: 0.7,
          carbs: 3.6,
          fat: 0.1,
          fiber: 0.5,
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
    expect(repo.recalculateAndSaveTotals).toHaveBeenCalledWith('log1', 'tx');
  });

  it('lowers an ingredient to zero and restores it from the stored reference', async () => {
    const zero = setup(component);
    await zero.service.updateMealItemComponent('u1', 'i1', 'c1', { grams: 0 });
    const [saved, item] = zero.repo.updateComponentAndItem.mock.calls[0] as [
      { grams: number; macrosSnapshot: object; baseMacros: object },
      { macrosSnapshot: object },
    ];
    expect(saved.grams).toBe(0);
    expect(saved.macrosSnapshot).toEqual({
      name: 'Cucumber',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    });
    expect(item.macrosSnapshot).toEqual({
      name: 'Salad',
      calories: 200,
      protein: 10,
      carbs: 10,
      fat: 16,
      fiber: 4,
    });

    const restored = setup({
      ...component,
      grams: 0,
      macrosSnapshot: saved.macrosSnapshot,
      baseMacros: saved.baseMacros,
      mealItem: { ...component.mealItem, macrosSnapshot: item.macrosSnapshot },
    });
    await restored.service.updateMealItemComponent('u1', 'i1', 'c1', {
      grams: 200,
    });
    const [again, total] = restored.repo.updateComponentAndItem.mock
      .calls[0] as [{ macrosSnapshot: object }, { macrosSnapshot: object }];
    expect(again.macrosSnapshot).toEqual({
      name: 'Cucumber',
      calories: 30,
      protein: 1.4,
      carbs: 7.2,
      fat: 0.2,
      fiber: 1,
    });
    expect(total.macrosSnapshot).toMatchObject({
      calories: 230,
      protein: 11.4,
    });
  });

  it('refuses a zero-amount ingredient with no stored reference', async () => {
    const { service } = setup({ ...component, grams: 0 });
    await expect(
      service.updateMealItemComponent('u1', 'i1', 'c1', { grams: 50 }),
    ).rejects.toBeInstanceOf(BadRequestException);
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
