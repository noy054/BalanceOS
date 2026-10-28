import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SavedMealsRepository, SavedMealRow } from './saved-meals.repository';
import {
  CreateSavedMealDto,
  SavedMealItemDto,
} from './dto/create-saved-meal.dto';
import { UpdateSavedMealDto } from './dto/update-saved-meal.dto';
import {
  NutritionTotals,
  calcItemNutrition,
  sumNutrition,
} from './nutrition.utils';
import { scaledRecipeTotals } from '../nutrition-calculator/nutrition-calculator.service';
import { ZERO_TOTALS } from '../nutrition-calculator/product-nutrition';
import { PantryItemValidator } from './pantry-item.validator';

function enrichSavedMeal(meal: NonNullable<SavedMealRow>) {
  const enrichedItems = meal.items.map((item) => {
    let nutrition: NutritionTotals = { ...ZERO_TOTALS };

    if (item.product && (item.grams || item.servings)) {
      nutrition = calcItemNutrition(item.product, item);
    } else if (item.recipe && item.servings) {
      nutrition = scaledRecipeTotals(item.recipe.items, item.servings);
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
  constructor(
    private readonly repo: SavedMealsRepository,
    private readonly validator: PantryItemValidator,
  ) {}

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
    await this.validateItems(userId, dto.items);
    const meal = await this.repo.create(userId, dto);
    return enrichSavedMeal(meal);
  }

  async update(userId: string, id: string, dto: UpdateSavedMealDto) {
    await this.getById(userId, id);
    if (dto.items) await this.validateItems(userId, dto.items);
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

  private async validateItems(userId: string, items: SavedMealItemDto[]) {
    for (const item of items) {
      const hasProduct = !!item.productId;
      const hasRecipe = !!item.recipeId;
      if (hasProduct === hasRecipe) {
        throw new BadRequestException(
          'Each item must have exactly one of productId or recipeId',
        );
      }
      if (hasRecipe && !item.servings) {
        throw new BadRequestException('Recipe items require servings');
      }
    }
    await this.validator.validateProductAmounts(
      userId,
      items
        .filter((item) => item.productId)
        .map((item) => ({
          productId: item.productId!,
          grams: item.grams,
          servings: item.servings,
        })),
    );
    await this.validator.validateRecipeOwnership(
      userId,
      items.filter((item) => item.recipeId).map((item) => item.recipeId!),
    );
  }
}
