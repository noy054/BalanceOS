import { BadRequestException } from '@nestjs/common';
import { NutritionBasis } from '../../../generated/prisma/enums';
import { hasCompleteNutrition } from '../nutrition-calculator/product-nutrition';

export type ProductNutritionFields = {
  nutritionBasis: NutritionBasis;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  caloriesPerServing: number | null;
  proteinPerServing: number | null;
  carbsPerServing: number | null;
  fatPerServing: number | null;
  fiberPerServing: number | null;
  servingSizeG: number | null;
  servingSizeText: string | null;
  servingQuantity: number | null;
  servingUnit: string | null;
};

export type ProductNutritionPatch = {
  [K in keyof ProductNutritionFields]?: ProductNutritionFields[K] | undefined;
};

const PER_100G_KEYS = [
  'caloriesPer100g',
  'proteinPer100g',
  'carbsPer100g',
  'fatPer100g',
  'fiberPer100g',
] as const;

const PER_SERVING_KEYS = [
  'caloriesPerServing',
  'proteinPerServing',
  'carbsPerServing',
  'fatPerServing',
  'fiberPerServing',
] as const;

export const NUTRITION_FIELD_KEYS: Array<keyof ProductNutritionFields> = [
  'nutritionBasis',
  ...PER_100G_KEYS,
  ...PER_SERVING_KEYS,
  'servingSizeG',
  'servingSizeText',
  'servingQuantity',
  'servingUnit',
];

export const EMPTY_NUTRITION: ProductNutritionFields = {
  nutritionBasis: NutritionBasis.PER_100G,
  caloriesPer100g: null,
  proteinPer100g: null,
  carbsPer100g: null,
  fatPer100g: null,
  fiberPer100g: null,
  caloriesPerServing: null,
  proteinPerServing: null,
  carbsPerServing: null,
  fatPerServing: null,
  fiberPerServing: null,
  servingSizeG: null,
  servingSizeText: null,
  servingQuantity: null,
  servingUnit: null,
};

export function pickNutritionFields(
  source: Partial<Record<keyof ProductNutritionFields, unknown>>,
): ProductNutritionFields {
  const result = { ...EMPTY_NUTRITION } as Record<string, unknown>;
  for (const key of NUTRITION_FIELD_KEYS) {
    const value = source[key];
    if (value !== undefined) result[key] = value;
  }
  return result as ProductNutritionFields;
}

export function resolveNutrition(
  existing: ProductNutritionFields | null,
  patch: ProductNutritionPatch,
): ProductNutritionFields {
  const merged = { ...(existing ?? EMPTY_NUTRITION) } as Record<
    string,
    unknown
  >;
  for (const key of NUTRITION_FIELD_KEYS) {
    const value = patch[key];
    if (value !== undefined) merged[key] = value;
  }
  const next = merged as ProductNutritionFields;

  const basis = next.nutritionBasis ?? NutritionBasis.PER_100G;
  const unit = next.servingUnit?.trim() || null;
  const grams =
    next.servingSizeG != null && next.servingSizeG > 0
      ? next.servingSizeG
      : null;
  const needsQuantity = Boolean(unit) || basis === NutritionBasis.PER_SERVING;
  const quantity = needsQuantity
    ? next.servingQuantity != null && next.servingQuantity > 0
      ? next.servingQuantity
      : 1
    : null;

  const resolved: ProductNutritionFields = {
    ...next,
    nutritionBasis: basis,
    servingUnit: unit,
    servingSizeG: grams,
    servingQuantity: quantity,
    servingSizeText: next.servingSizeText?.trim() || null,
  };

  const clearKeys =
    basis === NutritionBasis.PER_SERVING ? PER_100G_KEYS : PER_SERVING_KEYS;
  for (const key of clearKeys) resolved[key] = null;

  if (!hasCompleteNutrition(resolved)) {
    throw new BadRequestException(
      basis === NutritionBasis.PER_SERVING
        ? 'Calories, protein, carbs and fat per serving are required'
        : 'Calories, protein, carbs and fat per 100g are required',
    );
  }

  return resolved;
}
