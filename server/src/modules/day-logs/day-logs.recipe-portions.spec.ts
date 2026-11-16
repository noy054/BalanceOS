import { BadRequestException } from '@nestjs/common';
import { DayLogsService } from './day-logs.service';
import { DayLogsRepository } from './day-logs.repository';
import { NutritionCalculatorService } from '../nutrition-calculator/nutrition-calculator.service';

const chicken = {
  id: 'p1',
  name: 'Chicken',
  imageUrl: null,
  nutritionBasis: 'PER_100G',
  caloriesPer100g: 120,
  proteinPer100g: 22.5,
  carbsPer100g: 0,
  fatPer100g: 3,
  fiberPer100g: 0,
};

const rice = {
  id: 'p2',
  name: 'Rice',
  imageUrl: null,
  nutritionBasis: 'PER_100G',
  caloriesPer100g: 360,
  proteinPer100g: 7,
  carbsPer100g: 80,
  fatPer100g: 1,
  fiberPer100g: 1,
};

function recipe(overrides: object = {}) {
  return {
    id: 'r1',
    name: 'Chicken & rice',
    cookedWeightG: 4000,
    portionMode: 'COUNT',
    portionCount: 5,
    portionTarget: null,
    portionTargetValue: null,
    leftoverMode: null,
    items: [
      { grams: 800, servings: null, milliliters: null, product: chicken },
      { grams: 500, servings: null, milliliters: null, product: rice },
    ],
    ...overrides,
  };
}

function setup(row: object) {
  const repo = {
    findPantryRecipeForUser: jest.fn().mockResolvedValue(row),
    findOrCreateToday: jest.fn().mockResolvedValue({ id: 'log1' }),
    findUserTargets: jest.fn().mockResolvedValue({}),
    findToday: jest.fn().mockResolvedValue({ id: 'log1' }),
    findOrCreateMealEntry: jest.fn().mockResolvedValue({ id: 'entry' }),
    createMealItem: jest.fn().mockResolvedValue({ id: 'item' }),
    recalculateAndSaveTotals: jest.fn().mockResolvedValue({}),
  };
  const service = new DayLogsService(
    repo as unknown as DayLogsRepository,
    new NutritionCalculatorService(),
  );
  return { service, repo };
}

describe('DayLogsService recipe portions', () => {
  it('logs one portion as its share of the batch', async () => {
    const { service, repo } = setup(recipe());
    await service.addMealItemOnDate('u1', '2026-11-12', {
      mealType: 'LUNCH',
      pantryRecipeId: 'r1',
      portions: 1,
    });
    expect(repo.createMealItem).toHaveBeenCalledWith(
      'entry',
      expect.objectContaining({
        servings: 0.2,
        portions: 1,
        grams: 800,
        macrosSnapshot: expect.objectContaining({
          calories: 552,
          protein: 43,
          carbs: 80,
        }),
      }),
      'log1',
    );
  });

  it('logs cooked grams against the net cooked weight', async () => {
    const { service, repo } = setup(recipe());
    await service.addMealItemOnDate('u1', '2026-11-12', {
      mealType: 'LUNCH',
      pantryRecipeId: 'r1',
      grams: 400,
    });
    expect(repo.createMealItem).toHaveBeenCalledWith(
      'entry',
      expect.objectContaining({
        servings: 0.1,
        grams: 400,
        portions: undefined,
        macrosSnapshot: expect.objectContaining({ calories: 276 }),
      }),
      'log1',
    );
  });

  it('logs grams against the ingredient weight before cooking', async () => {
    const { service, repo } = setup(recipe({ cookedWeightG: null }));
    await service.addMealItemOnDate('u1', '2026-11-12', {
      mealType: 'LUNCH',
      pantryRecipeId: 'r1',
      portions: 1,
    });
    expect(repo.createMealItem).toHaveBeenCalledWith(
      'entry',
      expect.objectContaining({ servings: 0.2, portions: 1, grams: 260 }),
      'log1',
    );
  });

  it('explains when portions or the cooked weight are missing', async () => {
    const noPlan = setup(recipe({ portionMode: null }));
    await expect(
      noPlan.service.addMealItemOnDate('u1', '2026-11-12', {
        mealType: 'LUNCH',
        pantryRecipeId: 'r1',
        portions: 1,
      }),
    ).rejects.toThrow('This recipe has no portion setup');
    const noWeight = setup(
      recipe({
        cookedWeightG: null,
        items: [
          { grams: null, servings: 2, milliliters: null, product: chicken },
        ],
      }),
    );
    await expect(
      noWeight.service.addMealItemOnDate('u1', '2026-11-12', {
        mealType: 'LUNCH',
        pantryRecipeId: 'r1',
        grams: 300,
      }),
    ).rejects.toThrow('every ingredient weight');
    await expect(
      noWeight.service.addMealItemOnDate('u1', '2026-11-12', {
        mealType: 'LUNCH',
        pantryRecipeId: 'r1',
        servings: 1,
        portions: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
