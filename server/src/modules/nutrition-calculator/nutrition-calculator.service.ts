import { Injectable } from '@nestjs/common';
import {
  MacroValues,
  ProductAmount,
  ProductNutritionSource,
  rawProductNutrition,
  round1,
  roundTotals,
} from './product-nutrition';

export type MacrosSnapshot = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

type RecipeItemLike = ProductAmount & { product: ProductNutritionSource };

export function rawRecipeTotals(items: RecipeItemLike[]): MacroValues {
  return items.reduce<MacroValues>(
    (acc, item) => {
      const values = rawProductNutrition(item.product, item);
      if (!values) return acc;
      return {
        calories: acc.calories + values.calories,
        protein: acc.protein + values.protein,
        carbs: acc.carbs + values.carbs,
        fat: acc.fat + values.fat,
        fiber: acc.fiber + values.fiber,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

export function scaledRecipeTotals(
  items: RecipeItemLike[],
  servings: number,
): Omit<MacrosSnapshot, 'name'> {
  const sum = rawRecipeTotals(items);
  return {
    calories: Math.round(sum.calories * servings),
    protein: round1(sum.protein * servings),
    carbs: round1(sum.carbs * servings),
    fat: round1(sum.fat * servings),
    fiber: round1(sum.fiber * servings),
  };
}

@Injectable()
export class NutritionCalculatorService {
  productSnapshot(
    product: ProductNutritionSource & { name: string },
    amount: ProductAmount,
  ): MacrosSnapshot | null {
    const values = rawProductNutrition(product, amount);
    if (!values) return null;
    return { name: product.name, ...roundTotals(values) };
  }

  recipeSnapshot(
    recipe: { name: string; items: RecipeItemLike[] },
    servings: number,
  ): MacrosSnapshot {
    return {
      name: recipe.name,
      ...scaledRecipeTotals(recipe.items, servings),
    };
  }

  savedMealSnapshot(
    meal: { name: string },
    totals: Omit<MacrosSnapshot, 'name'>,
  ): MacrosSnapshot {
    return { name: meal.name, ...totals };
  }

  sumTotals(
    items: Array<Omit<MacrosSnapshot, 'name'>>,
  ): Omit<MacrosSnapshot, 'name'> {
    return items.reduce(
      (acc, s) => ({
        calories: acc.calories + s.calories,
        protein: round1(acc.protein + s.protein),
        carbs: round1(acc.carbs + s.carbs),
        fat: round1(acc.fat + s.fat),
        fiber: round1(acc.fiber + s.fiber),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );
  }
}
