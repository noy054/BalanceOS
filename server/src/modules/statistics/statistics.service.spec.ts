import { StatisticsService } from './statistics.service';
import { StatisticsRepository } from './statistics.repository';

const CURRENT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
  fiber: 25,
};

function item(
  name: string,
  calories: number,
  imageUrl: string | null = null,
  amount: Partial<{
    grams: number;
    servings: number;
    milliliters: number;
    savedMealId: string;
  }> = {},
) {
  return {
    grams: amount.grams ?? null,
    servings: amount.servings ?? null,
    milliliters: amount.milliliters ?? null,
    savedMealId: amount.savedMealId ?? null,
    macrosSnapshot: { name, calories, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    pantryProduct: imageUrl ? { imageUrl } : null,
    pantryRecipe: null,
    savedMeal: null,
  };
}

function setup() {
  const repo = {
    findUserTargets: jest.fn().mockResolvedValue(CURRENT_TARGETS),
    findDayLogsInRange: jest.fn().mockResolvedValue([
      {
        date: '2026-10-29',
        caloriesTotal: 1500,
        proteinTotal: 100,
        carbsTotal: 150,
        fatTotal: 50,
        fiberTotal: 21,
        targetsSnapshot: { ...CURRENT_TARGETS, calories: 1600, protein: 120 },
        mealEntries: [
          {
            mealType: 'BREAKFAST',
            items: [
              item('Yogurt', 300, 'file:///yogurt.jpg'),
              item('Oats', 400),
            ],
          },
          { mealType: 'LUNCH', items: [item('Yogurt', 300)] },
        ],
      },
      {
        date: '2026-10-31',
        caloriesTotal: 2100,
        proteinTotal: 160,
        carbsTotal: 210,
        fatTotal: 70,
        fiberTotal: 30,
        targetsSnapshot: 'invalid',
        mealEntries: [{ mealType: 'DINNER', items: [item('Rice', 500)] }],
      },
      {
        date: '2026-10-30',
        caloriesTotal: 0,
        proteinTotal: 0,
        carbsTotal: 0,
        fatTotal: 0,
        fiberTotal: 0,
        targetsSnapshot: CURRENT_TARGETS,
        mealEntries: [{ mealType: 'LUNCH', items: [] }],
      },
    ]),
  };
  const service = new StatisticsService(
    repo as unknown as StatisticsRepository,
  );
  return { service, repo };
}

describe('StatisticsService', () => {
  it('averages a calendar week only over days up to the local today', async () => {
    const { service } = setup();

    const stats = await service.getStatistics(
      'u1',
      '7D',
      '2026-10-31',
      '2026-10-29',
    );

    expect(stats.startDate).toBe('2026-10-25');
    expect(stats.dailyTrend).toHaveLength(7);
    expect(stats.summary.totalDays).toBe(5);
    expect(stats.summary.loggedDays).toBe(1);
    expect(stats.summary.avgCalories).toBe(300);
    expect(
      stats.dailyTrend.find((day) => day.date === '2026-10-31'),
    ).toMatchObject({ logged: false, calories: 0 });
  });

  it('reports every day with its nutrients and the targets saved for that day', async () => {
    const { service } = setup();

    const stats = await service.getStatistics('u1', '7D', '2026-10-31');

    expect(stats.dailyTrend).toHaveLength(7);
    const logged = stats.dailyTrend.find((day) => day.date === '2026-10-29');
    expect(logged).toMatchObject({
      logged: true,
      calories: 1500,
      protein: 100,
      fiber: 21,
      target: 1600,
      targets: { calories: 1600, protein: 120, fiber: 25 },
    });
    const fallback = stats.dailyTrend.find((day) => day.date === '2026-10-31');
    expect(fallback?.targets).toEqual(CURRENT_TARGETS);
    const empty = stats.dailyTrend.find((day) => day.date === '2026-10-30');
    expect(empty).toMatchObject({ logged: false, calories: 0 });
  });

  it('counts days within 15% of that day target', async () => {
    const { service } = setup();

    const stats = await service.getStatistics('u1', '7D', '2026-10-31');

    expect(stats.summary.onTargetDays).toBe(2);
    expect(stats.summary.loggedDays).toBe(2);
  });

  it('keeps averaging over the whole range and adds fiber', async () => {
    const { service } = setup();

    const stats = await service.getStatistics('u1', '7D', '2026-10-31');

    expect(stats.summary.avgCalories).toBe(Math.round(3600 / 7));
    expect(stats.macroAccuracy.fiber).toEqual({
      avg: Math.round((51 / 7) * 10) / 10,
      target: 25,
      pct: Math.round((Math.round((51 / 7) * 10) / 10 / 25) * 100),
    });
  });

  it('ranks foods with the first available image', async () => {
    const { service } = setup();

    const stats = await service.getStatistics('u1', '7D', '2026-10-31');

    expect(stats.topCalorieSources[0]).toEqual({
      name: 'Yogurt',
      totalCalories: 600,
      count: 2,
      imageUrl: 'file:///yogurt.jpg',
      unitCalories: null,
      unitBasis: null,
    });
    expect(stats.mostUsedFoods[0]).toMatchObject({ name: 'Yogurt', count: 2 });
    expect(stats.topCalorieSources[1].imageUrl).toBeNull();
  });

  it('reports calories per logged basis and keeps snacks below meals', async () => {
    const { service, repo } = setup();
    repo.findDayLogsInRange.mockResolvedValue([
      {
        date: '2026-10-30',
        caloriesTotal: 1200,
        proteinTotal: 0,
        carbsTotal: 0,
        fatTotal: 0,
        fiberTotal: 0,
        targetsSnapshot: CURRENT_TARGETS,
        mealEntries: [
          {
            mealType: 'SNACK_1',
            items: [
              item('Bar', 200, null, { servings: 1 }),
              item('Bar', 400, null, { servings: 2 }),
              item('Bar', 200, null, { servings: 1 }),
            ],
          },
          {
            mealType: 'LUNCH',
            items: [
              item('Rice', 260, null, { grams: 200 }),
              item('Bowl', 500, null, { savedMealId: 'm1' }),
            ],
          },
        ],
      },
    ]);

    const stats = await service.getStatistics('u1', '7D', '2026-10-31');

    expect(stats.topCalorieSources[0]).toMatchObject({
      name: 'Bar',
      totalCalories: 800,
      count: 3,
      unitCalories: 200,
      unitBasis: 'serving',
    });
    expect(
      stats.topCalorieSources.find((food) => food.name === 'Rice'),
    ).toMatchObject({ unitCalories: 130, unitBasis: '100g' });
    expect(
      stats.topCalorieSources.find((food) => food.name === 'Bowl'),
    ).toMatchObject({ unitCalories: 500, unitBasis: 'meal' });
    expect(stats.mostUsedFoods.map((food) => food.name)).toEqual([
      'Rice',
      'Bowl',
      'Bar',
    ]);
    expect(stats.mostUsedFoods[2].isSnack).toBe(true);
  });

  it('does not count a day record without items as logged', async () => {
    const { service } = setup();

    const stats = await service.getStatistics('u1', '7D', '2026-10-31');

    const empty = stats.dailyTrend.find((day) => day.date === '2026-10-30');
    expect(empty).toMatchObject({ logged: false, calories: 0 });
    expect(stats.summary.loggedDays).toBe(2);
  });

  it('compares every summary value with the targets saved for each day', async () => {
    const { service, repo } = setup();
    repo.findUserTargets.mockResolvedValue({
      ...CURRENT_TARGETS,
      calories: 2500,
    });

    const stats = await service.getStatistics('u1', '7D', '2026-10-31');

    const calorieTargets = 1600 + 2000 + 2500 * 5;
    expect(stats.macroAccuracy.calories.target).toBe(
      Math.round(calorieTargets / 7),
    );
    expect(stats.summary.targetCalories).toBe(Math.round(calorieTargets / 7));
    expect(stats.summary.calorieBalance).toBe(3600 - calorieTargets);
    expect(stats.summary.avgDailyCalorieGap).toBe(
      Math.round((3600 - calorieTargets) / 7),
    );
    expect(stats.macroAccuracy.protein.target).toBe(
      Math.round(((120 + 150 * 6) / 7) * 10) / 10,
    );
  });
});
