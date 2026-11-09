import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePantryProductDto } from './dto/create-pantry-product.dto';
import { UpdatePantryProductDto } from './dto/update-pantry-product.dto';
import { PantryProductModel } from '../../../generated/prisma/models';
import { Prisma } from '../../../generated/prisma/client';
import { PRODUCT_NUTRITION_SELECT } from './product-select';
import { allTermsWhere } from '../../common/search/search-terms';
import { classifyCatalogItem } from '../product-catalog/catalog-subcategories';
import {
  PantryCategory,
  PantryFocus,
  PantrySort,
} from './dto/list-pantry-products.dto';

export type PantryListFilter = {
  focus?: PantryFocus;
  category?: PantryCategory;
};

const SERVING_BASIS = Prisma.sql`"nutritionBasis" = 'PER_SERVING'`;
const PROTEIN = Prisma.sql`(CASE WHEN ${SERVING_BASIS} THEN "proteinPerServing" ELSE "proteinPer100g" END) * 4`;
const CARBS = Prisma.sql`(CASE WHEN ${SERVING_BASIS} THEN "carbsPerServing" ELSE "carbsPer100g" END) * 4`;
const FAT = Prisma.sql`(CASE WHEN ${SERVING_BASIS} THEN "fatPerServing" ELSE "fatPer100g" END) * 9`;
const MACROS_KNOWN = Prisma.sql`${PROTEIN} IS NOT NULL AND ${CARBS} IS NOT NULL AND ${FAT} IS NOT NULL`;

type MacroFocus = 'protein' | 'carbs' | 'fat';
type ProduceFocus = 'vegetables' | 'fruits';

const FOCUS_CONDITION: Record<MacroFocus, Prisma.Sql> = {
  protein: Prisma.sql`${MACROS_KNOWN} AND ${PROTEIN} > 0 AND ${PROTEIN} >= ${CARBS} AND ${PROTEIN} >= ${FAT}`,
  carbs: Prisma.sql`${MACROS_KNOWN} AND ${CARBS} > 0 AND ${CARBS} >= ${PROTEIN} AND ${CARBS} >= ${FAT}`,
  fat: Prisma.sql`${MACROS_KNOWN} AND ${FAT} > 0 AND ${FAT} >= ${PROTEIN} AND ${FAT} >= ${CARBS}`,
};

const PRODUCE_KEY: Record<ProduceFocus, string> = {
  vegetables: 'VEGETABLES',
  fruits: 'FRUITS',
};

const PRODUCE_DEPARTMENTS: Record<ProduceFocus, ReadonlySet<string>> = {
  vegetables: new Set(['PRODUCE', 'FROZEN']),
  fruits: new Set(['PRODUCE']),
};

function isProduceFocus(focus: PantryFocus): focus is ProduceFocus {
  return focus === 'vegetables' || focus === 'fruits';
}

function isProduce(
  focus: ProduceFocus,
  name: string,
  catalog: { department: string | null; subcategoryKey: string | null } | null,
) {
  const key = PRODUCE_KEY[focus];
  const departments = PRODUCE_DEPARTMENTS[focus];
  if (catalog?.subcategoryKey) {
    return (
      catalog.subcategoryKey === key &&
      departments.has(catalog.department ?? 'PRODUCE')
    );
  }
  const classified = classifyCatalogItem([], null, name);
  return (
    departments.has(classified.department) && classified.subcategoryKey === key
  );
}

type ProduceCacheEntry = { version: string; ids: string[] };

const SORT_ORDER: Record<
  PantrySort,
  Prisma.PantryProductOrderByWithRelationInput[]
> = {
  newest: [{ createdAt: 'desc' }, { id: 'desc' }],
  updated: [{ updatedAt: 'desc' }, { id: 'desc' }],
  name: [{ name: 'asc' }, { id: 'asc' }],
};

@Injectable()
export class PantryRepository {
  private readonly produceCache = new Map<string, ProduceCacheEntry>();

  constructor(private readonly prisma: PrismaService) {}

  async findPageByUserId(
    userId: string,
    take: number,
    search?: string,
    cursor?: string,
    sort: PantrySort = 'newest',
    filter: PantryListFilter = {},
  ): Promise<PantryProductModel[]> {
    const focusIds = filter.focus
      ? await this.findIdsByFocus(userId, filter.focus)
      : null;
    return this.prisma.pantryProduct.findMany({
      where: {
        userId,
        ...allTermsWhere(['name', 'brand'] as const, search),
        ...(filter.category
          ? {
              OR: [
                { mealCategories: { has: filter.category } },
                { mealCategories: { isEmpty: true } },
              ],
            }
          : {}),
        ...(focusIds ? { id: { in: focusIds } } : {}),
      },
      orderBy: SORT_ORDER[sort],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  private async findIdsByFocus(userId: string, focus: PantryFocus) {
    if (isProduceFocus(focus)) return this.findProduceIds(userId, focus);
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "PantryProduct"
      WHERE "userId" = ${userId} AND ${FOCUS_CONDITION[focus]}
    `;
    return rows.map((row) => row.id);
  }

  private async findProduceIds(userId: string, focus: ProduceFocus) {
    const stats = await this.prisma.pantryProduct.aggregate({
      where: { userId },
      _count: { _all: true },
      _max: { updatedAt: true },
    });
    const version = `${stats._count._all}:${stats._max.updatedAt?.getTime() ?? 0}`;
    const cacheKey = `${userId}:${focus}`;
    const cached = this.produceCache.get(cacheKey);
    if (cached?.version === version) return cached.ids;

    const rows = await this.prisma.pantryProduct.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        catalogItem: { select: { department: true, subcategoryKey: true } },
      },
    });
    const ids = rows
      .filter((row) => isProduce(focus, row.name, row.catalogItem))
      .map((row) => row.id);
    this.produceCache.set(cacheKey, { version, ids });
    return ids;
  }

  async findFrequent(userId: string, since: string, take: number) {
    const usage = await this.prisma.mealItem.groupBy({
      by: ['pantryProductId'],
      where: {
        pantryProductId: { not: null },
        mealEntry: { dayLog: { userId, date: { gte: since } } },
      },
      _count: { pantryProductId: true },
      orderBy: { _count: { pantryProductId: 'desc' } },
      take,
    });
    const ids = usage
      .map((row) => row.pantryProductId)
      .filter((id): id is string => id !== null);
    if (ids.length === 0) return [];
    const products = await this.prisma.pantryProduct.findMany({
      where: { userId, id: { in: ids } },
    });
    return ids
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is PantryProductModel => Boolean(product));
  }

  findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<PantryProductModel | null> {
    return this.prisma.pantryProduct.findFirst({ where: { id, userId } });
  }

  findNutritionByIds(userId: string, ids: string[]) {
    return this.prisma.pantryProduct.findMany({
      where: { userId, id: { in: ids } },
      select: { id: true, ...PRODUCT_NUTRITION_SELECT },
    });
  }

  async findAmountUsages(productId: string): Promise<{
    byGrams: boolean;
    byServings: boolean;
    byMilliliters: boolean;
  }> {
    const count = (field: 'grams' | 'servings' | 'milliliters') =>
      Promise.all([
        this.prisma.pantryRecipeItem.count({
          where: { productId, [field]: { not: null } },
        }),
        this.prisma.savedMealItem.count({
          where: { productId, [field]: { not: null } },
        }),
      ]).then(([recipes, meals]) => recipes + meals > 0);
    const [byGrams, byServings, byMilliliters] = await Promise.all([
      count('grams'),
      count('servings'),
      count('milliliters'),
    ]);
    return { byGrams, byServings, byMilliliters };
  }

  async countRecipesForUser(userId: string, ids: string[]): Promise<number> {
    return this.prisma.pantryRecipe.count({
      where: { userId, id: { in: ids } },
    });
  }

  findByNormalizedBarcode(
    userId: string,
    normalizedBarcode: string,
  ): Promise<PantryProductModel | null> {
    return this.prisma.pantryProduct.findUnique({
      where: { userId_normalizedBarcode: { userId, normalizedBarcode } },
    });
  }

  findByCatalogItemId(
    userId: string,
    catalogItemId: string,
  ): Promise<PantryProductModel | null> {
    return this.prisma.pantryProduct.findFirst({
      where: { userId, catalogItemId },
    });
  }

  create(
    userId: string,
    dto: CreatePantryProductDto,
    normalizedBarcode: string | null,
  ): Promise<PantryProductModel> {
    return this.prisma.pantryProduct.create({
      data: { userId, ...dto, normalizedBarcode },
    });
  }

  createFromCatalog(
    data: Prisma.PantryProductUncheckedCreateInput,
  ): Promise<PantryProductModel> {
    return this.prisma.pantryProduct.create({ data });
  }

  update(
    id: string,
    dto: UpdatePantryProductDto & {
      nutrients?: Prisma.NullableJsonNullValueInput;
    },
    normalizedBarcode: string | null | undefined,
  ): Promise<PantryProductModel> {
    return this.prisma.pantryProduct.update({
      where: { id },
      data: {
        ...dto,
        ...(normalizedBarcode !== undefined ? { normalizedBarcode } : {}),
      },
    });
  }

  delete(id: string): Promise<PantryProductModel> {
    return this.prisma.pantryProduct.delete({ where: { id } });
  }
}
