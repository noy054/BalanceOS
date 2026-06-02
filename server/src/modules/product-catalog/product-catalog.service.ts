import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductCatalogRepository } from './product-catalog.repository';
import { OpenFoodFactsClient } from './open-food-facts.client';
import { CreateProductCatalogDto } from './dto/create-product-catalog.dto';
import { UpdateProductCatalogDto } from './dto/update-product-catalog.dto';
import { ProductCatalogItemModel } from '../../../generated/prisma/models';

@Injectable()
export class ProductCatalogService {
  constructor(
    private readonly repo: ProductCatalogRepository,
    private readonly offClient: OpenFoodFactsClient,
  ) {}

  async lookupByBarcode(
    userId: string,
    barcode: string,
  ): Promise<ProductCatalogItemModel | null> {
    const normalized = barcode.trim().toLowerCase();

    const internal = await this.repo.findByNormalizedBarcode(normalized);
    if (internal) return internal;

    const offData = await this.offClient.fetchByBarcode(barcode);
    if (!offData) return null;

    try {
      return await this.repo.createFromOFF(offData, userId);
    } catch {
      // Race condition: another request saved it first; return what's in the DB
      return this.repo.findByNormalizedBarcode(normalized);
    }
  }

  async create(
    userId: string,
    dto: CreateProductCatalogDto,
  ): Promise<ProductCatalogItemModel> {
    if (dto.barcode) {
      const normalized = dto.barcode.trim().toLowerCase();
      const existing = await this.repo.findByNormalizedBarcode(normalized);
      if (existing) return existing;
    }

    try {
      return await this.repo.createManual(dto, userId);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.includes('Unique constraint') &&
        dto.barcode
      ) {
        const found = await this.repo.findByNormalizedBarcode(
          dto.barcode.trim().toLowerCase(),
        );
        if (found) return found;
      }
      throw new ConflictException('Could not create product catalog item');
    }
  }

  search(query: string, limit = 20): Promise<ProductCatalogItemModel[]> {
    return this.repo.search(query, limit);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateProductCatalogDto,
  ): Promise<ProductCatalogItemModel> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Product not found in catalog');
    return this.repo.update(id, dto, userId);
  }
}
