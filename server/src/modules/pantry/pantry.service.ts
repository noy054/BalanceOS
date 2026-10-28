import {
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
import { CatalogReviewService } from '../product-catalog/catalog-review.service';
import {
  pickNutritionFields,
  resolveNutrition,
} from './product-nutrition.normalizer';
import { fromCatalogRow } from '../product-catalog/catalog-data';
import { PantryItemValidator } from './pantry-item.validator';

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
    private readonly catalogReview: CatalogReviewService,
    private readonly itemValidator: PantryItemValidator,
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
    const normalized = normalizeBarcode(dto.barcode);
    if (normalized) {
      const existing = await this.repo.findByNormalizedBarcode(
        userId,
        normalized.canonical,
      );
      if (existing) throw new ConflictException(DUPLICATE_BARCODE_MESSAGE);
    }
    const nutrition = resolveNutrition(null, dto);
    try {
      const created = await this.repo.create(
        userId,
        { ...dto, ...nutrition },
        normalized?.canonical ?? null,
      );
      await this.catalogReview.recordProductChange(created);
      return created;
    } catch (err: unknown) {
      if (isUniqueViolation(err))
        throw new ConflictException(DUPLICATE_BARCODE_MESSAGE);
      throw err;
    }
  }

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
    if (existing) {
      const hasOverrides = Object.values(dto).some((v) => v !== undefined);
      return hasOverrides ? this.update(userId, existing.id, dto) : existing;
    }

    const catalogData = fromCatalogRow(item);
    const nutrition = resolveNutrition(pickNutritionFields(catalogData), dto);
    const keepsPer100g = nutrition.caloriesPer100g !== null;

    try {
      const created = await this.repo.createFromCatalog({
        userId,
        catalogItemId: item.id,
        name: dto.name?.trim() || item.name,
        brand: dto.brand !== undefined ? dto.brand?.trim() || null : item.brand,
        barcode: item.barcode,
        normalizedBarcode: item.normalizedBarcode,
        imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : item.imageUrl,
        ...nutrition,
        nutrients:
          keepsPer100g && catalogData.nutrients
            ? catalogData.nutrients
            : undefined,
        mealCategories: dto.mealCategories ?? [],
      });
      await this.catalogReview.recordProductChange(created);
      return created;
    } catch (err: unknown) {
      if (isUniqueViolation(err)) {
        const recovered =
          (await this.repo.findByCatalogItemId(userId, item.id)) ??
          (item.normalizedBarcode
            ? await this.repo.findByNormalizedBarcode(
                userId,
                item.normalizedBarcode,
              )
            : null);
        if (recovered) return recovered;
      }
      throw err;
    }
  }

  async update(
    userId: string,
    id: string,
    dto: UpdatePantryProductDto,
  ): Promise<PantryProductModel> {
    const existing = await this.getById(userId, id);
    let normalizedBarcodeUpdate: string | null | undefined = undefined;
    if (dto.barcode !== undefined) {
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
      normalizedBarcodeUpdate = normalized?.canonical ?? null;
    }
    const nutrition = resolveNutrition(pickNutritionFields(existing), dto);
    await this.itemValidator.validateNutritionChange(id, nutrition);
    try {
      const updated = await this.repo.update(
        id,
        {
          ...dto,
          ...nutrition,
          ...(nutrition.caloriesPer100g === null
            ? { nutrients: Prisma.DbNull }
            : {}),
        },
        normalizedBarcodeUpdate,
      );
      await this.catalogReview.recordProductChange(updated);
      return updated;
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
