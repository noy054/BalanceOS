import { Injectable, NotFoundException } from '@nestjs/common';
import { RecipesRepository, RecipeRow } from './recipes.repository';
import { CreateRecipeDto, RecipeItemDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import {
  NutritionTotals,
  calcItemNutrition,
  sumNutrition,
} from './nutrition.utils';
import { PantryItemValidator } from './pantry-item.validator';

export type { NutritionTotals };

function enrichRecipe(recipe: NonNullable<RecipeRow>) {
  const enrichedItems = recipe.items.map((item) => ({
    ...item,
    nutrition: calcItemNutrition(item.product, item),
  }));
  return {
    ...recipe,
    items: enrichedItems,
    totals: sumNutrition(enrichedItems.map((i) => i.nutrition)),
  };
}

@Injectable()
export class RecipesService {
  constructor(
    private readonly repo: RecipesRepository,
    private readonly validator: PantryItemValidator,
  ) {}

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
    await this.validateItems(userId, dto.items);
    const recipe = await this.repo.create(userId, dto);
    return enrichRecipe(recipe);
  }

  async update(userId: string, id: string, dto: UpdateRecipeDto) {
    await this.getById(userId, id);
    if (dto.items) await this.validateItems(userId, dto.items);
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

  private validateItems(userId: string, items: RecipeItemDto[]) {
    return this.validator.validateProductAmounts(
      userId,
      items.map((item) => ({
        productId: item.productId,
        grams: item.grams,
        servings: item.servings,
      })),
    );
  }
}
