import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductCatalogItemModel } from '../../../generated/prisma/models';
import { NormalizedProductData } from './open-food-facts.client';
import { CreateProductCatalogDto } from './dto/create-product-catalog.dto';
import { UpdateProductCatalogDto } from './dto/update-product-catalog.dto';
import { ProductSource, ProductVerificationStatus } from '../../../generated/prisma/enums';

@Injectable()
export class ProductCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByBarcode(barcode: string): Promise<ProductCatalogItemModel | null> {
    return this.prisma.productCatalogItem.findUnique({ where: { barcode } });
  }

  findByNormalizedBarcode(normalizedBarcode: string): Promise<ProductCatalogItemModel | null> {
    return this.prisma.productCatalogItem.findFirst({
      where: { normalizedBarcode },
    });
  }

  findById(id: string): Promise<ProductCatalogItemModel | null> {
    return this.prisma.productCatalogItem.findUnique({ where: { id } });
  }

  search(query: string, limit: number): Promise<ProductCatalogItemModel[]> {
    return this.prisma.productCatalogItem.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: limit,
    });
  }

  createFromOFF(
    data: NormalizedProductData,
    userId: string,
  ): Promise<ProductCatalogItemModel> {
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
        source: data.source,
        verificationStatus: data.verificationStatus,
        externalProvider: data.externalProvider,
        // Prisma JSON input type is incompatible with Record<string,unknown> at compile time but safe at runtime
        externalRawData: data.externalRawData as unknown as object,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });
  }

  createManual(
    dto: CreateProductCatalogDto,
    userId: string,
  ): Promise<ProductCatalogItemModel> {
    const normalized = dto.barcode ? dto.barcode.trim().toLowerCase() : undefined;
    return this.prisma.productCatalogItem.create({
      data: {
        barcode: dto.barcode ?? null,
        normalizedBarcode: normalized ?? null,
        name: dto.name,
        brand: dto.brand ?? null,
        imageUrl: dto.imageUrl ?? null,
        caloriesPer100g: dto.caloriesPer100g ?? null,
        proteinPer100g: dto.proteinPer100g ?? null,
        carbsPer100g: dto.carbsPer100g ?? null,
        fatPer100g: dto.fatPer100g ?? null,
        fiberPer100g: dto.fiberPer100g ?? null,
        source: ProductSource.MANUAL,
        verificationStatus: ProductVerificationStatus.USER_SUBMITTED,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });
  }

  update(
    id: string,
    dto: UpdateProductCatalogDto,
    userId: string,
  ): Promise<ProductCatalogItemModel> {
    return this.prisma.productCatalogItem.update({
      where: { id },
      data: {
        name: dto.name,
        brand: dto.brand,
        imageUrl: dto.imageUrl,
        caloriesPer100g: dto.caloriesPer100g,
        proteinPer100g: dto.proteinPer100g,
        carbsPer100g: dto.carbsPer100g,
        fatPer100g: dto.fatPer100g,
        fiberPer100g: dto.fiberPer100g,
        verificationStatus: dto.verificationStatus,
        updatedByUserId: userId,
      },
    });
  }
}
