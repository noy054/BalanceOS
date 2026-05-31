import { Injectable, NotFoundException } from '@nestjs/common';
import { SavedMealsRepository, SavedMealRow } from './saved-meals.repository';
import { CreateSavedMealDto } from './dto/create-saved-meal.dto';
import { UpdateSavedMealDto } from './dto/update-saved-meal.dto';
import { NutritionTotals } from './recipes.service';

function round1(v: number) {
  return Math.round(v * 10) / 10;
}

function sumNutrition(items: NutritionTotals[]): NutritionTotals {
  return items.reduce(
    (acc, n) => ({
      calories: acc.calories + n.calories,
      protein: round1(acc.protein + n.protein),
      carbs: round1(acc.carbs + n.carbs),
      fat: round1(acc.fat + n.fat),
      fiber: round1(acc.fiber + n.fiber),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

function calcRecipeTotals(
  recipeItems: Array<{
    grams: number;
    product: {
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      fiberPer100g: number | null;
    };
  }>,
): NutritionTotals {
  return sumNutrition(
    recipeItems.map((ri) => {
      const f = ri.grams / 100;
      return {
        calories: Math.round(ri.product.caloriesPer100g * f),
        protein: round1(ri.product.proteinPer100g * f),
        carbs: round1(ri.product.carbsPer100g * f),
        fat: round1(ri.product.fatPer100g * f),
        fiber: round1((ri.product.fiberPer100g ?? 0) * f),
      };
    }),
  );
}

function enrichSavedMeal(meal: NonNullable<SavedMealRow>) {
  const enrichedItems = meal.items.map((item) => {
    let nutrition: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    if (item.product && item.grams) {
      const f = item.grams / 100;
      nutrition = {
        calories: Math.round(item.product.caloriesPer100g * f),
        protein: round1(item.product.proteinPer100g * f),
        carbs: round1(item.product.carbsPer100g * f),
        fat: round1(item.product.fatPer100g * f),
        fiber: round1((item.product.fiberPer100g ?? 0) * f),
      };
    } else if (item.recipe && item.servings) {
      const recipeTotals = calcRecipeTotals(item.recipe.items);
      const s = item.servings;
      nutrition = {
        calories: Math.round(recipeTotals.calories * s),
        protein: round1(recipeTotals.protein * s),
        carbs: round1(recipeTotals.carbs * s),
        fat: round1(recipeTotals.fat * s),
        fiber: round1(recipeTotals.fiber * s),
      };
    }

    return { ...item, nutrition };
  });

  return {
    ...meal,
    items: enrichedItems,
    totals: sumNutrition(enrichedItems.map((i) => i.nutrition)),
  };
}

@Injectable()
export class SavedMealsService {
  constructor(private readonly repo: SavedMealsRepository) {}

  async list(userId: string) {
    const meals = await this.repo.findAllByUserId(userId);
    return meals.map(enrichSavedMeal);
  }

  async getById(userId: string, id: string) {
    const meal = await this.repo.findByIdAndUserId(id, userId);
    if (!meal) throw new NotFoundException('Saved meal not found');
    return enrichSavedMeal(meal);
  }

  async create(userId: string, dto: CreateSavedMealDto) {
    const meal = await this.repo.create(userId, dto);
    return enrichSavedMeal(meal);
  }

  async update(userId: string, id: string, dto: UpdateSavedMealDto) {
    await this.getById(userId, id);
    if (dto.items !== undefined) {
      await this.repo.replaceItems(id, dto.items);
    }
    const updated = await this.repo.updateHeader(id, dto.name, dto.mealType);
    return enrichSavedMeal(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    await this.repo.delete(id);
  }
}
