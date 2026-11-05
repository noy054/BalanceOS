import { TemplateLogSyncService } from './template-log-sync.service';
import {
  DayLogsRepository,
  PantryRecipeRow,
  SavedMealRow,
  TemplateProduct,
} from './day-logs.repository';
import { NutritionCalculatorService } from '../nutrition-calculator/nutrition-calculator.service';

const rice: TemplateProduct = {
  id: 'rice',
  name: 'Rice',
  imageUrl: null,
  servingQuantity: null,
  servingUnit: null,
  nutritionBasis: 'PER_100G',
  caloriesPer100g: 130,
  proteinPer100g: 2.7,
  carbsPer100g: 28,
  fatPer100g: 0.3,
  fiberPer100g: 0.4,
};

function recipe(grams: number): PantryRecipeRow {
  return {
    id: 'r1',
    name: 'Rice bowl',
    items: [{ grams, servings: null, milliliters: null, product: rice }],
  };
}

function savedMeal(id: string, recipeGrams: number): SavedMealRow {
  return {
    id,
    name: `Meal ${id}`,
    items: [
      {
        grams: null,
        servings: 1,
        milliliters: null,
        product: null,
        recipe: { ...recipe(recipeGrams), imageUrl: null },
      },
    ],
  };
}

function instance(id: string, dayLogId: string, savedMealId: string | null) {
  return {
    id,
    savedMealId,
    servings: 1,
    components: [],
    mealEntry: { dayLog: { id: dayLogId } },
  };
}

function setup() {
  let recipeGrams = 100;
  const repo = {
    transaction: jest.fn((fn: (db: string) => Promise<unknown>) => fn('tx')),
    findPantryRecipeForUser: jest.fn(() =>
      Promise.resolve(recipe(recipeGrams)),
    ),
    findSavedMealIdsWithRecipe: jest.fn().mockResolvedValue(['m1', 'm2']),
    findSavedMealsForUser: jest.fn(() =>
      Promise.resolve([
        savedMeal('m1', recipeGrams),
        savedMeal('m2', recipeGrams),
      ]),
    ),
    findTemplateInstances: jest.fn(
      (_userId: string, template: { pantryRecipeId?: string }) =>
        Promise.resolve(
          template.pantryRecipeId
            ? [instance('i1', 'log1', null), instance('i2', 'log2', null)]
            : [instance('i3', 'log1', 'm1'), instance('i4', 'log3', 'm2')],
        ),
    ),
    applyTemplateRebuilds: jest.fn().mockResolvedValue(undefined),
    recalculateTotalsForDayLogs: jest.fn().mockResolvedValue(undefined),
  };
  const service = new TemplateLogSyncService(
    repo as unknown as DayLogsRepository,
    new NutritionCalculatorService(),
  );
  const write = jest.fn(() => {
    recipeGrams = 200;
    return Promise.resolve('updated');
  });
  return { service, repo, write };
}

describe('TemplateLogSyncService.updateRecipe', () => {
  it('writes the recipe and its logged instances in one transaction with batched writes', async () => {
    const { service, repo, write } = setup();

    const result = await service.updateRecipe('u1', 'r1', '2026-11-05', write);

    expect(result).toBe('updated');
    expect(repo.transaction).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith('tx');
    expect(repo.findSavedMealsForUser).toHaveBeenCalledTimes(2);
    expect(repo.findTemplateInstances).toHaveBeenCalledTimes(2);
    expect(repo.findTemplateInstances).toHaveBeenLastCalledWith(
      'u1',
      { savedMealId: { in: ['m1', 'm2'] } },
      '2026-11-05',
      'tx',
    );
    expect(repo.applyTemplateRebuilds).toHaveBeenCalledTimes(1);
    const [rebuilds, db] = repo.applyTemplateRebuilds.mock.calls[0] as [
      Array<{ itemId: string; macrosSnapshot: { calories: number } }>,
      string,
    ];
    expect(db).toBe('tx');
    expect(rebuilds.map((rebuild) => rebuild.itemId)).toEqual([
      'i1',
      'i2',
      'i3',
      'i4',
    ]);
    expect(rebuilds.every((r) => r.macrosSnapshot.calories === 260)).toBe(true);
    expect(repo.recalculateTotalsForDayLogs).toHaveBeenCalledTimes(1);
    expect(repo.recalculateTotalsForDayLogs).toHaveBeenCalledWith(
      ['log1', 'log2', 'log3'],
      'tx',
    );
  });

  it('propagates a sync failure so the template update rolls back', async () => {
    const { service, repo, write } = setup();
    repo.applyTemplateRebuilds.mockRejectedValueOnce(new Error('db down'));

    await expect(
      service.updateRecipe('u1', 'r1', '2026-11-05', write),
    ).rejects.toThrow('db down');
    expect(repo.recalculateTotalsForDayLogs).not.toHaveBeenCalled();
  });
});
