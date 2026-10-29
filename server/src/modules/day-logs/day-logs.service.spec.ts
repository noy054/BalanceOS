import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DayLogsService } from './day-logs.service';
import { DayLogsRepository } from './day-logs.repository';
import { NutritionCalculatorService } from '../nutrition-calculator/nutrition-calculator.service';

const targets = {
  calories: 2100,
  protein: 140,
  carbs: 220,
  fat: 70,
  fiber: 30,
};

function setup() {
  const repo = {
    findToday: jest.fn().mockResolvedValue(null),
    findUserTargets: jest.fn().mockResolvedValue(targets),
    findOrCreateToday: jest
      .fn()
      .mockImplementation((_userId: string, date: string) =>
        Promise.resolve({ id: `log-${date}`, date }),
      ),
    findOrCreateMealEntry: jest.fn().mockResolvedValue({ id: 'entry' }),
    findPantryProductForUser: jest.fn().mockResolvedValue({ id: 'p1' }),
    findSavedMealForUser: jest.fn(),
    findMealEntryWithItems: jest.fn(),
    findMealItemForCopy: jest.fn(),
    createMealItem: jest.fn().mockResolvedValue({ id: 'item' }),
    recalculateAndSaveTotals: jest.fn().mockResolvedValue({}),
    findDaysInRange: jest.fn(),
  };
  const calculator = {
    productSnapshot: jest.fn().mockReturnValue({
      name: 'Egg',
      calories: 72,
      protein: 6.3,
      carbs: 0.4,
      fat: 4.8,
      fiber: 0,
    }),
    recipeSnapshot: jest.fn().mockReturnValue(null),
    savedMealSnapshot: jest.fn(),
    sumTotals: jest.fn(),
  };
  const service = new DayLogsService(
    repo as unknown as DayLogsRepository,
    calculator as unknown as NutritionCalculatorService,
  );
  return { service, repo, calculator };
}

describe('DayLogsService dated days', () => {
  it('returns an empty day with current targets without creating a log', async () => {
    const { service, repo } = setup();
    const day = await service.getDay('u1', '2026-11-03');
    expect(day).toEqual(
      expect.objectContaining({
        id: null,
        date: '2026-11-03',
        targetsSnapshot: targets,
        caloriesTotal: 0,
      }),
    );
    expect(repo.findOrCreateToday).not.toHaveBeenCalled();
  });

  it('logs an item on the requested date, not the server date', async () => {
    const { service, repo } = setup();
    await service.addMealItemOnDate('u1', '2026-10-25', {
      mealType: 'LUNCH',
      pantryProductId: 'p1',
      servings: 1,
    });
    expect(repo.findOrCreateToday).toHaveBeenCalledWith(
      'u1',
      '2026-10-25',
      targets,
    );
    expect(repo.recalculateAndSaveTotals).toHaveBeenCalledWith(
      'log-2026-10-25',
    );
  });

  it('lists only days that have logged items', async () => {
    const { service, repo } = setup();
    repo.findDaysInRange.mockResolvedValue([
      {
        date: '2026-10-27',
        caloriesTotal: 1840.4,
        mealEntries: [{ _count: { items: 2 } }, { _count: { items: 1 } }],
      },
      {
        date: '2026-10-29',
        caloriesTotal: 0,
        mealEntries: [{ _count: { items: 0 } }],
      },
    ]);
    const result = await service.getCalendar('u1', '2026-10-01', '2026-10-31');
    expect(result.days).toEqual([
      { date: '2026-10-27', calories: 1840, itemCount: 3 },
    ]);
  });

  it('rejects reversed or oversized calendar ranges', async () => {
    const { service } = setup();
    await expect(
      service.getCalendar('u1', '2026-10-31', '2026-10-01'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.getCalendar('u1', '2026-01-01', '2026-06-01'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses to log far-future days', async () => {
    const { service, repo } = setup();
    await expect(
      service.addMealItemOnDate('u1', '2099-12-31', {
        mealType: 'LUNCH',
        pantryProductId: 'p1',
        servings: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.copyMealEntry('u1', 'e1', { targetDates: ['2099-12-31'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.createMealItem).not.toHaveBeenCalled();
    expect(repo.findMealEntryWithItems).not.toHaveBeenCalled();
  });

  it('refuses a saved meal with an item that cannot be calculated', async () => {
    const { service, repo, calculator } = setup();
    calculator.productSnapshot.mockReturnValue(null);
    repo.findSavedMealForUser.mockResolvedValue({
      name: 'Breakfast',
      items: [
        {
          product: { nutritionBasis: 'PER_SERVING' },
          grams: null,
          servings: 1,
          recipe: null,
        },
      ],
    });
    await expect(
      service.addMealItemOnDate('u1', '2026-10-25', {
        mealType: 'BREAKFAST',
        savedMealId: 'm1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.createMealItem).not.toHaveBeenCalled();
  });
  it('copies a single meal item into the same meal on each target day', async () => {
    const { service, repo } = setup();
    const snapshot = { name: 'Egg', calories: 72, protein: 6.3 };
    repo.findMealItemForCopy.mockResolvedValue({
      pantryProductId: 'p1',
      pantryRecipeId: null,
      savedMealId: null,
      grams: 50,
      servings: null,
      macrosSnapshot: snapshot,
      mealEntry: { mealType: 'BREAKFAST' },
    });

    await service.copyMealItem('u1', 'i1', {
      targetDates: ['2026-11-03', '2026-11-04'],
    });

    expect(repo.findMealItemForCopy).toHaveBeenCalledWith('i1', 'u1');
    expect(repo.findOrCreateMealEntry).toHaveBeenCalledWith(
      'log-2026-11-03',
      'BREAKFAST',
    );
    expect(repo.findOrCreateMealEntry).toHaveBeenCalledWith(
      'log-2026-11-04',
      'BREAKFAST',
    );
    expect(repo.createMealItem).toHaveBeenCalledTimes(2);
    expect(repo.createMealItem).toHaveBeenCalledWith('entry', {
      pantryProductId: 'p1',
      pantryRecipeId: undefined,
      savedMealId: undefined,
      grams: 50,
      servings: undefined,
      macrosSnapshot: snapshot,
    });
    expect(repo.recalculateAndSaveTotals).toHaveBeenCalledTimes(2);
  });

  it('does not copy a meal item owned by another user', async () => {
    const { service, repo } = setup();
    repo.findMealItemForCopy.mockResolvedValue(null);
    await expect(
      service.copyMealItem('u1', 'i1', { targetDates: ['2026-11-03'] }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.createMealItem).not.toHaveBeenCalled();
  });
});
