import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductCatalogRepository } from './product-catalog.repository';
import { OpenFoodFactsClient } from './open-food-facts.client';
import { UsdaFoodDataCentralClient } from './usda-food-data-central.client';
import { CreateProductCatalogDto } from './dto/create-product-catalog.dto';
import { UpdateProductCatalogDto } from './dto/update-product-catalog.dto';
import { ProductCatalogItemModel } from '../../../generated/prisma/models';

@Injectable()
export class ProductCatalogService {
  constructor(
    private readonly repo: ProductCatalogRepository,
    private readonly offClient: OpenFoodFactsClient,
    private readonly usdaClient: UsdaFoodDataCentralClient,
  ) {}

  async lookupByBarcode(
    userId: string,
    barcode: string,
  ): Promise<ProductCatalogItemModel | null> {
    const normalized = barcode.trim().toLowerCase();

    // 1. Internal DB cache — fastest path, shared across all users
    const internal = await this.repo.findByNormalizedBarcode(normalized);
    if (internal) return internal;

    // 2. Open Food Facts
    const offData = await this.offClient.fetchByBarcode(barcode);
    if (offData) {
      return this.saveExternal(offData, userId, normalized);
    }

    // 3. USDA FoodData Central fallback
    const usdaData = await this.usdaClient.fetchByBarcode(barcode);
    if (usdaData) {
      return this.saveExternal(usdaData, userId, normalized);
    }

    return null;
  }

  /** Saves external product data, guarding against race conditions on simultaneous first-scans. */
  private async saveExternal(
    data: Parameters<ProductCatalogRepository['createFromExternal']>[0],
    userId: string,
    normalizedBarcode: string,
  ): Promise<ProductCatalogItemModel | null> {
    try {
      return await this.repo.createFromExternal(data, userId);
    } catch {
      // Another request saved the same barcode concurrently; return what's now in the DB
      return this.repo.findByNormalizedBarcode(normalizedBarcode);
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
