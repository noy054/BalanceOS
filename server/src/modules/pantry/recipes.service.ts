import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RecipeHeader,
  RecipesRepository,
  RecipeRow,
} from './recipes.repository';
import { CreateRecipeDto, RecipeItemDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import {
  NutritionTotals,
  calcItemNutrition,
  sumNutrition,
} from './nutrition.utils';
import { PantryItemValidator } from './pantry-item.validator';
import { TemplateLogSyncService } from '../day-logs/template-log-sync.service';
import {
  itemWeight,
  netCookedWeight,
  planPortions,
  rawBatchWeight,
} from '../nutrition-calculator/recipe-portions';
import { rawRecipeTotals } from '../nutrition-calculator/nutrition-calculator.service';
import { RecipePortionsDto } from './dto/recipe-portions.dto';

export type { NutritionTotals };

function recipeYield(dto: RecipePortionsDto): RecipeHeader {
  const touchesWeight =
    dto.emptyPotWeightG !== undefined ||
    dto.potWithFoodWeightG !== undefined ||
    dto.cookedWeightG !== undefined;
  const weights: RecipeHeader = {};
  if (touchesWeight) {
    const net = netCookedWeight(dto);
    if (net === 'invalid') {
      throw new BadRequestException(
        'The pot with food must weigh more than the empty pot',
      );
    }
    weights.emptyPotWeightG = dto.emptyPotWeightG ?? null;
    weights.potWithFoodWeightG = dto.potWithFoodWeightG ?? null;
    weights.cookedWeightG = net;
  }
  return {
    ...weights,
    portionMode: dto.portionMode,
    portionCount: dto.portionCount,
    portionTarget: dto.portionTarget,
    portionTargetValue: dto.portionTargetValue,
    leftoverMode: dto.leftoverMode,
  };
}

function recipeHeader(dto: UpdateRecipeDto): RecipeHeader {
  const mealTypes =
    dto.mealTypes ??
    (dto.mealType !== undefined
      ? dto.mealType
        ? [dto.mealType]
        : []
      : undefined);
  return {
    ...recipeYield(dto),
    name: dto.name,
    description: dto.description,
    imageUrl:
      dto.imageUrl === undefined ? undefined : dto.imageUrl?.trim() || null,
    steps:
      dto.steps === undefined
        ? undefined
        : dto.steps.map((step) => step.trim()).filter(Boolean),
    ...(mealTypes !== undefined
      ? { mealTypes, mealType: mealTypes[0] ?? null }
      : {}),
  };
}

function enrichRecipe(recipe: NonNullable<RecipeRow>) {
  const enrichedItems = recipe.items.map((item) => ({
    ...item,
    nutrition: calcItemNutrition(item.product, item),
  }));
  const totals = sumNutrition(enrichedItems.map((i) => i.nutrition));
  const rawWeightG = rawBatchWeight(recipe.items);
  return {
    ...recipe,
    items: enrichedItems.map((item) => ({
      ...item,
      resolvedWeightG: itemWeight(item),
    })),
    totals,
    rawWeightG,
    portionPlan: planPortions(rawRecipeTotals(recipe.items), {
      cookedWeightG: recipe.cookedWeightG,
      rawWeightG,
      portionMode: recipe.portionMode,
      portionCount: recipe.portionCount,
      portionTarget: recipe.portionTarget,
      portionTargetValue: recipe.portionTargetValue,
      leftoverMode: recipe.leftoverMode,
    }),
  };
}

@Injectable()
export class RecipesService {
  constructor(
    private readonly repo: RecipesRepository,
    private readonly validator: PantryItemValidator,
    private readonly logSync: TemplateLogSyncService,
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
    await this.validator.validateImage(userId, dto.imageUrl);
    const recipe = await this.repo.create(userId, recipeHeader(dto), dto.items);
    return enrichRecipe(recipe);
  }

  async update(userId: string, id: string, dto: UpdateRecipeDto) {
    await this.getById(userId, id);
    if (dto.items) await this.validateItems(userId, dto.items);
    await this.validator.validateImage(userId, dto.imageUrl);
    const fromDate = this.logSync.resolveFromDate(dto.logsFrom);
    const updated = await this.logSync.updateRecipe(
      userId,
      id,
      fromDate,
      (db) => this.repo.updateWithItems(id, recipeHeader(dto), dto.items, db),
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
        milliliters: item.milliliters,
      })),
    );
  }
}
