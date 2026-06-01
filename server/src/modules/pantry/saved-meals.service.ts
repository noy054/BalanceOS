import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SavedMealsRepository, SavedMealRow } from './saved-meals.repository';
import { CreateSavedMealDto } from './dto/create-saved-meal.dto';
import { UpdateSavedMealDto } from './dto/update-saved-meal.dto';
import {
  NutritionTotals,
  calcProductNutrition,
  sumNutrition,
} from './nutrition.utils';

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
  return sumNutrition(recipeItems.map((ri) => calcProductNutrition(ri.product, ri.grams)));
}

function enrichSavedMeal(meal: NonNullable<SavedMealRow>) {
  const enrichedItems = meal.items.map((item) => {
    let nutrition: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    if (item.product && item.grams) {
      nutrition = calcProductNutrition(item.product, item.grams);
    } else if (item.recipe && item.servings) {
      const recipeTotals = calcRecipeTotals(item.recipe.items);
      const s = item.servings;
      nutrition = {
        calories: Math.round(recipeTotals.calories * s),
        protein: Math.round(recipeTotals.protein * s * 10) / 10,
        carbs: Math.round(recipeTotals.carbs * s * 10) / 10,
        fat: Math.round(recipeTotals.fat * s * 10) / 10,
        fiber: Math.round(recipeTotals.fiber * s * 10) / 10,
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
    for (const item of dto.items) {
      const hasProduct = !!item.productId;
      const hasRecipe = !!item.recipeId;
      if (hasProduct === hasRecipe) {
        throw new BadRequestException(
          'Each item must have exactly one of productId or recipeId',
        );
      }
      if (hasProduct && !item.grams) {
        throw new BadRequestException(
          'Product items require grams',
        );
      }
      if (hasRecipe && !item.servings) {
        throw new BadRequestException(
          'Recipe items require servings',
        );
      }
    }
    const meal = await this.repo.create(userId, dto);
    return enrichSavedMeal(meal);
  }

  async update(userId: string, id: string, dto: UpdateSavedMealDto) {
    await this.getById(userId, id);
    const updated = await this.repo.updateWithItems(
      id,
      dto.name,
      dto.mealType,
      dto.items,
    );
    return enrichSavedMeal(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    await this.repo.delete(id);
  }
}
