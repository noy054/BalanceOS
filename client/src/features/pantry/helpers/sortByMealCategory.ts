import { PantryProduct, ProductCategory } from "../types";

/**
 * Sort products by meal-category relevance:
 *   0 — tagged with the current meal category  (best match, shown first)
 *   1 — no categories at all                   (untagged = available for all)
 *   2 — tagged only for other meal categories  (shown last)
 *
 * Pass null as mealCategory when no specific meal context exists; products
 * are then sorted untagged-first with specifically-tagged ones at the end.
 */
export function sortByMealCategory(
  products: PantryProduct[],
  mealCategory: ProductCategory | null,
): PantryProduct[] {
  if (products.length <= 1) return products;

  return [...products].sort((a, b) => {
    const sa = mealScore(a.mealCategories ?? [], mealCategory);
    const sb = mealScore(b.mealCategories ?? [], mealCategory);
    return sa - sb;
  });
}

function mealScore(
  categories: ProductCategory[],
  target: ProductCategory | null,
): number {
  if (categories.length === 0) return 1;
  if (target !== null && categories.includes(target)) return 0;
  return 2;
}
