import { Prisma } from '../../../../generated/prisma/client';

export const CATALOG_ITEM_PUBLIC_SELECT = {
  id: true,
  barcode: true,
  normalizedBarcode: true,
  name: true,
  brand: true,
  imageUrl: true,
  nutritionBasis: true,
  caloriesPer100g: true,
  proteinPer100g: true,
  carbsPer100g: true,
  fatPer100g: true,
  fiberPer100g: true,
  sugarPer100g: true,
  saturatedFatPer100g: true,
  sodiumPer100g: true,
  saltPer100g: true,
  caloriesPerServing: true,
  proteinPerServing: true,
  carbsPerServing: true,
  fatPerServing: true,
  fiberPerServing: true,
  nutrients: true,
  servingSizeGrams: true,
  servingSizeMl: true,
  servingSizeText: true,
  servingQuantity: true,
  servingUnit: true,
  department: true,
  source: true,
  verificationStatus: true,
  externalProvider: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ProductCatalogItemSelect;

export const CATALOG_ITEM_DETAIL_SELECT = {
  ...CATALOG_ITEM_PUBLIC_SELECT,
  ingredientsText: true,
  allergensText: true,
  manufacturer: true,
  category: true,
  subCategory: true,
  countryCode: true,
} as const satisfies Prisma.ProductCatalogItemSelect;

export type ProductCatalogItemDetailDto = Prisma.ProductCatalogItemGetPayload<{
  select: typeof CATALOG_ITEM_DETAIL_SELECT;
}> & { pantryProductId: string | null };

export const CATALOG_ITEM_REVIEW_SELECT = {
  ...CATALOG_ITEM_PUBLIC_SELECT,
  externalId: true,
  originalData: true,
} as const satisfies Prisma.ProductCatalogItemSelect;

export type ProductCatalogItemDto = Prisma.ProductCatalogItemGetPayload<{
  select: typeof CATALOG_ITEM_PUBLIC_SELECT;
}>;

export type ProductCatalogItemReviewDto = Prisma.ProductCatalogItemGetPayload<{
  select: typeof CATALOG_ITEM_REVIEW_SELECT;
}>;

const PERSON_SELECT = { id: true, email: true, fullName: true } as const;

export const CATALOG_ITEM_ADMIN_SELECT = {
  ...CATALOG_ITEM_REVIEW_SELECT,
  archivedAt: true,
  createdByUser: { select: PERSON_SELECT },
  updatedByUser: { select: PERSON_SELECT },
  archivedByUser: { select: PERSON_SELECT },
  _count: { select: { pantryProducts: true } },
} as const satisfies Prisma.ProductCatalogItemSelect;

export type ProductCatalogItemAdminRow = Prisma.ProductCatalogItemGetPayload<{
  select: typeof CATALOG_ITEM_ADMIN_SELECT;
}>;

export type CatalogBrowseItemDto = ProductCatalogItemDto & {
  pantryProductId: string | null;
};

export type CatalogDepartmentCountDto = {
  department: string;
  count: number;
};

export type CatalogSubcategoryCountDto = {
  key: string;
  count: number;
};
