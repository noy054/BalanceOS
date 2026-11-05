import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DayLogsRepository,
  Db,
  MealComponentInput,
  PantryRecipeRow,
  SavedMealRow,
  TemplateRebuild,
} from './day-logs.repository';
import {
  mergeTemplateComponents,
  recipeComponents,
  savedMealComponents,
  savedMealSnapshot,
  totalsSnapshot,
} from './meal-components';
import {
  MacrosSnapshot,
  NutritionCalculatorService,
} from '../nutrition-calculator/nutrition-calculator.service';
import { daysBetween, utcDayKey } from '../../common/date/day-key';

const MAX_LOCAL_DAY_OFFSET = 1;

type RecipeTemplateState = {
  recipe: PantryRecipeRow | null;
  savedMeals: SavedMealRow[];
};

type StoredComponent = {
  pantryProductId: string | null;
  pantryRecipeId: string | null;
  grams: number | null;
  servings: number | null;
  milliliters: number | null;
};

type Instance = {
  id: string;
  savedMealId: string | null;
  servings: number | null;
  components: StoredComponent[];
  mealEntry: { dayLog: { id: string } };
};

type SavedMealPlan = {
  name: string;
  previous: MealComponentInput[] | null;
  next: MealComponentInput[];
  fresh: MacrosSnapshot;
};

class SyncBatch {
  readonly rebuilds = new Map<string, TemplateRebuild>();
  readonly dayLogIds = new Set<string>();

  add(instance: Instance, rebuild: Omit<TemplateRebuild, 'itemId'>) {
    this.rebuilds.set(instance.id, { itemId: instance.id, ...rebuild });
    this.dayLogIds.add(instance.mealEntry.dayLog.id);
  }
}

@Injectable()
export class TemplateLogSyncService {
  constructor(
    private readonly repo: DayLogsRepository,
    private readonly calculator: NutritionCalculatorService,
  ) {}

  resolveFromDate(localToday?: string): string {
    const serverToday = utcDayKey();
    if (!localToday) return serverToday;
    if (Math.abs(daysBetween(serverToday, localToday)) > MAX_LOCAL_DAY_OFFSET) {
      throw new BadRequestException('logsFrom must be the current local day');
    }
    return localToday;
  }

  updateRecipe<T>(
    userId: string,
    recipeId: string,
    fromDate: string,
    write: (db: Db) => Promise<T>,
  ): Promise<T> {
    return this.repo.transaction(async (db) => {
      const before = await this.captureRecipe(userId, recipeId, db);
      const result = await write(db);
      await this.syncRecipe(userId, recipeId, before, fromDate, db);
      return result;
    });
  }

  updateSavedMeal<T>(
    userId: string,
    savedMealId: string,
    fromDate: string,
    write: (db: Db) => Promise<T>,
  ): Promise<T> {
    return this.repo.transaction(async (db) => {
      const before = await this.repo.findSavedMealForUser(
        savedMealId,
        userId,
        db,
      );
      const result = await write(db);
      const batch = new SyncBatch();
      await this.collectSavedMeals(
        userId,
        [savedMealId],
        new Map(before ? [[savedMealId, before]] : []),
        fromDate,
        db,
        batch,
      );
      await this.commit(batch, db);
      return result;
    });
  }

  private async captureRecipe(
    userId: string,
    recipeId: string,
    db: Db,
  ): Promise<RecipeTemplateState> {
    const recipe = await this.repo.findPantryRecipeForUser(
      recipeId,
      userId,
      db,
    );
    const savedMealIds = await this.repo.findSavedMealIdsWithRecipe(
      userId,
      recipeId,
      db,
    );
    const savedMeals = await this.repo.findSavedMealsForUser(
      savedMealIds,
      userId,
      db,
    );
    return { recipe, savedMeals };
  }

  private async syncRecipe(
    userId: string,
    recipeId: string,
    before: RecipeTemplateState,
    fromDate: string,
    db: Db,
  ): Promise<void> {
    const recipe = await this.repo.findPantryRecipeForUser(
      recipeId,
      userId,
      db,
    );
    if (!recipe) return;
    const batch = new SyncBatch();
    const instances = await this.repo.findTemplateInstances(
      userId,
      { pantryRecipeId: recipeId },
      fromDate,
      db,
    );

    for (const instance of instances) {
      if (!instance.servings) continue;
      const servings = instance.servings;
      const next = recipeComponents(this.calculator, recipe, servings);
      const fresh = this.calculator.recipeSnapshot(recipe, servings);
      if (!next || !fresh) continue;
      const previous = before.recipe
        ? recipeComponents(this.calculator, before.recipe, servings)
        : null;
      batch.add(
        instance,
        this.rebuild(instance, { name: recipe.name, previous, next, fresh }),
      );
    }

    await this.collectSavedMeals(
      userId,
      before.savedMeals.map((meal) => meal.id),
      new Map(before.savedMeals.map((meal) => [meal.id, meal])),
      fromDate,
      db,
      batch,
    );
    await this.commit(batch, db);
  }

  private async collectSavedMeals(
    userId: string,
    savedMealIds: string[],
    before: Map<string, SavedMealRow>,
    fromDate: string,
    db: Db,
    batch: SyncBatch,
  ): Promise<void> {
    const meals = await this.repo.findSavedMealsForUser(
      savedMealIds,
      userId,
      db,
    );
    const plans = new Map<string, SavedMealPlan>();
    for (const meal of meals) {
      const plan = this.savedMealPlan(meal, before.get(meal.id) ?? null);
      if (plan) plans.set(meal.id, plan);
    }
    if (plans.size === 0) return;

    const instances = await this.repo.findTemplateInstances(
      userId,
      { savedMealId: { in: [...plans.keys()] } },
      fromDate,
      db,
    );
    for (const instance of instances) {
      const plan = instance.savedMealId
        ? plans.get(instance.savedMealId)
        : undefined;
      if (plan) batch.add(instance, this.rebuild(instance, plan));
    }
  }

  private savedMealPlan(
    meal: SavedMealRow,
    before: SavedMealRow | null,
  ): SavedMealPlan | null {
    if (meal.items.some((item) => !item.product && !item.recipe)) return null;
    const next = savedMealComponents(this.calculator, meal);
    const fresh = savedMealSnapshot(this.calculator, meal);
    if (!next || !fresh) return null;
    const previous = before
      ? savedMealComponents(this.calculator, before)
      : null;
    return { name: meal.name, previous, next, fresh };
  }

  private rebuild(
    instance: Instance,
    plan: SavedMealPlan,
  ): Omit<TemplateRebuild, 'itemId'> {
    const merged = mergeTemplateComponents(
      this.calculator,
      instance.components,
      plan.previous,
      plan.next,
    );
    return {
      components: merged.components,
      macrosSnapshot: merged.customized
        ? totalsSnapshot(plan.name, merged.components)
        : { ...plan.fresh, name: plan.name },
    };
  }

  private async commit(batch: SyncBatch, db: Db): Promise<void> {
    await this.repo.applyTemplateRebuilds([...batch.rebuilds.values()], db);
    await this.repo.recalculateTotalsForDayLogs([...batch.dayLogIds], db);
  }
}
