import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { MacrosSnapshot } from '../nutrition-calculator/nutrition-calculator.service';
import { ProductNutritionSource } from '../nutrition-calculator/product-nutrition';
import { PRODUCT_NUTRITION_SELECT } from '../pantry/product-select';

export type PantryProductRow = ProductNutritionSource & {
  id: string;
  name: string;
};

type AmountRow = {
  grams: number | null;
  servings: number | null;
  milliliters: number | null;
};

export type TemplateProduct = ProductNutritionSource & {
  id: string;
  name: string;
  imageUrl: string | null;
  servingQuantity: number | null;
  servingUnit: string | null;
};

export type Db = Prisma.TransactionClient;

export type TemplateRebuild = {
  itemId: string;
  macrosSnapshot: MacrosSnapshot;
  components: MealComponentInput[];
};

const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 30_000 };

export type PantryRecipeRow = {
  id: string;
  name: string;
  items: Array<AmountRow & { product: TemplateProduct }>;
};

export type SavedMealRow = {
  id: string;
  name: string;
  items: Array<
    AmountRow & {
      product: TemplateProduct | null;
      recipe: {
        id: string;
        name: string;
        imageUrl: string | null;
        items: Array<AmountRow & { product: TemplateProduct }>;
      } | null;
    }
  >;
};

export type MealComponentInput = {
  position: number;
  name: string;
  imageUrl: string | null;
  pantryProductId: string | null;
  pantryRecipeId: string | null;
  grams: number | null;
  servings: number | null;
  milliliters: number | null;
  serving: Record<string, unknown> | null;
  macrosSnapshot: MacrosSnapshot;
};

export type ComponentAmountUpdate = {
  id: string;
  grams: number | null;
  servings: number | null;
  milliliters: number | null;
  macrosSnapshot: MacrosSnapshot;
};

const TEMPLATE_PRODUCT_SELECT = {
  id: true,
  name: true,
  imageUrl: true,
  ...PRODUCT_NUTRITION_SELECT,
} as const;

const SAVED_MEAL_TEMPLATE_SELECT = {
  id: true,
  name: true,
  items: {
    select: {
      grams: true,
      servings: true,
      milliliters: true,
      product: {
        select: TEMPLATE_PRODUCT_SELECT,
      },
      recipe: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          items: {
            select: {
              grams: true,
              servings: true,
              milliliters: true,
              product: {
                select: TEMPLATE_PRODUCT_SELECT,
              },
            },
          },
        },
      },
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.SavedMealSelect;

export const COMPONENT_SELECT = {
  id: true,
  position: true,
  name: true,
  imageUrl: true,
  pantryProductId: true,
  pantryRecipeId: true,
  grams: true,
  servings: true,
  milliliters: true,
  serving: true,
  macrosSnapshot: true,
} as const;

function componentData(component: MealComponentInput) {
  return {
    position: component.position,
    name: component.name,
    imageUrl: component.imageUrl,
    pantryProductId: component.pantryProductId,
    pantryRecipeId: component.pantryRecipeId,
    grams: component.grams,
    servings: component.servings,
    milliliters: component.milliliters,
    serving: (component.serving ?? undefined) as object | undefined,
    macrosSnapshot: component.macrosSnapshot as unknown as object,
  };
}

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
  fiber: 25,
};

@Injectable()
export class DayLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserTargets(userId: string) {
    const s = await this.prisma.userNutritionSettings.findUnique({
      where: { userId },
      select: {
        dailyCaloriesTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatTarget: true,
        fiberTarget: true,
      },
    });
    return {
      calories: s?.dailyCaloriesTarget ?? DEFAULT_TARGETS.calories,
      protein: s?.proteinTarget ?? DEFAULT_TARGETS.protein,
      carbs: s?.carbsTarget ?? DEFAULT_TARGETS.carbs,
      fat: s?.fatTarget ?? DEFAULT_TARGETS.fat,
      fiber: s?.fiberTarget ?? DEFAULT_TARGETS.fiber,
    };
  }

  findToday(userId: string, date: string) {
    return this.prisma.dayLog.findUnique({
      where: { userId_date: { userId, date } },
    });
  }

  findDaysInRange(userId: string, from: string, to: string) {
    return this.prisma.dayLog.findMany({
      where: { userId, date: { gte: from, lte: to } },
      select: {
        date: true,
        caloriesTotal: true,
        mealEntries: { select: { _count: { select: { items: true } } } },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findOrCreateToday(
    userId: string,
    date: string,
    targetsSnapshot: object,
  ) {
    return this.prisma.dayLog.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, targetsSnapshot },
      update: {},
    });
  }

  async findOrCreateMealEntry(dayLogId: string, mealType: string) {
    return this.prisma.mealEntry.upsert({
      where: { dayLogId_mealType: { dayLogId, mealType } },
      create: { dayLogId, mealType },
      update: {},
    });
  }

  createMealItem(
    mealEntryId: string,
    data: {
      pantryProductId?: string;
      pantryRecipeId?: string;
      savedMealId?: string;
      grams?: number;
      servings?: number;
      milliliters?: number;
      macrosSnapshot: MacrosSnapshot;
      components?: MealComponentInput[];
    },
  ) {
    return this.prisma.mealItem.create({
      data: {
        mealEntryId,
        pantryProductId: data.pantryProductId ?? null,
        pantryRecipeId: data.pantryRecipeId ?? null,
        savedMealId: data.savedMealId ?? null,
        grams: data.grams ?? null,
        servings: data.servings ?? null,
        milliliters: data.milliliters ?? null,
        macrosSnapshot: data.macrosSnapshot as unknown as object,
        ...(data.components && data.components.length > 0
          ? { components: { create: data.components.map(componentData) } }
          : {}),
      },
    });
  }

  transaction<T>(fn: (db: Db) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn, TRANSACTION_OPTIONS);
  }

  withMealItemLock<T>(itemId: string, fn: (db: Db) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "MealItem" WHERE id = ${itemId} FOR UPDATE`;
      return fn(tx);
    }, TRANSACTION_OPTIONS);
  }

  async createComponentsIfMissing(
    mealItemId: string,
    components: MealComponentInput[],
    db: Db,
  ): Promise<void> {
    const existing = await db.mealItemComponent.count({
      where: { mealItemId },
    });
    if (existing > 0) return;
    await db.mealItemComponent.createMany({
      data: components.map((component) => ({
        mealItemId,
        ...componentData(component),
      })),
    });
  }

  findMealItemForComponents(itemId: string, userId: string) {
    return this.prisma.mealItem.findFirst({
      where: { id: itemId, mealEntry: { dayLog: { userId } } },
      select: {
        id: true,
        pantryRecipeId: true,
        savedMealId: true,
        servings: true,
        macrosSnapshot: true,
        components: { select: COMPONENT_SELECT, orderBy: { position: 'asc' } },
      },
    });
  }

  findComponentForUpdate(
    componentId: string,
    itemId: string,
    userId: string,
    db: Db = this.prisma,
  ) {
    return db.mealItemComponent.findFirst({
      where: {
        id: componentId,
        mealItemId: itemId,
        mealItem: { mealEntry: { dayLog: { userId } } },
      },
      select: {
        id: true,
        grams: true,
        servings: true,
        milliliters: true,
        macrosSnapshot: true,
        mealItem: {
          select: {
            id: true,
            macrosSnapshot: true,
            mealEntry: { select: { dayLog: { select: { id: true } } } },
          },
        },
      },
    });
  }

  async updateComponentAndItem(
    component: ComponentAmountUpdate,
    item: { id: string; macrosSnapshot: MacrosSnapshot },
    db: Db,
  ): Promise<void> {
    await db.mealItemComponent.update({
      where: { id: component.id },
      data: {
        grams: component.grams,
        servings: component.servings,
        milliliters: component.milliliters,
        macrosSnapshot: component.macrosSnapshot as unknown as object,
      },
      select: { id: true },
    });
    await db.mealItem.update({
      where: { id: item.id },
      data: { macrosSnapshot: item.macrosSnapshot as unknown as object },
      select: { id: true },
    });
  }

  findPantryProductForUser(
    productId: string,
    userId: string,
  ): Promise<PantryProductRow | null> {
    return this.prisma.pantryProduct.findFirst({
      where: { id: productId, userId },
      select: {
        id: true,
        name: true,
        ...PRODUCT_NUTRITION_SELECT,
      },
    });
  }

  findPantryRecipeForUser(
    recipeId: string,
    userId: string,
    db: Db = this.prisma,
  ): Promise<PantryRecipeRow | null> {
    return db.pantryRecipe.findFirst({
      where: { id: recipeId, userId },
      select: {
        id: true,
        name: true,
        items: {
          select: {
            grams: true,
            servings: true,
            milliliters: true,
            product: {
              select: TEMPLATE_PRODUCT_SELECT,
            },
          },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  findSavedMealForUser(
    savedMealId: string,
    userId: string,
    db: Db = this.prisma,
  ): Promise<SavedMealRow | null> {
    return db.savedMeal.findFirst({
      where: { id: savedMealId, userId },
      select: SAVED_MEAL_TEMPLATE_SELECT,
    });
  }

  findSavedMealsForUser(
    savedMealIds: string[],
    userId: string,
    db: Db = this.prisma,
  ): Promise<SavedMealRow[]> {
    if (savedMealIds.length === 0) return Promise.resolve([]);
    return db.savedMeal.findMany({
      where: { id: { in: savedMealIds }, userId },
      select: SAVED_MEAL_TEMPLATE_SELECT,
    });
  }

  async findTodayMeals(userId: string, date: string) {
    return this.prisma.dayLog.findUnique({
      where: { userId_date: { userId, date } },
      select: {
        mealEntries: {
          select: {
            id: true,
            mealType: true,
            items: {
              select: {
                id: true,
                macrosSnapshot: true,
                grams: true,
                servings: true,
                milliliters: true,
                pantryProductId: true,
                pantryRecipeId: true,
                savedMealId: true,
                pantryProduct: {
                  select: {
                    nutritionBasis: true,
                    servingSizeG: true,
                    servingSizeMl: true,
                    servingQuantity: true,
                    servingUnit: true,
                  },
                },
                components: {
                  select: COMPONENT_SELECT,
                  orderBy: { position: 'asc' },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });
  }

  async findMealEntryWithItems(mealEntryId: string) {
    return this.prisma.mealEntry.findUnique({
      where: { id: mealEntryId },
      include: {
        dayLog: { select: { userId: true } },
        items: {
          select: {
            pantryProductId: true,
            pantryRecipeId: true,
            savedMealId: true,
            grams: true,
            servings: true,
            milliliters: true,
            macrosSnapshot: true,
            components: {
              select: COMPONENT_SELECT,
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });
  }

  findMealItemForCopy(itemId: string, userId: string) {
    return this.prisma.mealItem.findFirst({
      where: { id: itemId, mealEntry: { dayLog: { userId } } },
      select: {
        pantryProductId: true,
        pantryRecipeId: true,
        savedMealId: true,
        grams: true,
        servings: true,
        milliliters: true,
        macrosSnapshot: true,
        components: { select: COMPONENT_SELECT, orderBy: { position: 'asc' } },
        mealEntry: { select: { mealType: true } },
      },
    });
  }

  findMealItemForUpdate(itemId: string, userId: string, db: Db = this.prisma) {
    return db.mealItem.findFirst({
      where: { id: itemId, mealEntry: { dayLog: { userId } } },
      select: {
        id: true,
        grams: true,
        servings: true,
        milliliters: true,
        macrosSnapshot: true,
        components: { select: COMPONENT_SELECT, orderBy: { position: 'asc' } },
        mealEntry: { select: { dayLog: { select: { id: true } } } },
      },
    });
  }

  async updateMealItemAmount(
    itemId: string,
    data: {
      grams: number | null;
      servings: number | null;
      milliliters: number | null;
      macrosSnapshot: MacrosSnapshot;
      components?: ComponentAmountUpdate[];
    },
    db: Db,
  ): Promise<void> {
    await db.mealItem.update({
      where: { id: itemId },
      data: {
        grams: data.grams,
        servings: data.servings,
        milliliters: data.milliliters,
        macrosSnapshot: data.macrosSnapshot as unknown as object,
      },
      select: { id: true },
    });
    for (const component of data.components ?? []) {
      await db.mealItemComponent.update({
        where: { id: component.id },
        data: {
          grams: component.grams,
          servings: component.servings,
          milliliters: component.milliliters,
          macrosSnapshot: component.macrosSnapshot as unknown as object,
        },
        select: { id: true },
      });
    }
  }

  async findMealItemWithOwnership(itemId: string) {
    return this.prisma.mealItem.findUnique({
      where: { id: itemId },
      include: {
        mealEntry: {
          select: {
            dayLog: { select: { id: true, userId: true } },
          },
        },
      },
    });
  }

  findMealEntryWithOwnership(mealEntryId: string) {
    return this.prisma.mealEntry.findUnique({
      where: { id: mealEntryId },
      select: {
        id: true,
        dayLog: { select: { id: true, userId: true } },
      },
    });
  }

  deleteMealItemsByEntry(mealEntryId: string) {
    return this.prisma.mealItem.deleteMany({ where: { mealEntryId } });
  }

  deleteMealItem(itemId: string) {
    return this.prisma.mealItem.delete({ where: { id: itemId } });
  }

  findTemplateInstances(
    userId: string,
    template: { pantryRecipeId: string } | { savedMealId: { in: string[] } },
    fromDate: string,
    db: Db = this.prisma,
  ) {
    return db.mealItem.findMany({
      where: {
        ...template,
        mealEntry: { dayLog: { userId, date: { gte: fromDate } } },
      },
      select: {
        id: true,
        savedMealId: true,
        servings: true,
        macrosSnapshot: true,
        components: {
          select: COMPONENT_SELECT,
          orderBy: { position: 'asc' },
        },
        mealEntry: { select: { dayLog: { select: { id: true } } } },
      },
    });
  }

  async findSavedMealIdsWithRecipe(
    userId: string,
    recipeId: string,
    db: Db = this.prisma,
  ) {
    const rows = await db.savedMeal.findMany({
      where: { userId, items: { some: { recipeId } } },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  async applyTemplateRebuilds(
    rebuilds: TemplateRebuild[],
    db: Db,
  ): Promise<void> {
    if (rebuilds.length === 0) return;
    await db.mealItemComponent.deleteMany({
      where: { mealItemId: { in: rebuilds.map((rebuild) => rebuild.itemId) } },
    });
    await db.mealItemComponent.createMany({
      data: rebuilds.flatMap((rebuild) =>
        rebuild.components.map((component) => ({
          mealItemId: rebuild.itemId,
          ...componentData(component),
        })),
      ),
    });
    for (const rebuild of rebuilds) {
      await db.mealItem.update({
        where: { id: rebuild.itemId },
        data: { macrosSnapshot: rebuild.macrosSnapshot as unknown as object },
        select: { id: true },
      });
    }
  }

  async recalculateAndSaveTotals(dayLogId: string, db: Db = this.prisma) {
    await this.recalculateTotalsForDayLogs([dayLogId], db);
  }

  async recalculateTotalsForDayLogs(
    dayLogIds: string[],
    db: Db = this.prisma,
  ): Promise<void> {
    if (dayLogIds.length === 0) return;
    const items = await db.mealItem.findMany({
      where: { mealEntry: { dayLogId: { in: dayLogIds } } },
      select: {
        macrosSnapshot: true,
        mealEntry: { select: { dayLogId: true } },
      },
    });
    const totals = new Map(
      dayLogIds.map((id) => [
        id,
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      ]),
    );
    for (const item of items) {
      const sum = totals.get(item.mealEntry.dayLogId);
      if (!sum) continue;
      const s = item.macrosSnapshot as MacrosSnapshot;
      sum.calories += s.calories;
      sum.protein += s.protein;
      sum.carbs += s.carbs;
      sum.fat += s.fat;
      sum.fiber += s.fiber;
    }

    const r1 = (v: number) => Math.round(v * 10) / 10;
    for (const [id, sum] of totals) {
      await db.dayLog.update({
        where: { id },
        data: {
          caloriesTotal: Math.round(sum.calories),
          proteinTotal: r1(sum.protein),
          carbsTotal: r1(sum.carbs),
          fatTotal: r1(sum.fat),
          fiberTotal: r1(sum.fiber),
        },
        select: { id: true },
      });
    }
  }
}
