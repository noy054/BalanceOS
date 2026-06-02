import { Injectable } from '@nestjs/common';

export type MacrosSnapshot = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

type ProductLike = {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
};

function r1(v: number): number {
  return Math.round(v * 10) / 10;
}

@Injectable()
export class NutritionCalculatorService {
  productSnapshot(
    product: ProductLike & { name: string },
    grams: number,
  ): MacrosSnapshot {
    const f = grams / 100;
    return {
      name: product.name,
      calories: Math.round(product.caloriesPer100g * f),
      protein: r1(product.proteinPer100g * f),
      carbs: r1(product.carbsPer100g * f),
      fat: r1(product.fatPer100g * f),
      fiber: r1((product.fiberPer100g ?? 0) * f),
    };
  }

  recipeSnapshot(
    recipe: {
      name: string;
      items: Array<{ grams: number; product: ProductLike }>;
    },
    servings: number,
  ): MacrosSnapshot {
    const sum = recipe.items.reduce(
      (acc, item) => {
        const f = item.grams / 100;
        return {
          calories: acc.calories + item.product.caloriesPer100g * f,
          protein: acc.protein + item.product.proteinPer100g * f,
          carbs: acc.carbs + item.product.carbsPer100g * f,
          fat: acc.fat + item.product.fatPer100g * f,
          fiber: acc.fiber + (item.product.fiberPer100g ?? 0) * f,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );
    return {
      name: recipe.name,
      calories: Math.round(sum.calories * servings),
      protein: r1(sum.protein * servings),
      carbs: r1(sum.carbs * servings),
      fat: r1(sum.fat * servings),
      fiber: r1(sum.fiber * servings),
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
        protein: r1(acc.protein + s.protein),
        carbs: r1(acc.carbs + s.carbs),
        fat: r1(acc.fat + s.fat),
        fiber: r1(acc.fiber + s.fiber),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );
  }
}
