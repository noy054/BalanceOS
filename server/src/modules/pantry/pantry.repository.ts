import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePantryProductDto } from './dto/create-pantry-product.dto';
import { UpdatePantryProductDto } from './dto/update-pantry-product.dto';
import { PantryProductModel } from '../../../generated/prisma/models';
import { Prisma } from '../../../generated/prisma/client';
import { PRODUCT_NUTRITION_SELECT } from './product-select';
import { allTermsWhere } from '../../common/search/search-terms';
import { PantrySort } from './dto/list-pantry-products.dto';

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
  constructor(private readonly prisma: PrismaService) {}

  findPageByUserId(
    userId: string,
    take: number,
    search?: string,
    cursor?: string,
    sort: PantrySort = 'newest',
  ): Promise<PantryProductModel[]> {
    return this.prisma.pantryProduct.findMany({
      where: {
        userId,
        ...allTermsWhere(['name', 'brand'] as const, search),
      },
      orderBy: SORT_ORDER[sort],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
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
