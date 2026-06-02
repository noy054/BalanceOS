import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipeDto, RecipeItemDto } from './dto/create-recipe.dto';

const RECIPE_INCLUDE = {
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
    },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

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
      orderBy: { name: 'asc' },
    });
  }

  findByIdAndUserId(id: string, userId: string) {
    return this.prisma.pantryRecipe.findFirst({
      where: { id, userId },
      include: RECIPE_INCLUDE,
    });
  }

  create(userId: string, dto: CreateRecipeDto) {
    return this.prisma.pantryRecipe.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        mealType: dto.mealType ?? null,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            grams: item.grams,
          })),
        },
      },
      include: RECIPE_INCLUDE,
    });
  }

  updateHeader(id: string, name: string | undefined, description: string | undefined) {
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
    name: string | undefined,
    description: string | undefined,
    mealType: string | undefined,
    items: RecipeItemDto[] | undefined,
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (items !== undefined) {
        await tx.pantryRecipeItem.deleteMany({ where: { recipeId: id } });
        if (items.length > 0) {
          await tx.pantryRecipeItem.createMany({
            data: items.map((item) => ({
              recipeId: id,
              productId: item.productId,
              grams: item.grams,
            })),
          });
        }
      }
      return tx.pantryRecipe.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(mealType !== undefined ? { mealType } : {}),
        },
        include: RECIPE_INCLUDE,
      });
    });
  }

  delete(id: string) {
    return this.prisma.pantryRecipe.delete({ where: { id } });
  }
}
