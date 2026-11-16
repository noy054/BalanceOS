import {
  itemWeight,
  netCookedWeight,
  planPortions,
  PortionSetup,
  rawBatchWeight,
} from './recipe-portions';

const TOTALS = {
  calories: 3600,
  protein: 180,
  carbs: 300,
  fat: 120,
  fiber: 40,
};

const BASE: PortionSetup = {
  cookedWeightG: 4000,
  portionMode: null,
  portionCount: null,
  portionTarget: null,
  portionTargetValue: null,
  leftoverMode: null,
};

describe('recipe portions', () => {
  it('derives the edible yield from the pot weights or uses the net weight', () => {
    expect(
      netCookedWeight({ emptyPotWeightG: 1000, potWithFoodWeightG: 5000 }),
    ).toBe(4000);
    expect(netCookedWeight({ cookedWeightG: 3200 })).toBe(3200);
    expect(
      netCookedWeight({ emptyPotWeightG: 1000, potWithFoodWeightG: 900 }),
    ).toBe('invalid');
    expect(netCookedWeight({ emptyPotWeightG: 1000 })).toBe('invalid');
    expect(netCookedWeight({})).toBeNull();
  });

  it('splits a batch into equal portions', () => {
    const plan = planPortions(TOTALS, {
      ...BASE,
      portionMode: 'COUNT',
      portionCount: 5,
    });
    expect(plan.status).toBe('ok');
    if (plan.status !== 'ok') return;
    expect(plan.portion).toMatchObject({
      grams: 800,
      calories: 720,
      protein: 36,
      carbs: 60,
      fat: 24,
      fiber: 8,
    });
    expect(plan.fullPortions).toBe(5);
    expect(plan.leftover).toBeNull();
  });

  it('keeps nutrition per portion without a cooked weight', () => {
    const plan = planPortions(TOTALS, {
      ...BASE,
      cookedWeightG: null,
      portionMode: 'COUNT',
      portionCount: 4,
    });
    expect(plan.status === 'ok' && plan.portion).toMatchObject({
      grams: null,
      calories: 900,
      protein: 45,
    });
  });

  it('targets protein per portion and reports the leftover', () => {
    const plan = planPortions(TOTALS, {
      ...BASE,
      portionMode: 'TARGET',
      portionTarget: 'PROTEIN',
      portionTargetValue: 40,
      leftoverMode: 'UNALLOCATED',
    });
    expect(plan.status).toBe('ok');
    if (plan.status !== 'ok') return;
    expect(plan.fullPortions).toBe(4);
    expect(plan.portion).toMatchObject({
      protein: 40,
      grams: 888.9,
      calories: 800,
    });
    expect(plan.leftover).toMatchObject({
      protein: 20,
      grams: 444.4,
      calories: 400,
    });
  });

  it('redistributes the leftover evenly across the full portions', () => {
    const plan = planPortions(TOTALS, {
      ...BASE,
      portionMode: 'TARGET',
      portionTarget: 'PROTEIN',
      portionTargetValue: 40,
      leftoverMode: 'REDISTRIBUTE',
    });
    expect(plan.status === 'ok' && plan.portion).toMatchObject({
      protein: 45,
      grams: 1000,
      calories: 900,
    });
    expect(plan.status === 'ok' && plan.basePortion.protein).toBe(40);
  });

  it('targets grams and calories per portion', () => {
    const grams = planPortions(TOTALS, {
      ...BASE,
      portionMode: 'TARGET',
      portionTarget: 'GRAMS',
      portionTargetValue: 1500,
    });
    expect(grams.status === 'ok' && grams.fullPortions).toBe(2);
    expect(grams.status === 'ok' && grams.leftover?.grams).toBe(1000);
    const calories = planPortions(TOTALS, {
      ...BASE,
      portionMode: 'TARGET',
      portionTarget: 'CALORIES',
      portionTargetValue: 600,
    });
    expect(calories.status === 'ok' && calories.fullPortions).toBe(6);
    expect(calories.status === 'ok' && calories.leftover).toBeNull();
  });

  it('portions by the ingredient weight before cooking', () => {
    const plan = planPortions(TOTALS, {
      ...BASE,
      cookedWeightG: null,
      rawWeightG: 2400,
      portionMode: 'TARGET',
      portionTarget: 'GRAMS',
      portionTargetValue: 600,
    });
    expect(plan.status === 'ok' && plan.weightBasis).toBe('raw');
    expect(plan.status === 'ok' && plan.fullPortions).toBe(4);
    expect(plan.status === 'ok' && plan.portion.grams).toBe(600);
    const cooked = planPortions(TOTALS, {
      ...BASE,
      rawWeightG: 2400,
      portionMode: 'COUNT',
      portionCount: 4,
    });
    expect(cooked.status === 'ok' && cooked.weightBasis).toBe('cooked');
    expect(cooked.status === 'ok' && cooked.portion.grams).toBe(1000);
  });

  it('weighs ingredients only with valid conversion data', () => {
    const product = { servingSizeG: 30, servingSizeMl: 25 };
    expect(itemWeight({ grams: 200, product })).toBe(200);
    expect(itemWeight({ servings: 2, product })).toBe(60);
    expect(itemWeight({ milliliters: 50, product })).toBe(60);
    expect(itemWeight({ servings: 1, product: {} })).toBeNull();
    expect(itemWeight({ servings: 1, weightG: 45, product: {} })).toBe(45);
    expect(
      rawBatchWeight([
        { grams: 100, product },
        { servings: 1, product: {} },
      ]),
    ).toBeNull();
    expect(
      rawBatchWeight([
        { grams: 100, product },
        { servings: 2, product },
      ]),
    ).toBe(160);
  });

  it('explains what is missing', () => {
    expect(
      planPortions(TOTALS, {
        ...BASE,
        cookedWeightG: null,
        portionMode: 'TARGET',
        portionTarget: 'GRAMS',
        portionTargetValue: 300,
      }),
    ).toEqual({ status: 'incomplete', issue: 'weight' });
    expect(
      planPortions(
        { ...TOTALS, protein: 0 },
        {
          ...BASE,
          portionMode: 'TARGET',
          portionTarget: 'PROTEIN',
          portionTargetValue: 30,
        },
      ),
    ).toEqual({ status: 'incomplete', issue: 'protein' });
    expect(
      planPortions(TOTALS, {
        ...BASE,
        portionMode: 'TARGET',
        portionTarget: 'CALORIES',
        portionTargetValue: 5000,
      }),
    ).toEqual({ status: 'incomplete', issue: 'tooLarge' });
    expect(
      planPortions(TOTALS, { ...BASE, portionMode: 'COUNT', portionCount: 0 }),
    ).toEqual({ status: 'incomplete', issue: 'count' });
    expect(planPortions(TOTALS, BASE)).toEqual({ status: 'none' });
  });
});
