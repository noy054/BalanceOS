import {
  ProductNutritionSource,
  productNutrition,
  supportsGrams,
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
