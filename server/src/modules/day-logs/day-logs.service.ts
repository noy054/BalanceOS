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
import { CopyMealDto } from './dto/copy-meal.dto';
import { UpdateMealItemDto } from './dto/update-meal-item.dto';
import {
  daysBetween,
  isWithinFutureLimit,
  utcDayKey,
} from '../../common/date/day-key';

const MAX_CALENDAR_DAYS = 61;

type CopyableMealItem = {
  pantryProductId: string | null;
  pantryRecipeId: string | null;
  savedMealId: string | null;
  grams: number | null;
  servings: number | null;
  macrosSnapshot: unknown;
};

function todayDate(): string {
  return utcDayKey();
}

function assertWritableDate(date: string): void {
  if (!isWithinFutureLimit(date))
    throw new BadRequestException('Date is too far in the future');
}

@Injectable()
export class DayLogsService {
  constructor(
    private readonly repo: DayLogsRepository,
    private readonly calculator: NutritionCalculatorService,
  ) {}

  async getOrCreateToday(userId: string) {
    return this.getOrCreateDay(userId, todayDate());
  }

  private async getOrCreateDay(userId: string, date: string) {
    const existing = await this.repo.findToday(userId, date);
    if (existing) return existing;
    const targets = await this.repo.findUserTargets(userId);
    return this.repo.findOrCreateToday(userId, date, targets);
  }

  async getDay(userId: string, date: string) {
    const existing = await this.repo.findToday(userId, date);
    if (existing) return existing;
    const targets = await this.repo.findUserTargets(userId);
    return {
      id: null,
      date,
      targetsSnapshot: targets,
      caloriesTotal: 0,
      proteinTotal: 0,
      carbsTotal: 0,
      fatTotal: 0,
      fiberTotal: 0,
    };
  }

  async getCalendar(userId: string, from: string, to: string) {
    const span = daysBetween(from, to);
    if (span < 0 || span > MAX_CALENDAR_DAYS) {
      throw new BadRequestException(
        `The range must cover 1 to ${MAX_CALENDAR_DAYS + 1} days`,
      );
    }
    const rows = await this.repo.findDaysInRange(userId, from, to);
    const days = rows
      .map((row) => ({
        date: row.date,
        calories: Math.round(row.caloriesTotal),
        itemCount: row.mealEntries.reduce(
          (sum, entry) => sum + entry._count.items,
          0,
        ),
      }))
      .filter((day) => day.itemCount > 0);
    return { days };
  }

  addMealItem(userId: string, dto: AddMealItemDto) {
    return this.addMealItemOnDate(userId, todayDate(), dto);
  }

  async addMealItemOnDate(userId: string, date: string, dto: AddMealItemDto) {
    assertWritableDate(date);
    const sourceCount = [
      dto.pantryProductId,
      dto.pantryRecipeId,
      dto.savedMealId,
    ].filter(Boolean).length;
    if (sourceCount !== 1) {
      throw new BadRequestException(
        'Exactly one of pantryProductId, pantryRecipeId, or savedMealId is required',
      );
    }

    let snapshot: MacrosSnapshot;

    if (dto.pantryProductId) {
      if (Boolean(dto.grams) === Boolean(dto.servings))
        throw new BadRequestException(
          'Products require either grams or servings',
        );
      const product = await this.repo.findPantryProductForUser(
        dto.pantryProductId,
        userId,
      );
      if (!product) throw new NotFoundException('Product not found');
      const productSnapshot = this.calculator.productSnapshot(product, {
        grams: dto.grams,
        servings: dto.servings,
      });
      if (!productSnapshot)
        throw new BadRequestException(
          'This amount cannot be calculated for this product',
        );
      snapshot = productSnapshot;
    } else if (dto.pantryRecipeId) {
      if (!dto.servings)
        throw new BadRequestException('servings is required for recipes');
      const recipe = await this.repo.findPantryRecipeForUser(
        dto.pantryRecipeId,
        userId,
      );
      if (!recipe) throw new NotFoundException('Recipe not found');
      const recipeSnapshot = this.calculator.recipeSnapshot(
        recipe,
        dto.servings,
      );
      if (!recipeSnapshot)
        throw new BadRequestException(
          'This recipe contains ingredients that cannot be calculated',
        );
      snapshot = recipeSnapshot;
    } else {
      const meal = await this.repo.findSavedMealForUser(
        dto.savedMealId!,
        userId,
      );
      if (!meal) throw new NotFoundException('Saved meal not found');
      const itemTotals = meal.items.map((item) => {
        const itemSnapshot =
          item.product && (item.grams || item.servings)
            ? this.calculator.productSnapshot(
                { ...item.product, name: '' },
                item,
              )
            : item.recipe && item.servings
              ? this.calculator.recipeSnapshot(
                  { name: '', items: item.recipe.items },
                  item.servings,
                )
              : null;
        if (!itemSnapshot)
          throw new BadRequestException(
            'This saved meal contains items that cannot be calculated',
          );
        return itemSnapshot;
      });
      const totals = this.calculator.sumTotals(itemTotals);
      snapshot = this.calculator.savedMealSnapshot(meal, totals);
    }

    const dayLog = await this.getOrCreateDay(userId, date);
    const mealEntry = await this.repo.findOrCreateMealEntry(
      dayLog.id,
      dto.mealType,
    );

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

  getTodayMeals(userId: string) {
    return this.getDayMeals(userId, todayDate());
  }

  async getDayMeals(userId: string, date: string) {
    const dayLog = await this.repo.findTodayMeals(userId, date);

    if (!dayLog) return { meals: [] };

    const MEAL_ORDER: Record<string, number> = {
      BREAKFAST: 0,
      LUNCH: 1,
      DINNER: 2,
      SNACK_1: 3,
      SNACK_2: 4,
    };

    const meals = dayLog.mealEntries
      .filter((entry) => entry.items.length > 0)
      .sort(
        (a, b) =>
          (MEAL_ORDER[a.mealType] ?? 99) - (MEAL_ORDER[b.mealType] ?? 99),
      )
      .map((entry) => {
        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;
        let fiber = 0;
        const items = entry.items.map((item) => {
          const s = item.macrosSnapshot as MacrosSnapshot;
          calories += s.calories;
          protein += s.protein;
          carbs += s.carbs ?? 0;
          fat += s.fat ?? 0;
          fiber += s.fiber ?? 0;
          return {
            id: item.id,
            name: s.name,
            source: item.pantryProductId
              ? ('PRODUCT' as const)
              : item.pantryRecipeId
                ? ('RECIPE' as const)
                : item.savedMealId
                  ? ('SAVED_MEAL' as const)
                  : null,
            grams: item.grams,
            servings: item.servings,
            serving: item.pantryProduct,
            calories: s.calories,
            protein: s.protein,
            carbs: s.carbs ?? 0,
            fat: s.fat ?? 0,
            fiber: s.fiber ?? 0,
          };
        });
        return {
          id: entry.id,
          mealType: entry.mealType,
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          fiber: Math.round(fiber * 10) / 10,
          items,
        };
      });

    return { meals };
  }

  async copyMealEntry(
    userId: string,
    mealEntryId: string,
    dto: CopyMealDto,
  ): Promise<void> {
    dto.targetDates.forEach(assertWritableDate);
    const entry = await this.repo.findMealEntryWithItems(mealEntryId);
    if (!entry || entry.dayLog.userId !== userId) {
      throw new NotFoundException('Meal entry not found');
    }
    if (entry.items.length === 0) {
      throw new BadRequestException('Meal has no items to copy');
    }

    await this.copyItemsToDates(
      userId,
      entry.mealType,
      entry.items,
      dto.targetDates,
    );
  }

  async copyMealItem(
    userId: string,
    itemId: string,
    dto: CopyMealDto,
  ): Promise<void> {
    dto.targetDates.forEach(assertWritableDate);
    const item = await this.repo.findMealItemForCopy(itemId, userId);
    if (!item) throw new NotFoundException('Meal item not found');

    await this.copyItemsToDates(
      userId,
      item.mealEntry.mealType,
      [item],
      dto.targetDates,
    );
  }

  private async copyItemsToDates(
    userId: string,
    mealType: string,
    items: CopyableMealItem[],
    targetDates: string[],
  ): Promise<void> {
    const targets = await this.repo.findUserTargets(userId);

    for (const targetDate of targetDates) {
      const dayLog = await this.repo.findOrCreateToday(
        userId,
        targetDate,
        targets,
      );
      const mealEntry = await this.repo.findOrCreateMealEntry(
        dayLog.id,
        mealType,
      );

      for (const item of items) {
        await this.repo.createMealItem(mealEntry.id, {
          pantryProductId: item.pantryProductId ?? undefined,
          pantryRecipeId: item.pantryRecipeId ?? undefined,
          savedMealId: item.savedMealId ?? undefined,
          grams: item.grams ?? undefined,
          servings: item.servings ?? undefined,
          macrosSnapshot: item.macrosSnapshot as MacrosSnapshot,
        });
      }

      await this.repo.recalculateAndSaveTotals(dayLog.id);
    }
  }

  async removeMealEntry(userId: string, mealEntryId: string): Promise<void> {
    const entry = await this.repo.findMealEntryWithOwnership(mealEntryId);
    if (!entry || entry.dayLog.userId !== userId) {
      throw new NotFoundException('Meal entry not found');
    }
    await this.repo.deleteMealItemsByEntry(mealEntryId);
    await this.repo.recalculateAndSaveTotals(entry.dayLog.id);
  }

  async updateMealItem(
    userId: string,
    itemId: string,
    dto: UpdateMealItemDto,
  ): Promise<{ id: string }> {
    if ((dto.grams == null) === (dto.servings == null)) {
      throw new BadRequestException('Provide either grams or servings');
    }
    const item = await this.repo.findMealItemForUpdate(itemId, userId);
    if (!item) throw new NotFoundException('Meal item not found');

    const current = item.grams ?? item.servings;
    const next = item.grams != null ? dto.grams : dto.servings;
    if (current == null || current <= 0) {
      throw new BadRequestException('This item amount cannot be changed');
    }
    if (next == null) {
      throw new BadRequestException(
        item.grams != null
          ? 'This item is measured in grams'
          : 'This item is measured in servings',
      );
    }

    const snapshot = this.calculator.scaleSnapshot(
      item.macrosSnapshot as MacrosSnapshot,
      next / current,
    );
    await this.repo.updateMealItemAmount(itemId, {
      grams: item.grams != null ? next : null,
      servings: item.servings != null ? next : null,
      macrosSnapshot: snapshot,
    });
    await this.repo.recalculateAndSaveTotals(item.mealEntry.dayLog.id);
    return { id: itemId };
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
