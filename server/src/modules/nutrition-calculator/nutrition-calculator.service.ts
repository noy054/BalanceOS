import { Injectable } from '@nestjs/common';
import {
  planPortions,
  PortionSetup,
  rawBatchWeight,
  WeighableItem,
} from './recipe-portions';
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

export type BaseMacros = Omit<MacrosSnapshot, 'name'> & { amount: number };

export function baseMacrosOf(
  snapshot: MacrosSnapshot,
  amount: number | null | undefined,
): BaseMacros | null {
  if (amount == null || !(amount > 0)) return null;
  return {
    amount,
    calories: snapshot.calories,
    protein: snapshot.protein,
    carbs: snapshot.carbs ?? 0,
    fat: snapshot.fat ?? 0,
    fiber: snapshot.fiber ?? 0,
  };
}

export function isBaseMacros(value: unknown): value is BaseMacros {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  const valid = [
    'amount',
    'calories',
    'protein',
    'carbs',
    'fat',
    'fiber',
  ].every(
    (key) => typeof record[key] === 'number' && Number.isFinite(record[key]),
  );
  return valid && (record.amount as number) > 0;
}

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

export function isRecipeCalculable(items: RecipeItemLike[]): boolean {
  return items.every(
    (item) => rawProductNutrition(item.product, item) !== null,
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
  ): MacrosSnapshot | null {
    if (!isRecipeCalculable(recipe.items)) return null;
    return {
      name: recipe.name,
      ...scaledRecipeTotals(recipe.items, servings),
    };
  }

  recipeWeight(recipe: {
    cookedWeightG?: number | null;
    items: WeighableItem[];
  }): number | null {
    return recipe.cookedWeightG ?? rawBatchWeight(recipe.items);
  }

  recipeFraction(
    recipe: {
      items: (RecipeItemLike & WeighableItem)[];
    } & Partial<PortionSetup>,
    amount: { servings?: number; portions?: number; grams?: number },
  ): number | 'noPortions' | 'noCookedWeight' {
    if (amount.portions != null) {
      const plan = planPortions(rawRecipeTotals(recipe.items), {
        cookedWeightG: recipe.cookedWeightG ?? null,
        rawWeightG: rawBatchWeight(recipe.items),
        portionMode: recipe.portionMode ?? null,
        portionCount: recipe.portionCount ?? null,
        portionTarget: recipe.portionTarget ?? null,
        portionTargetValue: recipe.portionTargetValue ?? null,
        leftoverMode: recipe.leftoverMode ?? null,
      });
      if (plan.status !== 'ok') return 'noPortions';
      return plan.portion.fraction * amount.portions;
    }
    if (amount.grams != null) {
      const weight = this.recipeWeight(recipe);
      if (!weight) return 'noCookedWeight';
      return amount.grams / weight;
    }
    return amount.servings ?? 0;
  }

  scaleSnapshot(snapshot: MacrosSnapshot, ratio: number): MacrosSnapshot {
    return {
      name: snapshot.name,
      ...roundTotals({
        calories: snapshot.calories * ratio,
        protein: snapshot.protein * ratio,
        carbs: (snapshot.carbs ?? 0) * ratio,
        fat: (snapshot.fat ?? 0) * ratio,
        fiber: (snapshot.fiber ?? 0) * ratio,
      }),
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
