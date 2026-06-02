import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DayLogsRepository } from './day-logs.repository';
import {
  NutritionCalculatorService,
  MacrosSnapshot,
} from '../nutrition-calculator/nutrition-calculator.service';
import { AddMealItemDto } from './dto/add-meal-item.dto';

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

@Injectable()
export class DayLogsService {
  constructor(
    private readonly repo: DayLogsRepository,
    private readonly calculator: NutritionCalculatorService,
  ) {}

  async getOrCreateToday(userId: string) {
    const date = todayDate();
    const existing = await this.repo.findToday(userId, date);
    if (existing) return existing;
    const targets = await this.repo.findUserTargets(userId);
    return this.repo.findOrCreateToday(userId, date, targets);
  }

  async addMealItem(userId: string, dto: AddMealItemDto) {
    const sourceCount = [dto.pantryProductId, dto.pantryRecipeId, dto.savedMealId].filter(
      Boolean,
    ).length;
    if (sourceCount !== 1) {
      throw new BadRequestException(
        'Exactly one of pantryProductId, pantryRecipeId, or savedMealId is required',
      );
    }

    let snapshot: MacrosSnapshot;

    if (dto.pantryProductId) {
      if (!dto.grams) throw new BadRequestException('grams is required for products');
      const product = await this.repo.findPantryProductForUser(dto.pantryProductId, userId);
      if (!product) throw new NotFoundException('Product not found');
      snapshot = this.calculator.productSnapshot(product, dto.grams);
    } else if (dto.pantryRecipeId) {
      if (!dto.servings) throw new BadRequestException('servings is required for recipes');
      const recipe = await this.repo.findPantryRecipeForUser(dto.pantryRecipeId, userId);
      if (!recipe) throw new NotFoundException('Recipe not found');
      snapshot = this.calculator.recipeSnapshot(recipe, dto.servings);
    } else {
      const meal = await this.repo.findSavedMealForUser(dto.savedMealId!, userId);
      if (!meal) throw new NotFoundException('Saved meal not found');
      const itemTotals = meal.items.map((item) => {
        if (item.product && item.grams) {
          return this.calculator.productSnapshot({ ...item.product, name: '' }, item.grams);
        }
        if (item.recipe && item.servings) {
          return this.calculator.recipeSnapshot({ name: '', items: item.recipe.items }, item.servings);
        }
        return { name: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      });
      const totals = this.calculator.sumTotals(itemTotals);
      snapshot = this.calculator.savedMealSnapshot(meal, totals);
    }

    const dayLog = await this.getOrCreateToday(userId);
    const mealEntry = await this.repo.findOrCreateMealEntry(dayLog.id, dto.mealType);

    const item = await this.repo.createMealItem(mealEntry.id, {
      pantryProductId: dto.pantryProductId,
      pantryRecipeId: dto.pantryRecipeId,
      savedMealId: dto.savedMealId,
      grams: dto.grams,
      servings: dto.servings,
      macrosSnapshot: snapshot,
    });

    await this.repo.recalculateAndSaveTotals(dayLog.id);

    return { id: item.id };
  }

  async removeMealItem(userId: string, itemId: string): Promise<void> {
    const item = await this.repo.findMealItemWithOwnership(itemId);
    if (!item || item.mealEntry.dayLog.userId !== userId) {
      throw new NotFoundException('Meal item not found');
    }
    const dayLogId = item.mealEntry.dayLog.id;
    await this.repo.deleteMealItem(itemId);
    await this.repo.recalculateAndSaveTotals(dayLogId);
  }
}
