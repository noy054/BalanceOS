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

  replaceItems(recipeId: string, items: RecipeItemDto[]) {
    return this.prisma.$transaction([
      this.prisma.pantryRecipeItem.deleteMany({ where: { recipeId } }),
      ...items.map((item) =>
        this.prisma.pantryRecipeItem.create({
          data: { recipeId, productId: item.productId, grams: item.grams },
        }),
      ),
    ]);
  }

  delete(id: string) {
    return this.prisma.pantryRecipe.delete({ where: { id } });
  }
}
