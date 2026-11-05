import {
  ProductNutritionSource,
  productNutrition,
  supportsGrams,
  supportsMilliliters,
  supportsServings,
} from './product-nutrition';
import { NutritionCalculatorService } from './nutrition-calculator.service';

const per100: ProductNutritionSource = {
  nutritionBasis: 'PER_100G',
  caloriesPer100g: 250,
  proteinPer100g: 10,
  carbsPer100g: 40,
  fatPer100g: 5,
  fiberPer100g: null,
  servingSizeG: null,
};

const egg: ProductNutritionSource = {
  nutritionBasis: 'PER_SERVING',
  caloriesPer100g: null,
  proteinPer100g: null,
  carbsPer100g: null,
  fatPer100g: null,
  fiberPer100g: null,
  caloriesPerServing: 72,
  proteinPerServing: 6.3,
  carbsPerServing: 0.4,
  fatPerServing: 4.8,
  fiberPerServing: null,
  servingSizeG: null,
};

describe('productNutrition', () => {
  it('scales per-100g values by grams', () => {
    expect(productNutrition(per100, { grams: 60 })).toEqual({
      calories: 150,
      protein: 6,
      carbs: 24,
      fat: 3,
      fiber: 0,
    });
  });

  it('uses the serving weight when servings are logged for a per-100g product', () => {
    expect(
      productNutrition({ ...per100, servingSizeG: 30 }, { servings: 2 }),
    ).toEqual({ calories: 150, protein: 6, carbs: 24, fat: 3, fiber: 0 });
  });

  it('cannot convert servings without a serving weight', () => {
    expect(productNutrition(per100, { servings: 1 })).toBeNull();
    expect(supportsServings(per100)).toBe(false);
  });

  it('calculates per-serving products without any weight', () => {
    expect(productNutrition(egg, { servings: 2 })).toEqual({
      calories: 144,
      protein: 12.6,
      carbs: 0.8,
      fat: 9.6,
      fiber: 0,
    });
    expect(supportsServings(egg)).toBe(true);
  });

  it('never guesses grams for per-serving products without weight', () => {
    expect(productNutrition(egg, { grams: 50 })).toBeNull();
    expect(supportsGrams(egg)).toBe(false);
  });

  it('converts grams for per-serving products with a known weight', () => {
    expect(
      productNutrition({ ...egg, servingSizeG: 50 }, { grams: 100 }),
    ).toEqual({ calories: 144, protein: 12.6, carbs: 0.8, fat: 9.6, fiber: 0 });
  });
});

describe('NutritionCalculatorService.recipeSnapshot', () => {
  it('mixes gram and serving based ingredients', () => {
    const service = new NutritionCalculatorService();
    const snapshot = service.recipeSnapshot(
      {
        name: 'Toast',
        items: [
          { grams: 60, servings: null, product: per100 },
          { grams: null, servings: 1, product: egg },
        ],
      },
      0.5,
    );
    expect(snapshot).toEqual({
      name: 'Toast',
      calories: 111,
      protein: 6.2,
      carbs: 12.2,
      fat: 3.9,
      fiber: 0,
    });
  });

  it('returns null when an ingredient cannot be calculated', () => {
    const service = new NutritionCalculatorService();
    const snapshot = service.recipeSnapshot(
      {
        name: 'Toast',
        items: [
          { grams: 60, servings: null, product: per100 },
          { grams: null, servings: 1, product: per100 },
        ],
      },
      1,
    );
    expect(snapshot).toBeNull();
  });
});

describe('volume-based products', () => {
  const milk: ProductNutritionSource = {
    nutritionBasis: 'PER_100ML',
    caloriesPer100g: 60,
    proteinPer100g: 3.3,
    carbsPer100g: 4.8,
    fatPer100g: 3,
    fiberPer100g: 0,
    servingSizeMl: 250,
  };

  it('calculates milliliters and servings from per-100ml values', () => {
    expect(productNutrition(milk, { milliliters: 200 })).toMatchObject({
      calories: 120,
      protein: 6.6,
    });
    expect(productNutrition(milk, { servings: 1 })).toMatchObject({
      calories: 150,
    });
    expect(supportsMilliliters(milk)).toBe(true);
    expect(supportsServings(milk)).toBe(true);
  });

  it('never assumes one milliliter weighs one gram', () => {
    expect(productNutrition(milk, { grams: 100 })).toBeNull();
    expect(supportsGrams(milk)).toBe(false);
  });

  it('converts between grams and milliliters only with product data', () => {
    expect(
      productNutrition({ ...milk, servingSizeG: 258 }, { grams: 258 }),
    ).toMatchObject({ calories: 150 });
    const oil: ProductNutritionSource = {
      nutritionBasis: 'PER_100G',
      caloriesPer100g: 900,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 100,
      fiberPer100g: 0,
      servingSizeG: 13.6,
      servingSizeMl: 15,
    };
    expect(productNutrition(oil, { milliliters: 15 })).toMatchObject({
      calories: 122,
    });
    expect(supportsMilliliters({ ...oil, servingSizeMl: null })).toBe(false);
  });

  it('accepts the other unit through serving values when per-100 values cannot convert', () => {
    const servingValues = {
      caloriesPerServing: 150,
      proteinPerServing: 8,
      carbsPerServing: 12,
      fatPerServing: 7.5,
      fiberPerServing: 0,
    };
    const drink: ProductNutritionSource = {
      ...milk,
      ...servingValues,
      servingSizeMl: null,
      servingSizeG: 250,
    };
    expect(supportsGrams(drink)).toBe(true);
    expect(productNutrition(drink, { grams: 125 })).toMatchObject({
      calories: 75,
    });
    const bar: ProductNutritionSource = {
      ...per100,
      ...servingValues,
      servingSizeG: null,
      servingSizeMl: 40,
    };
    expect(supportsMilliliters(bar)).toBe(true);
    expect(productNutrition(bar, { milliliters: 20 })).toMatchObject({
      calories: 75,
    });
  });

  it('scales per-serving products by serving volume', () => {
    const shake: ProductNutritionSource = {
      nutritionBasis: 'PER_SERVING',
      caloriesPer100g: null,
      proteinPer100g: null,
      carbsPer100g: null,
      fatPer100g: null,
      fiberPer100g: null,
      caloriesPerServing: 200,
      proteinPerServing: 30,
      carbsPerServing: 10,
      fatPerServing: 4,
      fiberPerServing: 1,
      servingSizeMl: 330,
    };
    expect(productNutrition(shake, { milliliters: 165 })).toMatchObject({
      calories: 100,
      protein: 15,
    });
  });
});
