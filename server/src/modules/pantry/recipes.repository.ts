import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  RecipeLeftoverMode,
  RecipePortionMode,
  RecipePortionTarget,
} from '../../../generated/prisma/client';
import { RecipeItemDto } from './dto/create-recipe.dto';
import { PRODUCT_NUTRITION_SELECT } from './product-select';

const ITEM_ORDER: { position?: 'asc'; createdAt?: 'asc' }[] = [
  { position: 'asc' },
  { createdAt: 'asc' },
];

const RECIPE_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          imageUrl: true,
          mealCategories: true,
          ...PRODUCT_NUTRITION_SELECT,
        },
      },
    },
    orderBy: ITEM_ORDER,
  },
} as const;

export type RecipeYield = {
  emptyPotWeightG?: number | null;
  potWithFoodWeightG?: number | null;
  cookedWeightG?: number | null;
  portionMode?: RecipePortionMode | null;
  portionCount?: number | null;
  portionTarget?: RecipePortionTarget | null;
  portionTargetValue?: number | null;
  leftoverMode?: RecipeLeftoverMode | null;
};

export type RecipeHeader = RecipeYield & {
  name?: string;
  description?: string;
  mealType?: string | null;
  mealTypes?: string[];
  imageUrl?: string | null;
  steps?: string[];
};

const YIELD_KEYS = [
  'emptyPotWeightG',
  'potWithFoodWeightG',
  'cookedWeightG',
  'portionMode',
  'portionCount',
  'portionTarget',
  'portionTargetValue',
  'leftoverMode',
] as const;

function pickYield(header: RecipeHeader): RecipeYield {
  return Object.fromEntries(
    YIELD_KEYS.filter((key) => header[key] !== undefined).map((key) => [
      key,
      header[key],
    ]),
  ) as RecipeYield;
}

export type RecipeRow = Awaited<
  ReturnType<RecipesRepository['findByIdAndUserId']>
>;

@Injectable()
export class RecipesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserId(userId: string) {
    return this.prisma.pantryRecipe.findMany({
      where: { userId },
      include: RECIPE_INCLUDE,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findByIdAndUserId(id: string, userId: string) {
    return this.prisma.pantryRecipe.findFirst({
      where: { id, userId },
      include: RECIPE_INCLUDE,
    });
  }

  create(userId: string, header: RecipeHeader, items: RecipeItemDto[]) {
    return this.prisma.pantryRecipe.create({
      data: {
        userId,
        name: header.name ?? '',
        description: header.description,
        mealType: header.mealType ?? null,
        mealTypes: header.mealTypes ?? [],
        imageUrl: header.imageUrl ?? null,
        steps: header.steps ?? [],
        ...pickYield(header),
        items: {
          create: items.map((item, position) => ({
            productId: item.productId,
            grams: item.grams ?? null,
            servings: item.servings ?? null,
            milliliters: item.milliliters ?? null,
            weightG: item.weightG ?? null,
            position,
          })),
        },
      },
      include: RECIPE_INCLUDE,
    });
  }

  updateHeader(
    id: string,
    name: string | undefined,
    description: string | undefined,
  ) {
    return this.prisma.pantryRecipe.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
      },
      include: RECIPE_INCLUDE,
    });
  }

  async updateWithItems(
    id: string,
    header: RecipeHeader,
    items: RecipeItemDto[] | undefined,
    db: Prisma.TransactionClient,
  ) {
    if (items !== undefined) {
      await db.pantryRecipeItem.deleteMany({ where: { recipeId: id } });
      if (items.length > 0) {
        await db.pantryRecipeItem.createMany({
          data: items.map((item, position) => ({
            recipeId: id,
            productId: item.productId,
            grams: item.grams ?? null,
            servings: item.servings ?? null,
            milliliters: item.milliliters ?? null,
            weightG: item.weightG ?? null,
            position,
          })),
        });
      }
    }
    return db.pantryRecipe.update({
      where: { id },
      data: {
        ...(header.name !== undefined ? { name: header.name } : {}),
        ...(header.description !== undefined
          ? { description: header.description }
          : {}),
        ...(header.mealType !== undefined ? { mealType: header.mealType } : {}),
        ...(header.mealTypes !== undefined
          ? { mealTypes: header.mealTypes }
          : {}),
        ...(header.imageUrl !== undefined ? { imageUrl: header.imageUrl } : {}),
        ...(header.steps !== undefined ? { steps: header.steps } : {}),
        ...pickYield(header),
      },
      include: RECIPE_INCLUDE,
    });
  }

  delete(id: string) {
    return this.prisma.pantryRecipe.delete({ where: { id } });
  }
}
