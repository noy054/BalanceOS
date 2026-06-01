import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSavedMealDto, SavedMealItemDto } from './dto/create-saved-meal.dto';

const SAVED_MEAL_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          caloriesPer100g: true,
          proteinPer100g: true,
          carbsPer100g: true,
          fatPer100g: true,
          fiberPer100g: true,
        },
      },
      recipe: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  caloriesPer100g: true,
                  proteinPer100g: true,
                  carbsPer100g: true,
                  fatPer100g: true,
                  fiberPer100g: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
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
      orderBy: { name: 'asc' },
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
        mealType: dto.mealType,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            recipeId: item.recipeId,
            grams: item.grams,
            servings: item.servings,
          })),
        },
      },
      include: SAVED_MEAL_INCLUDE,
    });
  }

  updateHeader(id: string, name: string | undefined, mealType: string | undefined) {
    return this.prisma.savedMeal.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(mealType !== undefined ? { mealType } : {}),
      },
      include: SAVED_MEAL_INCLUDE,
    });
  }

  async updateWithItems(
    id: string,
    name: string | undefined,
    mealType: string | undefined,
    items: SavedMealItemDto[] | undefined,
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (items !== undefined) {
        await tx.savedMealItem.deleteMany({ where: { savedMealId: id } });
        if (items.length > 0) {
          await tx.savedMealItem.createMany({
            data: items.map((item) => ({
              savedMealId: id,
              productId: item.productId,
              recipeId: item.recipeId,
              grams: item.grams,
              servings: item.servings,
            })),
          });
        }
      }
      return tx.savedMeal.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(mealType !== undefined ? { mealType } : {}),
        },
        include: SAVED_MEAL_INCLUDE,
      });
    });
  }

  delete(id: string) {
    return this.prisma.savedMeal.delete({ where: { id } });
  }
}
