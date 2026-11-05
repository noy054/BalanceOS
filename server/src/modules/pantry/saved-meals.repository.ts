import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import {
  CreateSavedMealDto,
  SavedMealItemDto,
} from './dto/create-saved-meal.dto';
import { PRODUCT_NUTRITION_SELECT } from './product-select';

const ITEM_ORDER: { position?: 'asc'; createdAt?: 'asc' }[] = [
  { position: 'asc' },
  { createdAt: 'asc' },
];

const SAVED_MEAL_INCLUDE = {
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
      recipe: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  ...PRODUCT_NUTRITION_SELECT,
                },
              },
            },
          },
        },
      },
    },
    orderBy: ITEM_ORDER,
  },
} as const;

export type SavedMealRow = Awaited<
  ReturnType<SavedMealsRepository['findByIdAndUserId']>
>;

@Injectable()
export class SavedMealsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserId(userId: string) {
    return this.prisma.savedMeal.findMany({
      where: { userId },
      include: SAVED_MEAL_INCLUDE,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findByIdAndUserId(id: string, userId: string) {
    return this.prisma.savedMeal.findFirst({
      where: { id, userId },
      include: SAVED_MEAL_INCLUDE,
    });
  }

  create(userId: string, dto: CreateSavedMealDto) {
    return this.prisma.savedMeal.create({
      data: {
        userId,
        name: dto.name,
        mealTypes: dto.mealTypes ?? [],
        imageUrl: dto.imageUrl?.trim() || null,
        items: {
          create: dto.items.map((item, position) => ({
            productId: item.productId,
            recipeId: item.recipeId,
            grams: item.grams,
            servings: item.servings,
            milliliters: item.milliliters,
            position,
          })),
        },
      },
      include: SAVED_MEAL_INCLUDE,
    });
  }

  updateHeader(
    id: string,
    name: string | undefined,
    mealTypes: string[] | undefined,
  ) {
    return this.prisma.savedMeal.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(mealTypes !== undefined ? { mealTypes } : {}),
      },
      include: SAVED_MEAL_INCLUDE,
    });
  }

  async updateWithItems(
    db: Prisma.TransactionClient,
    id: string,
    name: string | undefined,
    mealTypes: string[] | undefined,
    items: SavedMealItemDto[] | undefined,
    imageUrl?: string | null,
  ) {
    if (items !== undefined) {
      await db.savedMealItem.deleteMany({ where: { savedMealId: id } });
      if (items.length > 0) {
        await db.savedMealItem.createMany({
          data: items.map((item, position) => ({
            savedMealId: id,
            productId: item.productId,
            recipeId: item.recipeId,
            grams: item.grams,
            servings: item.servings,
            milliliters: item.milliliters,
            position,
          })),
        });
      }
    }
    return db.savedMeal.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(mealTypes !== undefined ? { mealTypes } : {}),
        ...(imageUrl !== undefined
          ? { imageUrl: imageUrl?.trim() || null }
          : {}),
      },
      include: SAVED_MEAL_INCLUDE,
    });
  }

  delete(id: string) {
    return this.prisma.savedMeal.delete({ where: { id } });
  }
}
