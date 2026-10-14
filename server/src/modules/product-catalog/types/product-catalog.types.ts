import { Prisma } from '../../../../generated/prisma/client';

/**
 * Public shape of a catalog item. Deliberately excludes externalRawData (large provider JSON)
 * and createdBy/updatedBy user ids (other users' identities).
 */
export const CATALOG_ITEM_PUBLIC_SELECT = {
  id: true,
  barcode: true,
  normalizedBarcode: true,
  name: true,
  brand: true,
  imageUrl: true,
  caloriesPer100g: true,
  proteinPer100g: true,
  carbsPer100g: true,
  fatPer100g: true,
  fiberPer100g: true,
  servingSizeGrams: true,
  servingSizeText: true,
  source: true,
  verificationStatus: true,
  externalProvider: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ProductCatalogItemSelect;

export type ProductCatalogItemDto = Prisma.ProductCatalogItemGetPayload<{
  select: typeof CATALOG_ITEM_PUBLIC_SELECT;
}>;
