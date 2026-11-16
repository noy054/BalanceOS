import { NotFoundException } from '@nestjs/common';
import { DayLogsService } from './day-logs.service';
import { DayLogsRepository } from './day-logs.repository';
import { NutritionCalculatorService } from '../nutrition-calculator/nutrition-calculator.service';

function setup(found: object | null) {
  const repo = {
    withMealItemLock: jest.fn(
      (_id: string, fn: (db: string) => Promise<unknown>) => fn('tx'),
    ),
    findMealItemForMove: jest.fn().mockResolvedValue(found),
    findOrCreateMealEntryIn: jest.fn().mockResolvedValue({ id: 'lunch' }),
    moveMealItem: jest.fn().mockResolvedValue(undefined),
    recalculateAndSaveTotals: jest.fn().mockResolvedValue(undefined),
  };
  const service = new DayLogsService(
    repo as unknown as DayLogsRepository,
    new NutritionCalculatorService(),
  );
  return { service, repo };
}

const salad = {
  id: 'i1',
  mealEntry: { id: 'breakfast', mealType: 'BREAKFAST', dayLogId: 'log1' },
};

describe('DayLogsService.moveMealItem', () => {
  it('moves the item to the other meal of the same day inside the item lock and recalculates the day', async () => {
    const { service, repo } = setup(salad);
    await expect(
      service.moveMealItem('u1', 'i1', { mealType: 'LUNCH' }),
    ).resolves.toEqual({ id: 'i1', mealEntryId: 'lunch' });
    expect(repo.findMealItemForMove).toHaveBeenCalledWith('i1', 'u1', 'tx');
    expect(repo.findOrCreateMealEntryIn).toHaveBeenCalledWith(
      'log1',
      'LUNCH',
      'tx',
    );
    expect(repo.moveMealItem).toHaveBeenCalledWith('i1', 'lunch', 'tx');
    expect(repo.recalculateAndSaveTotals).toHaveBeenCalledWith('log1', 'tx');
  });

  it('leaves an item already in the requested meal untouched', async () => {
    const { service, repo } = setup(salad);
    await expect(
      service.moveMealItem('u1', 'i1', { mealType: 'BREAKFAST' }),
    ).resolves.toEqual({ id: 'i1', mealEntryId: 'breakfast' });
    expect(repo.moveMealItem).not.toHaveBeenCalled();
  });

  it('refuses items that belong to another user', async () => {
    const { service, repo } = setup(null);
    await expect(
      service.moveMealItem('u1', 'i1', { mealType: 'LUNCH' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.moveMealItem).not.toHaveBeenCalled();
  });
});
