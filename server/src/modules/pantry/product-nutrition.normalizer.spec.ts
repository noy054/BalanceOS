import { BadRequestException } from '@nestjs/common';
import { NutritionBasis } from '../../../generated/prisma/enums';
import {
  EMPTY_NUTRITION,
  pickNutritionFields,
  resolveNutrition,
} from './product-nutrition.normalizer';

describe('resolveNutrition', () => {
  it('requires per-100g macros for per-100g products', () => {
    expect(() => resolveNutrition(null, { caloriesPer100g: 100 })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a per-serving product without grams and defaults the quantity', () => {
    const result = resolveNutrition(null, {
      nutritionBasis: NutritionBasis.PER_SERVING,
      caloriesPerServing: 72,
      proteinPerServing: 6.3,
      carbsPerServing: 0.4,
      fatPerServing: 4.8,
      servingUnit: '  large egg ',
    });
    expect(result.servingUnit).toBe('large egg');
    expect(result.servingQuantity).toBe(1);
    expect(result.servingSizeG).toBeNull();
    expect(result.caloriesPer100g).toBeNull();
  });

  it('clears per-serving values when switching back to per-100g', () => {
    const existing = pickNutritionFields({
      ...EMPTY_NUTRITION,
      nutritionBasis: NutritionBasis.PER_SERVING,
      caloriesPerServing: 72,
      proteinPerServing: 6,
      carbsPerServing: 1,
      fatPerServing: 5,
      servingQuantity: 1,
    });
    const result = resolveNutrition(existing, {
      nutritionBasis: NutritionBasis.PER_100G,
      caloriesPer100g: 143,
      proteinPer100g: 12.6,
      carbsPer100g: 0.7,
      fatPer100g: 9.5,
    });
    expect(result.caloriesPerServing).toBeNull();
    expect(result.servingQuantity).toBeNull();
  });

  it('keeps unknown fiber as null instead of zero', () => {
    const result = resolveNutrition(null, {
      caloriesPer100g: 100,
      proteinPer100g: 1,
      carbsPer100g: 2,
      fatPer100g: 3,
    });
    expect(result.fiberPer100g).toBeNull();
  });
});
