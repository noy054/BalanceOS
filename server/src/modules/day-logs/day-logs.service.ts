import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ComponentAmountUpdate,
  DayLogsRepository,
  Db,
  MealComponentInput,
} from './day-logs.repository';
import {
  applyDelta,
  matchesSnapshot,
  recipeComponents,
  savedMealComponents,
  savedMealSnapshot,
  sumSnapshots,
} from './meal-components';
import {
  NutritionCalculatorService,
  MacrosSnapshot,
  BaseMacros,
  isBaseMacros,
  baseMacrosOf,
} from '../nutrition-calculator/nutrition-calculator.service';
import { AddMealItemDto } from './dto/add-meal-item.dto';
import { CopyMealDto } from './dto/copy-meal.dto';
import { MoveMealItemDto } from './dto/move-meal-item.dto';
import {
  UpdateMealComponentDto,
  UpdateMealItemDto,
} from './dto/update-meal-item.dto';
import {
  daysBetween,
  isWithinFutureLimit,
  resolveClientToday,
  utcDayKey,
} from '../../common/date/day-key';

const MAX_CALENDAR_DAYS = 61;

type CopyableMealItem = {
  pantryProductId: string | null;
  pantryRecipeId: string | null;
  savedMealId: string | null;
  grams: number | null;
  servings: number | null;
  milliliters: number | null;
  portions?: number | null;
  macrosSnapshot: unknown;
  components?: StoredComponent[];
};

type StoredComponent = {
  id: string;
  position: number;
  name: string;
  imageUrl: string | null;
  pantryProductId: string | null;
  pantryRecipeId: string | null;
  grams: number | null;
  servings: number | null;
  milliliters: number | null;
  serving: unknown;
  macrosSnapshot: unknown;
  baseMacros?: unknown;
};

function componentBaseMacros(
  component: Pick<
    StoredComponent,
    'grams' | 'servings' | 'milliliters' | 'macrosSnapshot' | 'baseMacros'
  >,
): BaseMacros | null {
  if (isBaseMacros(component.baseMacros)) return component.baseMacros;
  return baseMacrosOf(
    component.macrosSnapshot as MacrosSnapshot,
    component.grams ?? component.milliliters ?? component.servings,
  );
}

function toComponentInput(component: StoredComponent): MealComponentInput {
  return {
    position: component.position,
    name: component.name,
    imageUrl: component.imageUrl,
    pantryProductId: component.pantryProductId,
    pantryRecipeId: component.pantryRecipeId,
    grams: component.grams,
    servings: component.servings,
    milliliters: component.milliliters,
    serving: (component.serving as Record<string, unknown> | null) ?? null,
    macrosSnapshot: component.macrosSnapshot as MacrosSnapshot,
    baseMacros: componentBaseMacros(component),
  };
}

function toComponentResponse(component: StoredComponent) {
  const snapshot = component.macrosSnapshot as MacrosSnapshot;
  return {
    id: component.id,
    name: component.name,
    imageUrl: component.imageUrl,
    source: component.pantryRecipeId
      ? ('RECIPE' as const)
      : ('PRODUCT' as const),
    pantryProductId: component.pantryProductId,
    grams: component.grams,
    servings: component.servings,
    milliliters: component.milliliters,
    serving: component.serving ?? null,
    calories: snapshot.calories,
    protein: snapshot.protein,
    carbs: snapshot.carbs ?? 0,
    fat: snapshot.fat ?? 0,
    fiber: snapshot.fiber ?? 0,
    baseMacros: componentBaseMacros(component),
  };
}

function storedAmount(entry: {
  grams: number | null;
  servings: number | null;
  milliliters: number | null;
  portions?: number | null;
}) {
  return entry.grams ?? entry.milliliters ?? entry.portions ?? entry.servings;
}

function pickNextAmount(
  entry: {
    grams: number | null;
    servings: number | null;
    milliliters: number | null;
    portions?: number | null;
  },
  dto: UpdateMealItemDto,
) {
  return entry.grams != null
    ? dto.grams
    : entry.milliliters != null
      ? dto.milliliters
      : entry.portions != null
        ? dto.portions
        : dto.servings;
}

function unitMismatchMessage(entry: {
  grams: number | null;
  milliliters: number | null;
  portions?: number | null;
}) {
  return entry.grams != null
    ? 'This item is measured in grams'
    : entry.milliliters != null
      ? 'This item is measured in milliliters'
      : entry.portions != null
        ? 'This item is measured in portions'
        : 'This item is measured in servings';
}

function assertSingleAmount(dto: UpdateMealItemDto) {
  if (
    [dto.grams, dto.servings, dto.milliliters, dto.portions].filter(
      (value) => value != null,
    ).length !== 1
  ) {
    throw new BadRequestException(
      'Provide exactly one of grams, milliliters, servings or portions',
    );
  }
}

function todayDate(): string {
  return utcDayKey();
}

function assertWritableDate(date: string): void {
  if (!isWithinFutureLimit(date))
    throw new BadRequestException('Date is too far in the future');
}

function assertCopyTargets(dto: CopyMealDto): void {
  const today = resolveClientToday(dto.today);
  for (const date of dto.targetDates) {
    if (date <= today)
      throw new BadRequestException('Meals can only be copied to future days');
    assertWritableDate(date);
  }
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
        itemCount: row.itemCount,
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
    let components: MealComponentInput[] | undefined;

    let recipeAmount: {
      servings: number;
      portions?: number;
      grams?: number;
    } | null = null;

    if (dto.pantryProductId) {
      if (dto.portions != null)
        throw new BadRequestException('Portions apply only to recipes');
      if (
        [dto.grams, dto.servings, dto.milliliters].filter(Boolean).length !== 1
      )
        throw new BadRequestException(
          'Products require exactly one of grams, milliliters or servings',
        );
      const product = await this.repo.findPantryProductForUser(
        dto.pantryProductId,
        userId,
      );
      if (!product) throw new NotFoundException('Product not found');
      const productSnapshot = this.calculator.productSnapshot(product, {
        grams: dto.grams,
        servings: dto.servings,
        milliliters: dto.milliliters,
      });
      if (!productSnapshot)
        throw new BadRequestException(
          'This amount cannot be calculated for this product',
        );
      snapshot = productSnapshot;
    } else if (dto.pantryRecipeId) {
      if (
        dto.milliliters != null ||
        [dto.servings, dto.portions, dto.grams].filter((value) => value != null)
          .length !== 1
      )
        throw new BadRequestException(
          'Recipes require exactly one of servings, portions or grams',
        );
      const recipe = await this.repo.findPantryRecipeForUser(
        dto.pantryRecipeId,
        userId,
      );
      if (!recipe) throw new NotFoundException('Recipe not found');
      const fraction = this.calculator.recipeFraction(recipe, dto);
      if (fraction === 'noPortions')
        throw new BadRequestException('This recipe has no portion setup');
      if (fraction === 'noCookedWeight')
        throw new BadRequestException(
          'Enter the cooked weight or every ingredient weight to log this recipe in grams',
        );
      if (!(fraction > 0))
        throw new BadRequestException('The amount must be greater than zero');
      const recipeSnapshot = this.calculator.recipeSnapshot(recipe, fraction);
      if (!recipeSnapshot)
        throw new BadRequestException(
          'This recipe contains ingredients that cannot be calculated',
        );
      snapshot = recipeSnapshot;
      components =
        recipeComponents(this.calculator, recipe, fraction) ?? undefined;
      const weight = this.calculator.recipeWeight(recipe);
      const grams =
        dto.grams ??
        (weight ? Math.round(weight * fraction * 10) / 10 : undefined);
      recipeAmount = {
        servings: fraction,
        ...(dto.portions != null ? { portions: dto.portions } : {}),
        ...(grams != null ? { grams } : {}),
      };
    } else {
      const meal = await this.repo.findSavedMealForUser(
        dto.savedMealId!,
        userId,
      );
      if (!meal) throw new NotFoundException('Saved meal not found');
      if (meal.items.some((item) => !item.product && !item.recipe))
        throw new BadRequestException(
          'This saved meal contains a product or recipe that was removed from the pantry',
        );
      const mealSnapshot = savedMealSnapshot(this.calculator, meal);
      if (!mealSnapshot)
        throw new BadRequestException(
          'This saved meal contains items that cannot be calculated',
        );
      snapshot = mealSnapshot;
      components = savedMealComponents(this.calculator, meal) ?? undefined;
    }

    const dayLog = await this.getOrCreateDay(userId, date);
    const mealEntry = await this.repo.findOrCreateMealEntry(
      dayLog.id,
      dto.mealType,
    );

    const item = await this.repo.createMealItem(
      mealEntry.id,
      {
        pantryProductId: dto.pantryProductId,
        pantryRecipeId: dto.pantryRecipeId,
        savedMealId: dto.savedMealId,
        grams: recipeAmount ? recipeAmount.grams : dto.grams,
        servings: recipeAmount ? recipeAmount.servings : dto.servings,
        milliliters: recipeAmount ? undefined : dto.milliliters,
        portions: recipeAmount?.portions,
        macrosSnapshot: snapshot,
        components,
      },
      dayLog.id,
    );

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
          const { imageUrl: productImage, ...serving } = item.pantryProduct ?? {
            imageUrl: null,
          };
          return {
            id: item.id,
            name: s.name,
            imageUrl:
              productImage ??
              item.pantryRecipe?.imageUrl ??
              item.savedMeal?.imageUrl ??
              item.components.find((component) => component.imageUrl)
                ?.imageUrl ??
              null,
            source: item.pantryProductId
              ? ('PRODUCT' as const)
              : item.pantryRecipeId
                ? ('RECIPE' as const)
                : item.savedMealId
                  ? ('SAVED_MEAL' as const)
                  : null,
            grams: item.grams ?? this.derivedRecipeGrams(item),
            servings: item.servings,
            milliliters: item.milliliters,
            portions: item.portions,
            serving: item.pantryProduct ? serving : null,
            calories: s.calories,
            protein: s.protein,
            carbs: s.carbs ?? 0,
            fat: s.fat ?? 0,
            fiber: s.fiber ?? 0,
            components: item.components.map(toComponentResponse),
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
    assertCopyTargets(dto);
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
    assertCopyTargets(dto);
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

      await this.repo.createMealItems(
        mealEntry.id,
        items.map((item) => ({
          pantryProductId: item.pantryProductId ?? undefined,
          pantryRecipeId: item.pantryRecipeId ?? undefined,
          savedMealId: item.savedMealId ?? undefined,
          grams: item.grams ?? undefined,
          servings: item.servings ?? undefined,
          milliliters: item.milliliters ?? undefined,
          portions: item.portions ?? undefined,
          macrosSnapshot: item.macrosSnapshot as MacrosSnapshot,
          components: item.components?.map(toComponentInput),
        })),
        dayLog.id,
      );
    }
  }

  async removeMealEntry(userId: string, mealEntryId: string): Promise<void> {
    const entry = await this.repo.findMealEntryWithOwnership(mealEntryId);
    if (!entry || entry.dayLog.userId !== userId) {
      throw new NotFoundException('Meal entry not found');
    }
    await this.repo.deleteMealItemsByEntry(mealEntryId, entry.dayLog.id);
  }

  async updateMealItem(
    userId: string,
    itemId: string,
    dto: UpdateMealItemDto,
  ): Promise<{ id: string }> {
    assertSingleAmount(dto);
    await this.repo.withMealItemLock(itemId, async (db) => {
      const dayLogId = await this.scaleMealItem(userId, itemId, dto, db);
      await this.repo.recalculateAndSaveTotals(dayLogId, db);
    });
    return { id: itemId };
  }

  private async scaleMealItem(
    userId: string,
    itemId: string,
    dto: UpdateMealItemDto,
    db: Db,
  ): Promise<string> {
    const found = await this.repo.findMealItemForUpdate(itemId, userId, db);
    if (!found) throw new NotFoundException('Meal item not found');
    const item =
      found.grams == null && dto.grams != null && found.pantryRecipeId
        ? { ...found, grams: this.derivedRecipeGrams(found) }
        : found;

    const current = storedAmount(item);
    const next = pickNextAmount(item, dto);
    if (current == null || current <= 0) {
      throw new BadRequestException('This item amount cannot be changed');
    }
    if (next == null) {
      throw new BadRequestException(unitMismatchMessage(item));
    }

    const ratio = next / current;
    const snapshot = this.calculator.scaleSnapshot(
      item.macrosSnapshot as MacrosSnapshot,
      ratio,
    );
    const components: ComponentAmountUpdate[] = item.components.map(
      (component) => ({
        id: component.id,
        grams: component.grams != null ? component.grams * ratio : null,
        servings:
          component.servings != null ? component.servings * ratio : null,
        milliliters:
          component.milliliters != null ? component.milliliters * ratio : null,
        macrosSnapshot: this.calculator.scaleSnapshot(
          component.macrosSnapshot as MacrosSnapshot,
          ratio,
        ),
      }),
    );
    await this.repo.updateMealItemAmount(
      itemId,
      {
        grams: item.grams != null ? next : null,
        servings:
          item.servings == null
            ? null
            : item.grams == null && item.portions == null
              ? next
              : item.servings * ratio,
        milliliters: item.milliliters != null ? next : null,
        portions:
          item.portions == null
            ? null
            : item.grams == null
              ? next
              : item.portions * ratio,
        macrosSnapshot: snapshot,
        components,
      },
      db,
    );
    return item.mealEntry.dayLog.id;
  }

  private derivedRecipeGrams(item: {
    servings: number | null;
    pantryRecipe:
      | Parameters<NutritionCalculatorService['recipeWeight']>[0]
      | null;
  }): number | null {
    if (!item.pantryRecipe || !item.servings) return null;
    const weight = this.calculator.recipeWeight(item.pantryRecipe);
    return weight ? Math.round(weight * item.servings * 10) / 10 : null;
  }

  async getMealItemComponents(userId: string, itemId: string) {
    const item = await this.repo.findMealItemForComponents(itemId, userId);
    if (!item) throw new NotFoundException('Meal item not found');
    if (item.components.length > 0) {
      return { components: item.components.map(toComponentResponse) };
    }

    const built = await this.buildComponentsFromTemplate(userId, item);
    if (!built) {
      throw new ConflictException(
        'Ingredient details are not available for this entry',
      );
    }
    await this.repo.withMealItemLock(item.id, (db) =>
      this.repo.createComponentsIfMissing(item.id, built, db),
    );
    const stored = await this.repo.findMealItemForComponents(itemId, userId);
    return { components: (stored?.components ?? []).map(toComponentResponse) };
  }

  private async buildComponentsFromTemplate(
    userId: string,
    item: {
      pantryRecipeId: string | null;
      savedMealId: string | null;
      servings: number | null;
      macrosSnapshot: unknown;
    },
  ): Promise<MealComponentInput[] | null> {
    let components: MealComponentInput[] | null = null;
    if (item.pantryRecipeId && item.servings) {
      const recipe = await this.repo.findPantryRecipeForUser(
        item.pantryRecipeId,
        userId,
      );
      components = recipe
        ? recipeComponents(this.calculator, recipe, item.servings)
        : null;
    } else if (item.savedMealId) {
      const meal = await this.repo.findSavedMealForUser(
        item.savedMealId,
        userId,
      );
      components =
        meal && meal.items.every((entry) => entry.product || entry.recipe)
          ? savedMealComponents(this.calculator, meal)
          : null;
    }
    if (!components || components.length === 0) return null;
    const totals = sumSnapshots(components.map((c) => c.macrosSnapshot));
    return matchesSnapshot(totals, item.macrosSnapshot as MacrosSnapshot)
      ? components
      : null;
  }

  async updateMealItemComponent(
    userId: string,
    itemId: string,
    componentId: string,
    dto: UpdateMealComponentDto,
  ): Promise<{ id: string }> {
    assertSingleAmount(dto);
    await this.repo.withMealItemLock(itemId, async (db) => {
      const dayLogId = await this.scaleComponent(
        userId,
        itemId,
        componentId,
        dto,
        db,
      );
      await this.repo.recalculateAndSaveTotals(dayLogId, db);
    });
    return { id: componentId };
  }

  private async scaleComponent(
    userId: string,
    itemId: string,
    componentId: string,
    dto: UpdateMealComponentDto,
    db: Db,
  ): Promise<string> {
    const component = await this.repo.findComponentForUpdate(
      componentId,
      itemId,
      userId,
      db,
    );
    if (!component) throw new NotFoundException('Ingredient not found');

    const next = pickNextAmount(component, dto);
    const base = componentBaseMacros(component);
    if (!base) {
      throw new BadRequestException('This ingredient amount cannot be changed');
    }
    if (next == null) {
      throw new BadRequestException(unitMismatchMessage(component));
    }

    const before = component.macrosSnapshot as MacrosSnapshot;
    const after = this.calculator.scaleSnapshot(
      { ...base, name: before.name },
      next / base.amount,
    );
    const itemSnapshot = applyDelta(
      component.mealItem.macrosSnapshot as MacrosSnapshot,
      before,
      after,
    );

    await this.repo.updateComponentAndItem(
      {
        id: component.id,
        grams: component.grams != null ? next : null,
        servings: component.servings != null ? next : null,
        milliliters: component.milliliters != null ? next : null,
        macrosSnapshot: after,
        baseMacros: base,
      },
      { id: component.mealItem.id, macrosSnapshot: itemSnapshot },
      db,
    );
    return component.mealItem.mealEntry.dayLog.id;
  }

  moveMealItem(
    userId: string,
    itemId: string,
    dto: MoveMealItemDto,
  ): Promise<{ id: string; mealEntryId: string }> {
    return this.repo.withMealItemLock(itemId, async (db) => {
      const item = await this.repo.findMealItemForMove(itemId, userId, db);
      if (!item) throw new NotFoundException('Meal item not found');
      if (item.mealEntry.mealType === dto.mealType) {
        return { id: item.id, mealEntryId: item.mealEntry.id };
      }
      const target = await this.repo.findOrCreateMealEntryIn(
        item.mealEntry.dayLogId,
        dto.mealType,
        db,
      );
      await this.repo.moveMealItem(item.id, target.id, db);
      await this.repo.recalculateAndSaveTotals(item.mealEntry.dayLogId, db);
      return { id: item.id, mealEntryId: target.id };
    });
  }

  async removeMealItem(userId: string, itemId: string): Promise<void> {
    const item = await this.repo.findMealItemWithOwnership(itemId);
    if (!item || item.mealEntry.dayLog.userId !== userId) {
      throw new NotFoundException('Meal item not found');
    }
    const dayLogId = item.mealEntry.dayLog.id;
    await this.repo.deleteMealItem(itemId, dayLogId);
  }
}
