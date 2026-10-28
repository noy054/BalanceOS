import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PantryRepository } from './pantry.repository';
import {
  ProductNutritionSource,
  supportsGrams,
  supportsServings,
} from '../nutrition-calculator/product-nutrition';

export type ProductAmountInput = {
  productId: string;
  grams?: number | null;
  servings?: number | null;
};

@Injectable()
export class PantryItemValidator {
  constructor(private readonly repo: PantryRepository) {}

  async validateProductAmounts(
    userId: string,
    items: ProductAmountInput[],
  ): Promise<void> {
    if (items.length === 0) return;

    const ids = [...new Set(items.map((item) => item.productId))];
    const products = await this.repo.findNutritionByIds(userId, ids);
    const byId = new Map(products.map((product) => [product.id, product]));

    for (const item of items) {
      const hasGrams = item.grams != null;
      const hasServings = item.servings != null;
      if (hasGrams === hasServings) {
        throw new BadRequestException(
          'Each product item requires either grams or servings',
        );
      }
      const product = byId.get(item.productId);
      if (!product) throw new NotFoundException('Product not found');
      if (hasGrams && !supportsGrams(product)) {
        throw new BadRequestException(
          'This product has no weight information. Use servings instead.',
        );
      }
      if (hasServings && !supportsServings(product)) {
        throw new BadRequestException(
          'This product has no defined serving. Use grams instead.',
        );
      }
    }
  }

  async validateNutritionChange(
    productId: string,
    next: ProductNutritionSource,
  ): Promise<void> {
    const usages = await this.repo.findAmountUsages(productId);
    if (usages.byGrams && !supportsGrams(next)) {
      throw new BadRequestException(
        'This product is used by weight in recipes or saved meals. Keep per-100g values or a serving weight.',
      );
    }
    if (usages.byServings && !supportsServings(next)) {
      throw new BadRequestException(
        'This product is used by servings in recipes or saved meals. Keep per-serving values or a serving weight.',
      );
    }
  }

  async validateRecipeOwnership(
    userId: string,
    recipeIds: string[],
  ): Promise<void> {
    const unique = [...new Set(recipeIds)];
    if (unique.length === 0) return;
    const count = await this.repo.countRecipesForUser(userId, unique);
    if (count !== unique.length)
      throw new NotFoundException('Recipe not found');
  }
}
