import { Injectable, NotFoundException } from '@nestjs/common';
import { RecipesRepository, RecipeRow } from './recipes.repository';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

function calcItemNutrition(
  product: {
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g: number | null;
  },
  grams: number,
): NutritionTotals {
  const f = grams / 100;
  return {
    calories: Math.round(product.caloriesPer100g * f),
    protein: round1(product.proteinPer100g * f),
    carbs: round1(product.carbsPer100g * f),
    fat: round1(product.fatPer100g * f),
    fiber: round1((product.fiberPer100g ?? 0) * f),
  };
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

function round1(v: number) {
  return Math.round(v * 10) / 10;
}

function enrichRecipe(recipe: NonNullable<RecipeRow>) {
  const enrichedItems = recipe.items.map((item) => ({
    ...item,
    nutrition: calcItemNutrition(item.product, item.grams),
  }));
  return {
    ...recipe,
    items: enrichedItems,
    totals: sumNutrition(enrichedItems.map((i) => i.nutrition)),
  };
}

@Injectable()
export class RecipesService {
  constructor(private readonly repo: RecipesRepository) {}

  async list(userId: string) {
    const recipes = await this.repo.findAllByUserId(userId);
    return recipes.map(enrichRecipe);
  }

  async getById(userId: string, id: string) {
    const recipe = await this.repo.findByIdAndUserId(id, userId);
    if (!recipe) throw new NotFoundException('Recipe not found');
    return enrichRecipe(recipe);
  }

  async create(userId: string, dto: CreateRecipeDto) {
    const recipe = await this.repo.create(userId, dto);
    return enrichRecipe(recipe);
  }

  async update(userId: string, id: string, dto: UpdateRecipeDto) {
    await this.getById(userId, id);
    if (dto.items !== undefined) {
      await this.repo.replaceItems(id, dto.items);
    }
    const updated = await this.repo.updateHeader(id, dto.name, dto.description);
    return enrichRecipe(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    await this.repo.delete(id);
  }
}
