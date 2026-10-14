import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PantryRepository } from './pantry.repository';
import { CreatePantryProductDto } from './dto/create-pantry-product.dto';
import { UpdatePantryProductDto } from './dto/update-pantry-product.dto';
import { ListPantryProductsDto } from './dto/list-pantry-products.dto';
import { AddFromCatalogDto } from './dto/add-from-catalog.dto';
import { PantryProductModel } from '../../../generated/prisma/models';
import { Prisma } from '../../../generated/prisma/client';
import {
  NormalizedBarcode,
  normalizeBarcode,
} from '../../common/barcode/barcode.utils';
import {
  DEFAULT_PAGE_SIZE,
  Page,
  toPage,
} from '../../common/pagination/page.types';
import { ProductCatalogService } from '../product-catalog/product-catalog.service';

const DUPLICATE_BARCODE_MESSAGE =
  'A product with this barcode already exists in your pantry';

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
  );
}

@Injectable()
export class PantryService {
  constructor(
    private readonly repo: PantryRepository,
    private readonly catalogService: ProductCatalogService,
  ) {}

  async list(
    userId: string,
    dto: ListPantryProductsDto,
  ): Promise<Page<PantryProductModel>> {
    const limit = dto.limit ?? DEFAULT_PAGE_SIZE;
    const search = dto.search?.trim() || undefined;
    const rows = await this.repo.findPageByUserId(
      userId,
      limit + 1,
      search,
      dto.cursor,
    );
    return toPage(rows, limit);
  }

  async getById(userId: string, id: string): Promise<PantryProductModel> {
    const product = await this.repo.findByIdAndUserId(id, userId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /** Indexed (userId, normalizedBarcode) lookup; null when the user has no such product. */
  findByBarcode(
    userId: string,
    barcode: NormalizedBarcode,
  ): Promise<PantryProductModel | null> {
    return this.repo.findByNormalizedBarcode(userId, barcode.canonical);
  }

  async getByBarcode(
    userId: string,
    barcode: NormalizedBarcode,
  ): Promise<PantryProductModel> {
    const product = await this.findByBarcode(userId, barcode);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(
    userId: string,
    dto: CreatePantryProductDto,
  ): Promise<PantryProductModel> {
    // DTO validation guarantees a valid GTIN when a barcode is present
    const normalized = normalizeBarcode(dto.barcode);
    if (normalized) {
      const existing = await this.repo.findByNormalizedBarcode(
        userId,
        normalized.canonical,
      );
      if (existing) throw new ConflictException(DUPLICATE_BARCODE_MESSAGE);
    }
    try {
      return await this.repo.create(userId, dto, normalized?.canonical ?? null);
    } catch (err: unknown) {
      if (isUniqueViolation(err))
        throw new ConflictException(DUPLICATE_BARCODE_MESSAGE);
      throw err;
    }
  }

  /**
   * Copies a global catalog item into the user's pantry (snapshot of values + provenance link).
   * Idempotent: if the user already has this product, the existing pantry product is returned.
   */
  async addFromCatalog(
    userId: string,
    catalogItemId: string,
    dto: AddFromCatalogDto,
  ): Promise<PantryProductModel> {
    const item = await this.catalogService.getById(catalogItemId);

    const existing =
      (await this.repo.findByCatalogItemId(userId, item.id)) ??
      (item.normalizedBarcode
        ? await this.repo.findByNormalizedBarcode(
            userId,
            item.normalizedBarcode,
          )
        : null);
    if (existing) return existing;

    const caloriesPer100g = dto.caloriesPer100g ?? item.caloriesPer100g;
    const proteinPer100g = dto.proteinPer100g ?? item.proteinPer100g;
    const carbsPer100g = dto.carbsPer100g ?? item.carbsPer100g;
    const fatPer100g = dto.fatPer100g ?? item.fatPer100g;

    // Never invent zeros: missing values must be supplied by the user
    if (
      caloriesPer100g == null ||
      proteinPer100g == null ||
      carbsPer100g == null ||
      fatPer100g == null
    ) {
      throw new BadRequestException(
        'This product is missing nutrition values. Provide calories, protein, carbs and fat per 100g.',
      );
    }

    try {
      return await this.repo.createFromCatalog({
        userId,
        catalogItemId: item.id,
        name: item.name,
        brand: item.brand,
        barcode: item.barcode,
        normalizedBarcode: item.normalizedBarcode,
        imageUrl: item.imageUrl,
        caloriesPer100g,
        proteinPer100g,
        carbsPer100g,
        fatPer100g,
        fiberPer100g: dto.fiberPer100g ?? item.fiberPer100g,
        servingSizeG: dto.servingSizeG ?? item.servingSizeGrams,
        servingSizeText: dto.servingSizeText ?? item.servingSizeText,
        mealCategories: dto.mealCategories ?? [],
      });
    } catch (err: unknown) {
      // Concurrent double-tap: the other request already created it
      if (isUniqueViolation(err) && item.normalizedBarcode) {
        const created = await this.repo.findByNormalizedBarcode(
          userId,
          item.normalizedBarcode,
        );
        if (created) return created;
      }
      throw err;
    }
  }

  async update(
    userId: string,
    id: string,
    dto: UpdatePantryProductDto,
  ): Promise<PantryProductModel> {
    await this.getById(userId, id);
    const normalized = normalizeBarcode(dto.barcode);
    if (normalized) {
      const existing = await this.repo.findByNormalizedBarcode(
        userId,
        normalized.canonical,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(DUPLICATE_BARCODE_MESSAGE);
      }
    }
    try {
      return await this.repo.update(id, dto, normalized?.canonical);
    } catch (err: unknown) {
      if (isUniqueViolation(err))
        throw new ConflictException(DUPLICATE_BARCODE_MESSAGE);
      throw err;
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    await this.repo.delete(id);
  }
}
