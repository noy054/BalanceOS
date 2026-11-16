import { NutritionSettingsService } from './nutrition-settings.service';
import { NutritionSettingsRepository } from './nutrition-settings.repository';

const PROFILE: Record<string, unknown> = {
  experienceMode: 'GUIDED',
  targetMode: 'AUTO',
  gender: 'MALE',
  birthDate: new Date('1996-01-15T12:00:00.000Z'),
  heightCm: 180,
  weightKg: 82,
  trainingDaysPerWeek: 4,
  goalType: 'MAINTENANCE',
  dailyCaloriesTarget: 2760,
  proteinTarget: 160,
  carbsTarget: 358,
  fatTarget: 77,
  fiberTarget: 39,
};

function setup(
  settings: Partial<typeof PROFILE> | null,
  weighIns: { date: string; weightKg: number }[],
) {
  const repo = {
    findByUserId: jest
      .fn()
      .mockResolvedValue(settings ? { ...PROFILE, ...settings } : null),
    findRecentWeighIns: jest.fn().mockResolvedValue(weighIns),
  };
  const service = new NutritionSettingsService(
    repo as unknown as NutritionSettingsRepository,
  );
  return { service, repo };
}

const NOW = new Date('2026-11-09T10:00:00.000Z');

describe('NutritionSettingsService.getTargetSuggestion', () => {
  it('lists missing profile fields and suggests nothing', async () => {
    const { service } = setup(
      { gender: undefined, birthDate: undefined, goalType: undefined },
      [],
    );
    const result = await service.getTargetSuggestion('u1', NOW);
    expect(result.available).toBe(false);
    expect(result.missing).toEqual(['gender', 'birthDate', 'goalType']);
    expect(result.suggested).toBeNull();
    expect(result.meaningful).toBe(false);
  });

  it('uses the average of recent weigh-ins and ignores small changes', async () => {
    const { service } = setup({}, [
      { date: '2026-11-09', weightKg: 74 },
      { date: '2026-11-05', weightKg: 75 },
      { date: '2026-11-01', weightKg: 76 },
    ]);
    const result = await service.getTargetSuggestion('u1', NOW);
    expect(result.weight).toEqual({
      value: 75,
      basis: 'average',
      count: 3,
      from: '2026-11-01',
      to: '2026-11-09',
    });
    expect(result.suggested?.calories).toBe(2680);
    expect(result.calorieDifference).toBe(-80);
    expect(result.meaningful).toBe(false);
  });

  it('marks a difference of at least 100 kcal as meaningful', async () => {
    const { service } = setup({}, [
      { date: '2026-11-09', weightKg: 70 },
      { date: '2026-11-06', weightKg: 70 },
      { date: '2026-11-03', weightKg: 70 },
    ]);
    const result = await service.getTargetSuggestion('u1', NOW);
    expect(result.suggested?.calories).toBe(2600);
    expect(result.calorieDifference).toBe(-160);
    expect(result.meaningful).toBe(true);
    expect(result.current?.calories).toBe(2760);
  });

  it('falls back to the profile weight when there are no weigh-ins', async () => {
    const { service } = setup({}, []);
    const result = await service.getTargetSuggestion('u1', NOW);
    expect(result.weight).toEqual({
      value: 82,
      basis: 'profile',
      count: 0,
      from: null,
      to: null,
    });
    expect(result.available).toBe(true);
  });

  it('reports Expert users as Manual so the client can offer a confirmable suggestion', async () => {
    const { service } = setup(
      { experienceMode: 'EXPERT', targetMode: 'AUTO' } as Partial<
        typeof PROFILE
      >,
      [{ date: '2026-11-09', weightKg: 70 }],
    );
    const result = await service.getTargetSuggestion('u1', NOW);
    expect(result.experienceMode).toBe('EXPERT');
    expect(result.targetMode).toBe('MANUAL');
    expect(result.available).toBe(true);
    expect(result.meaningful).toBe(true);
  });

  it('treats a user without targets as needing a suggestion', async () => {
    const { service } = setup({ dailyCaloriesTarget: undefined }, []);
    const result = await service.getTargetSuggestion('u1', NOW);
    expect(result.current).toBeNull();
    expect(result.calorieDifference).toBeNull();
    expect(result.meaningful).toBe(true);
  });
});
