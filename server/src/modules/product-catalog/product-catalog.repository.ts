import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NormalizedProductData } from './types/external-product.types';
import { EMPTY_NUTRITION } from '../pantry/product-nutrition.normalizer';
import { toJson } from './catalog-data';
import { CatalogDepartment } from './catalog-departments';
import { classifyCatalogItem } from './catalog-subcategories';
import {
  CATALOG_ITEM_DETAIL_SELECT,
  CATALOG_ITEM_PUBLIC_SELECT,
  ProductCatalogItemDto,
} from './types/product-catalog.types';
import { allTermsWhere } from '../../common/search/search-terms';

const PRODUCT_SEARCH_FIELDS = ['name', 'brand'] as const;

function departmentWhere(department?: CatalogDepartment) {
  if (department === 'OTHER') {
    return { OR: [{ department: 'OTHER' }, { department: null }] };
  }
  return department ? { department } : {};
}

@Injectable()
export class ProductCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByNormalizedBarcode(
    normalizedBarcode: string,
  ): Promise<ProductCatalogItemDto | null> {
    return this.prisma.productCatalogItem.findFirst({
      where: { normalizedBarcode, archivedAt: null },
      select: CATALOG_ITEM_PUBLIC_SELECT,
    });
  }

  async isArchivedBarcode(normalizedBarcode: string): Promise<boolean> {
    const item = await this.prisma.productCatalogItem.findUnique({
      where: { normalizedBarcode },
      select: { archivedAt: true },
    });
    return Boolean(item?.archivedAt);
  }

  findDetailById(id: string) {
    return this.prisma.productCatalogItem.findFirst({
      where: { id, archivedAt: null },
      select: CATALOG_ITEM_DETAIL_SELECT,
    });
  }

  findById(id: string): Promise<ProductCatalogItemDto | null> {
    return this.prisma.productCatalogItem.findFirst({
      where: { id, archivedAt: null },
      select: CATALOG_ITEM_PUBLIC_SELECT,
    });
  }

  search(
    query: string,
    take: number,
    cursor?: string,
  ): Promise<ProductCatalogItemDto[]> {
    return this.prisma.productCatalogItem.findMany({
      where: {
        archivedAt: null,
        ...allTermsWhere(PRODUCT_SEARCH_FIELDS, query),
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: CATALOG_ITEM_PUBLIC_SELECT,
    });
  }

  createFromExternal(
    data: NormalizedProductData,
    userId: string,
  ): Promise<ProductCatalogItemDto> {
    return this.prisma.productCatalogItem.create({
      data: {
        barcode: data.barcode,
        normalizedBarcode: data.normalizedBarcode,
        name: data.name,
        brand: data.brand,
        ...classifyCatalogItem(null, data.externalRawData, data.name),
        imageUrl: data.imageUrl,
        caloriesPer100g: data.caloriesPer100g,
        proteinPer100g: data.proteinPer100g,
        carbsPer100g: data.carbsPer100g,
        fatPer100g: data.fatPer100g,
        fiberPer100g: data.fiberPer100g,
        sugarPer100g: data.sugarPer100g ?? null,
        saturatedFatPer100g: data.saturatedFatPer100g ?? null,
        sodiumPer100g: data.sodiumPer100g ?? null,
        saltPer100g: data.saltPer100g ?? null,
        nutrients: data.nutrients ?? undefined,
        servingSizeGrams: data.servingSizeGrams ?? null,
        servingSizeText: data.servingSizeText ?? null,
        originalData: toJson({
          ...EMPTY_NUTRITION,
          name: data.name,
          brand: data.brand,
          barcode: data.barcode,
          imageUrl: data.imageUrl,
          caloriesPer100g: data.caloriesPer100g,
          proteinPer100g: data.proteinPer100g,
          carbsPer100g: data.carbsPer100g,
          fatPer100g: data.fatPer100g,
          fiberPer100g: data.fiberPer100g,
          servingSizeG: data.servingSizeGrams ?? null,
          servingSizeText: data.servingSizeText ?? null,
          nutrients: data.nutrients ?? null,
        }),
        source: data.source,
        verificationStatus: data.verificationStatus,
        externalProvider: data.externalProvider,
        externalId: data.externalId,
        externalRawData: data.externalRawData as unknown as object,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
      select: CATALOG_ITEM_PUBLIC_SELECT,
    });
  }

  async countByDepartment(): Promise<Map<string, number>> {
    const groups = await this.prisma.productCatalogItem.groupBy({
      by: ['department'],
      where: { archivedAt: null },
      _count: { _all: true },
    });
    const counts = new Map<string, number>();
    for (const group of groups) {
      const key = group.department ?? 'OTHER';
      counts.set(key, (counts.get(key) ?? 0) + group._count._all);
    }
    return counts;
  }

  async countBySubcategory(
    department: CatalogDepartment,
  ): Promise<Map<string, number>> {
    const groups = await this.prisma.productCatalogItem.groupBy({
      by: ['subcategoryKey'],
      where: {
        archivedAt: null,
        ...departmentWhere(department),
        subcategoryKey: { not: null },
      },
      _count: { _all: true },
    });
    return new Map(
      groups.map((group) => [group.subcategoryKey ?? '', group._count._all]),
    );
  }

  browse(params: {
    department?: CatalogDepartment;
    query?: string;
    subcategory?: string;
    take: number;
    cursor?: string;
  }): Promise<ProductCatalogItemDto[]> {
    const { department, query, subcategory, take, cursor } = params;
    const filters = [
      ...(query ? [allTermsWhere(PRODUCT_SEARCH_FIELDS, query)] : []),
      ...(subcategory ? [{ subcategoryKey: subcategory }] : []),
    ];
    return this.prisma.productCatalogItem.findMany({
      where: {
        archivedAt: null,
        ...departmentWhere(department),
        ...(filters.length > 0 ? { AND: filters } : {}),
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: CATALOG_ITEM_PUBLIC_SELECT,
    });
  }

  findPantryMatches(
    userId: string,
    catalogItemIds: string[],
    normalizedBarcodes: string[],
  ) {
    return this.prisma.pantryProduct.findMany({
      where: {
        userId,
        OR: [
          { catalogItemId: { in: catalogItemIds } },
          ...(normalizedBarcodes.length > 0
            ? [{ normalizedBarcode: { in: normalizedBarcodes } }]
            : []),
        ],
      },
      select: { id: true, catalogItemId: true, normalizedBarcode: true },
    });
  }

  findMiss(normalizedBarcode: string): Promise<{ lastCheckedAt: Date } | null> {
    return this.prisma.barcodeLookupMiss.findUnique({
      where: { normalizedBarcode },
      select: { lastCheckedAt: true },
    });
  }

  async recordMiss(normalizedBarcode: string): Promise<void> {
    await this.prisma.barcodeLookupMiss.upsert({
      where: { normalizedBarcode },
      create: { normalizedBarcode },
      update: { attempts: { increment: 1 }, lastCheckedAt: new Date() },
    });
  }

  async clearMiss(normalizedBarcode: string): Promise<void> {
    await this.prisma.barcodeLookupMiss.deleteMany({
      where: { normalizedBarcode },
    });
  }
}
