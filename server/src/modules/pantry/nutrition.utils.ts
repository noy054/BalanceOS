import {
  NutritionTotals,
  ProductAmount,
  ProductNutritionSource,
  ZERO_TOTALS,
  productNutrition,
  round1,
  sumNutrition,
} from '../nutrition-calculator/product-nutrition';

export type { NutritionTotals };
export { round1, sumNutrition };

export function calcItemNutrition(
  product: ProductNutritionSource,
  amount: ProductAmount,
): NutritionTotals {
  return productNutrition(product, amount) ?? { ...ZERO_TOTALS };
}
