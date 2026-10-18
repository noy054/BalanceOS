import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NormalizedProductData } from './types/external-product.types';
import {
  CATALOG_ITEM_PUBLIC_SELECT,
  ProductCatalogItemDto,
} from './types/product-catalog.types';

@Injectable()
export class ProductCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByNormalizedBarcode(
    normalizedBarcode: string,
  ): Promise<ProductCatalogItemDto | null> {
    return this.prisma.productCatalogItem.findUnique({
      where: { normalizedBarcode },
      select: CATALOG_ITEM_PUBLIC_SELECT,
    });
  }

  findById(id: string): Promise<ProductCatalogItemDto | null> {
    return this.prisma.productCatalogItem.findUnique({
      where: { id },
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
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
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
        imageUrl: data.imageUrl,
        caloriesPer100g: data.caloriesPer100g,
        proteinPer100g: data.proteinPer100g,
        carbsPer100g: data.carbsPer100g,
        fatPer100g: data.fatPer100g,
        fiberPer100g: data.fiberPer100g,
        servingSizeGrams: data.servingSizeGrams ?? null,
        servingSizeText: data.servingSizeText ?? null,
        source: data.source,
        verificationStatus: data.verificationStatus,
        externalProvider: data.externalProvider,
        externalId: data.externalId,
        // Prisma JSON input type is incompatible with Record<string,unknown> at compile time but safe at runtime
        externalRawData: data.externalRawData as unknown as object,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
      select: CATALOG_ITEM_PUBLIC_SELECT,
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
