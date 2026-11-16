import { PortionSetup } from '../nutrition-calculator/recipe-portions';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import {
  MacrosSnapshot,
  BaseMacros,
  baseMacrosOf,
} from '../nutrition-calculator/nutrition-calculator.service';
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
  weightG?: number | null;
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

export type PantryRecipeRow = Partial<PortionSetup> & {
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
  baseMacros?: BaseMacros | null;
};

type NewMealItem = {
  pantryProductId?: string;
  pantryRecipeId?: string;
  savedMealId?: string;
  grams?: number;
  servings?: number;
  milliliters?: number;
  portions?: number;
  macrosSnapshot: MacrosSnapshot;
  components?: MealComponentInput[];
};

export type ComponentAmountUpdate = {
  id: string;
  grams: number | null;
  servings: number | null;
  milliliters: number | null;
  macrosSnapshot: MacrosSnapshot;
  baseMacros?: BaseMacros;
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

const RECIPE_WEIGHT_SELECT = {
  imageUrl: true,
  cookedWeightG: true,
  items: {
    select: {
      grams: true,
      servings: true,
      milliliters: true,
      weightG: true,
      product: { select: { servingSizeG: true, servingSizeMl: true } },
    },
  },
} as const;

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
  baseMacros: true,
} as const;

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

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
    baseMacros: (component.baseMacros ??
      baseMacrosOf(
        component.macrosSnapshot,
        component.grams ?? component.milliliters ?? component.servings,
      ) ??
      undefined) as object | undefined,
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

  findDaysInRange(
    userId: string,
    from: string,
    to: string,
  ): Promise<{ date: string; caloriesTotal: number; itemCount: number }[]> {
    return this.prisma.$queryRaw`
      SELECT dl.date, dl."caloriesTotal", count(mi.id)::int AS "itemCount"
      FROM "DayLog" dl
      JOIN "MealEntry" me ON me."dayLogId" = dl.id
      JOIN "MealItem" mi ON mi."mealEntryId" = me.id
      WHERE dl."userId" = ${userId} AND dl.date >= ${from} AND dl.date <= ${to}
      GROUP BY dl.id, dl.date, dl."caloriesTotal"
      ORDER BY dl.date ASC
    `;
  }

  async findOrCreateToday(
    userId: string,
    date: string,
    targetsSnapshot: object,
  ) {
    const where = { userId_date: { userId, date } };
    try {
      return await this.prisma.dayLog.upsert({
        where,
        create: { userId, date, targetsSnapshot },
        update: {},
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      return this.prisma.dayLog.findUniqueOrThrow({ where });
    }
  }

  async findOrCreateMealEntry(dayLogId: string, mealType: string) {
    const where = { dayLogId_mealType: { dayLogId, mealType } };
    try {
      return await this.prisma.mealEntry.upsert({
        where,
        create: { dayLogId, mealType },
        update: {},
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      return this.prisma.mealEntry.findUniqueOrThrow({ where });
    }
  }

  async createMealItem(
    mealEntryId: string,
    data: NewMealItem,
    dayLogId: string,
  ) {
    const [item] = await this.prisma.$transaction([
      this.mealItemCreate(mealEntryId, data),
      ...this.totalsQueries([dayLogId], this.prisma),
    ]);
    return item;
  }

  async createMealItems(
    mealEntryId: string,
    items: NewMealItem[],
    dayLogId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      ...items.map((data) => this.mealItemCreate(mealEntryId, data)),
      ...this.totalsQueries([dayLogId], this.prisma),
    ]);
  }

  private mealItemCreate(mealEntryId: string, data: NewMealItem) {
    return this.prisma.mealItem.create({
      data: {
        mealEntryId,
        pantryProductId: data.pantryProductId ?? null,
        pantryRecipeId: data.pantryRecipeId ?? null,
        savedMealId: data.savedMealId ?? null,
        grams: data.grams ?? null,
        servings: data.servings ?? null,
        milliliters: data.milliliters ?? null,
        portions: data.portions ?? null,
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
        baseMacros: true,
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
        ...(component.baseMacros
          ? { baseMacros: component.baseMacros as unknown as object }
          : {}),
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
        cookedWeightG: true,
        portionMode: true,
        portionCount: true,
        portionTarget: true,
        portionTargetValue: true,
        leftoverMode: true,
        items: {
          select: {
            grams: true,
            servings: true,
            milliliters: true,
            weightG: true,
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
                portions: true,
                pantryProductId: true,
                pantryRecipeId: true,
                savedMealId: true,
                pantryProduct: {
                  select: {
                    imageUrl: true,
                    nutritionBasis: true,
                    servingSizeG: true,
                    servingSizeMl: true,
                    servingQuantity: true,
                    servingUnit: true,
                  },
                },
                pantryRecipe: { select: RECIPE_WEIGHT_SELECT },
                savedMeal: { select: { imageUrl: true } },
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
            portions: true,
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
        portions: true,
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
        pantryRecipeId: true,
        pantryRecipe: { select: RECIPE_WEIGHT_SELECT },
        grams: true,
        servings: true,
        milliliters: true,
        portions: true,
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
      portions: number | null;
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
        portions: data.portions,
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

  findMealItemForMove(itemId: string, userId: string, db: Db) {
    return db.mealItem.findFirst({
      where: { id: itemId, mealEntry: { dayLog: { userId } } },
      select: {
        id: true,
        mealEntry: { select: { id: true, mealType: true, dayLogId: true } },
      },
    });
  }

  async findOrCreateMealEntryIn(dayLogId: string, mealType: string, db: Db) {
    await db.mealEntry.createMany({
      data: [{ dayLogId, mealType }],
      skipDuplicates: true,
    });
    return db.mealEntry.findUniqueOrThrow({
      where: { dayLogId_mealType: { dayLogId, mealType } },
      select: { id: true },
    });
  }

  async moveMealItem(itemId: string, mealEntryId: string, db: Db) {
    await db.mealItem.update({
      where: { id: itemId },
      data: { mealEntryId },
      select: { id: true },
    });
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

  async deleteMealItemsByEntry(
    mealEntryId: string,
    dayLogId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.mealItem.deleteMany({ where: { mealEntryId } }),
      ...this.totalsQueries([dayLogId], this.prisma),
    ]);
  }

  async deleteMealItem(itemId: string, dayLogId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.mealItem.delete({ where: { id: itemId } }),
      ...this.totalsQueries([dayLogId], this.prisma),
    ]);
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
    if (db === this.prisma) {
      await this.prisma.$transaction(
        this.totalsQueries(dayLogIds, this.prisma),
      );
      return;
    }
    for (const query of this.totalsQueries(dayLogIds, db)) await query;
  }

  private totalsQueries(dayLogIds: string[], db: Db) {
    const ids = [...new Set(dayLogIds)].sort();
    return [
      db.$queryRaw`SELECT id FROM "DayLog" WHERE id IN (${Prisma.join(ids)}) ORDER BY id FOR UPDATE`,
      db.$executeRaw`
      UPDATE "DayLog" AS d
      SET
        "caloriesTotal" = round(t.calories),
        "proteinTotal" = round(t.protein, 1),
        "carbsTotal" = round(t.carbs, 1),
        "fatTotal" = round(t.fat, 1),
        "fiberTotal" = round(t.fiber, 1),
        "updatedAt" = now()
      FROM (
        SELECT
          dl.id,
          coalesce(sum((mi."macrosSnapshot"->>'calories')::numeric), 0) AS calories,
          coalesce(sum((mi."macrosSnapshot"->>'protein')::numeric), 0) AS protein,
          coalesce(sum((mi."macrosSnapshot"->>'carbs')::numeric), 0) AS carbs,
          coalesce(sum((mi."macrosSnapshot"->>'fat')::numeric), 0) AS fat,
          coalesce(sum((mi."macrosSnapshot"->>'fiber')::numeric), 0) AS fiber
        FROM "DayLog" dl
        LEFT JOIN "MealEntry" me ON me."dayLogId" = dl.id
        LEFT JOIN "MealItem" mi ON mi."mealEntryId" = me.id
        WHERE dl.id IN (${Prisma.join(dayLogIds)})
        GROUP BY dl.id
      ) AS t
      WHERE d.id = t.id
    `,
    ];
  }
}
