import { BadRequestException } from '@nestjs/common';
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
  };
  const service = new DayLogsService(
    repo as unknown as DayLogsRepository,
    calculator as unknown as NutritionCalculatorService,
  );
  return { service, repo };
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
});
