import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePantryProductDto } from './dto/create-pantry-product.dto';
import { UpdatePantryProductDto } from './dto/update-pantry-product.dto';
import { PantryProductModel } from '../../../generated/prisma/models';
import { Prisma } from '../../../generated/prisma/client';
import { PRODUCT_NUTRITION_SELECT } from './product-select';

@Injectable()
export class PantryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPageByUserId(
    userId: string,
    take: number,
    search?: string,
    cursor?: string,
  ): Promise<PantryProductModel[]> {
    return this.prisma.pantryProduct.findMany({
      where: {
        userId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
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

  async findAmountUsages(
    productId: string,
  ): Promise<{ byGrams: boolean; byServings: boolean }> {
    const [recipeGrams, recipeServings, mealGrams, mealServings] =
      await Promise.all([
        this.prisma.pantryRecipeItem.count({
          where: { productId, grams: { not: null } },
        }),
        this.prisma.pantryRecipeItem.count({
          where: { productId, servings: { not: null } },
        }),
        this.prisma.savedMealItem.count({
          where: { productId, grams: { not: null } },
        }),
        this.prisma.savedMealItem.count({
          where: { productId, servings: { not: null } },
        }),
      ]);
    return {
      byGrams: recipeGrams + mealGrams > 0,
      byServings: recipeServings + mealServings > 0,
    };
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
