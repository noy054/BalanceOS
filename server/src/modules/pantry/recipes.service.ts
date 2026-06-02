import { Injectable, NotFoundException } from '@nestjs/common';
import { RecipesRepository, RecipeRow } from './recipes.repository';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import {
  NutritionTotals,
  calcProductNutrition,
  sumNutrition,
} from './nutrition.utils';

export type { NutritionTotals };

function enrichRecipe(recipe: NonNullable<RecipeRow>) {
  const enrichedItems = recipe.items.map((item) => ({
    ...item,
    nutrition: calcProductNutrition(item.product, item.grams),
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
    const updated = await this.repo.updateWithItems(
      id,
      dto.name,
      dto.description,
      dto.mealType,
      dto.items,
    );
    return enrichRecipe(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    await this.repo.delete(id);
  }
}
