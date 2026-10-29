import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DayLogsService } from './day-logs.service';
import { DayLogsRepository } from './day-logs.repository';
import { NutritionCalculatorService } from '../nutrition-calculator/nutrition-calculator.service';

const snapshot = {
  name: 'Rolled oats',
  calories: 227,
  protein: 7.9,
  carbs: 40.6,
  fat: 3.9,
  fiber: 6.1,
};

function setup(item: object | null) {
  const repo = {
    findMealItemForUpdate: jest.fn().mockResolvedValue(item),
    updateMealItemAmount: jest.fn().mockResolvedValue({ id: 'i1' }),
    recalculateAndSaveTotals: jest.fn().mockResolvedValue({}),
  };
  const service = new DayLogsService(
    repo as unknown as DayLogsRepository,
    new NutritionCalculatorService(),
  );
  return { service, repo };
}

const owned = (amount: { grams: number | null; servings: number | null }) => ({
  id: 'i1',
  ...amount,
  macrosSnapshot: snapshot,
  mealEntry: { dayLog: { id: 'log1' } },
});

describe('DayLogsService.updateMealItem', () => {
  it('scales the stored snapshot to the new grams and recalculates the day', async () => {
    const { service, repo } = setup(owned({ grams: 60, servings: null }));
    await service.updateMealItem('u1', 'i1', { grams: 90 });
    expect(repo.findMealItemForUpdate).toHaveBeenCalledWith('i1', 'u1');
    expect(repo.updateMealItemAmount).toHaveBeenCalledWith('i1', {
      grams: 90,
      servings: null,
      macrosSnapshot: {
        name: 'Rolled oats',
        calories: 341,
        protein: 11.9,
        carbs: 60.9,
        fat: 5.9,
        fiber: 9.1,
      },
    });
    expect(repo.recalculateAndSaveTotals).toHaveBeenCalledWith('log1');
  });

  it('keeps serving-based items in servings', async () => {
    const { service, repo } = setup(owned({ grams: null, servings: 2 }));
    await service.updateMealItem('u1', 'i1', { servings: 3 });
    expect(repo.updateMealItemAmount).toHaveBeenCalledWith(
      'i1',
      expect.objectContaining({ grams: null, servings: 3 }),
    );
  });

  it('refuses a unit change, a missing amount, and items without an amount', async () => {
    const grams = setup(owned({ grams: 60, servings: null }));
    await expect(
      grams.service.updateMealItem('u1', 'i1', { servings: 2 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      grams.service.updateMealItem('u1', 'i1', {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    const saved = setup(owned({ grams: null, servings: null }));
    await expect(
      saved.service.updateMealItem('u1', 'i1', { servings: 2 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(grams.repo.updateMealItemAmount).not.toHaveBeenCalled();
    expect(saved.repo.updateMealItemAmount).not.toHaveBeenCalled();
  });

  it('returns not found for items owned by another user', async () => {
    const { service, repo } = setup(null);
    await expect(
      service.updateMealItem('u2', 'i1', { grams: 50 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.updateMealItemAmount).not.toHaveBeenCalled();
  });
});
