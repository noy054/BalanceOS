import {
  activityFactor,
  ageOn,
  calculateTargets,
  macroTargets,
  mifflinStJeor,
  smoothedWeight,
} from './target-calculator';

const PROFILE = {
  weightKg: 80,
  heightCm: 180,
  ageYears: 30,
  gender: 'MALE' as const,
  trainingDaysPerWeek: 4,
  goal: 'MAINTENANCE' as const,
};

describe('target calculator', () => {
  it('applies the Mifflin-St Jeor formula for each sex', () => {
    expect(mifflinStJeor(PROFILE)).toBe(1780);
    expect(mifflinStJeor({ ...PROFILE, gender: 'FEMALE' })).toBe(1614);
    expect(mifflinStJeor({ ...PROFILE, gender: 'OTHER' })).toBe(1697);
  });

  it('maps training days to standard activity factors', () => {
    expect(activityFactor(0)).toBe(1.2);
    expect(activityFactor(2)).toBe(1.375);
    expect(activityFactor(4)).toBe(1.55);
    expect(activityFactor(6)).toBe(1.725);
    expect(activityFactor(7)).toBe(1.9);
  });

  it('derives calories from TDEE and the goal', () => {
    const maintenance = calculateTargets(PROFILE);
    expect(maintenance.bmr).toBe(1780);
    expect(maintenance.tdee).toBe(2759);
    expect(maintenance.calories).toBe(2760);
    expect(calculateTargets({ ...PROFILE, goal: 'CUTTING' }).calories).toBe(
      2210,
    );
    expect(calculateTargets({ ...PROFILE, goal: 'BULKING' }).calories).toBe(
      3030,
    );
  });

  it('keeps cutting targets at or above BMR and the minimum', () => {
    const small = calculateTargets({
      ...PROFILE,
      weightKg: 45,
      heightCm: 150,
      ageYears: 60,
      gender: 'FEMALE',
      trainingDaysPerWeek: 0,
      goal: 'CUTTING',
    });
    expect(small.calories).toBeGreaterThanOrEqual(1200);
    expect(small.calories).toBeGreaterThanOrEqual(small.bmr);
  });

  it('builds body-weight based macros that match the calories', () => {
    const macros = macroTargets(2760, 80, 'MAINTENANCE');
    expect(macros).toEqual({
      calories: 2760,
      protein: 160,
      fat: 77,
      carbs: 358,
      fiber: 39,
    });
    const cutting = macroTargets(2210, 80, 'CUTTING');
    expect(cutting.protein).toBe(176);
    const total = cutting.protein * 4 + cutting.carbs * 4 + cutting.fat * 9;
    expect(Math.abs(total - 2210)).toBeLessThanOrEqual(10);
  });

  it('caps protein for low calorie targets so carbs never go negative', () => {
    const macros = macroTargets(1200, 150, 'CUTTING');
    expect(macros.protein).toBe(120);
    expect(macros.carbs).toBeGreaterThanOrEqual(0);
    expect(macros.protein * 4).toBeLessThanOrEqual(1200 * 0.4);
  });

  it('averages recent weigh-ins and falls back to the latest one', () => {
    expect(
      smoothedWeight([
        { date: '2026-11-01', weightKg: 81 },
        { date: '2026-11-05', weightKg: 80 },
        { date: '2026-11-09', weightKg: 79.4 },
        { date: '2026-10-01', weightKg: 85 },
      ]),
    ).toEqual({
      value: 80.1,
      basis: 'average',
      count: 3,
      from: '2026-11-01',
      to: '2026-11-09',
    });
    expect(
      smoothedWeight([
        { date: '2026-10-01', weightKg: 85 },
        { date: '2026-11-09', weightKg: 79.4 },
      ]),
    ).toEqual({
      value: 79.4,
      basis: 'latest',
      count: 1,
      from: '2026-11-09',
      to: '2026-11-09',
    });
    expect(smoothedWeight([])).toBeNull();
  });

  it('computes age on a given day', () => {
    const birth = new Date('1996-11-10T12:00:00.000Z');
    expect(ageOn(birth, '2026-11-09')).toBe(29);
    expect(ageOn(birth, '2026-11-10')).toBe(30);
  });
});
