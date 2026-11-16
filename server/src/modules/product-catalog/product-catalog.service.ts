import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { NormalizedBarcode } from '../../common/barcode/barcode.utils';
import { Page, toPage } from '../../common/pagination/page.types';
import { ProductCatalogRepository } from './product-catalog.repository';
import { OpenFoodFactsClient } from './open-food-facts.client';
import { UsdaFoodDataCentralClient } from './usda-food-data-central.client';
import { ExternalCircuitBreaker } from './external-circuit-breaker';
import {
  ExternalLookupResult,
  NormalizedProductData,
} from './types/external-product.types';
import {
  CatalogBrowseItemDto,
  CatalogDepartmentCountDto,
  CatalogSubcategoryCountDto,
  ProductCatalogItemDetailDto,
  ProductCatalogItemDto,
} from './types/product-catalog.types';
import { CATALOG_DEPARTMENTS, CatalogDepartment } from './catalog-departments';
import { findSubcategory, subcategoriesFor } from './catalog-subcategories';
import {
  LookupContext,
  lookupContext,
} from '../../common/market/lookup-context';

const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_SEARCH_LIMIT = 20;

interface ExternalProvider {
  breaker: ExternalCircuitBreaker;
  isEnabled: () => boolean;
  preferredMarkets: readonly string[];
  fetch: (
    barcode: NormalizedBarcode,
    context: LookupContext,
  ) => Promise<ExternalLookupResult>;
}

@Injectable()
export class ProductCatalogService {
  private readonly providers: ExternalProvider[];
  private readonly inFlight = new Map<
    string,
    Promise<ProductCatalogItemDto | null>
  >();

  constructor(
    private readonly repo: ProductCatalogRepository,
    offClient: OpenFoodFactsClient,
    usdaClient: UsdaFoodDataCentralClient,
  ) {
    this.providers = [
      {
        breaker: new ExternalCircuitBreaker('OpenFoodFacts'),
        isEnabled: () => true,
        preferredMarkets: [],
        fetch: (b, context) => offClient.fetchByBarcode(b, context),
      },
      {
        breaker: new ExternalCircuitBreaker('USDA-FDC'),
        isEnabled: () => usdaClient.isConfigured(),
        preferredMarkets: ['US'],
        fetch: (b) => usdaClient.fetchByBarcode(b),
      },
    ];
  }

  async lookupContextFor(userId: string): Promise<LookupContext> {
    const settings = await this.repo.findLookupSettings(userId);
    return lookupContext(
      settings?.marketCode,
      settings?.preferredLanguage ?? null,
    );
  }

  findMarketReference(barcode: NormalizedBarcode, context: LookupContext) {
    return this.repo.findMarketReference(
      barcode.canonical,
      context.market.code,
    );
  }

  async lookupByBarcode(
    userId: string,
    barcode: NormalizedBarcode,
    context: LookupContext = lookupContext(),
  ): Promise<ProductCatalogItemDto | null> {
    const internal = await this.repo.findByNormalizedBarcode(barcode.canonical);
    if (internal) return internal;
    if (await this.repo.isArchivedBarcode(barcode.canonical)) return null;

    const miss = await this.repo.findMiss(barcode.canonical);
    if (miss && Date.now() - miss.lastCheckedAt.getTime() < MISS_TTL_MS)
      return null;

    const pending = this.inFlight.get(barcode.canonical);
    if (pending) return pending;

    const lookup = this.lookupExternal(userId, barcode, context).finally(() =>
      this.inFlight.delete(barcode.canonical),
    );
    this.inFlight.set(barcode.canonical, lookup);
    return lookup;
  }

  async getDetail(
    userId: string,
    id: string,
  ): Promise<ProductCatalogItemDetailDto> {
    const item = await this.repo.findDetailById(id);
    if (!item) throw new NotFoundException('Product not found in catalog');
    const [match] = await this.repo.findPantryMatches(
      userId,
      [item.id],
      item.normalizedBarcode ? [item.normalizedBarcode] : [],
    );
    return { ...item, pantryProductId: match?.id ?? null };
  }

  async getById(id: string): Promise<ProductCatalogItemDto> {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Product not found in catalog');
    return item;
  }

  async search(
    query: string,
    limit = DEFAULT_SEARCH_LIMIT,
    cursor?: string,
  ): Promise<Page<ProductCatalogItemDto>> {
    const rows = await this.repo.search(query.trim(), limit + 1, cursor);
    return toPage(rows, limit);
  }

  async departments(): Promise<CatalogDepartmentCountDto[]> {
    const counts = await this.repo.countByDepartment();
    return CATALOG_DEPARTMENTS.map((department) => ({
      department,
      count: counts.get(department) ?? 0,
    })).filter((entry) => entry.count > 0);
  }

  async subcategories(
    department: CatalogDepartment,
  ): Promise<CatalogSubcategoryCountDto[]> {
    const entries = subcategoriesFor(department);
    const counts = await this.repo.countBySubcategory(department);
    return entries
      .map((entry) => ({ key: entry.key, count: counts.get(entry.key) ?? 0 }))
      .filter((entry) => entry.count > 0);
  }

  async browse(
    userId: string,
    params: {
      department?: CatalogDepartment;
      subcategory?: string;
      q?: string;
      limit?: number;
      cursor?: string;
    },
  ): Promise<Page<CatalogBrowseItemDto>> {
    const limit = params.limit ?? DEFAULT_SEARCH_LIMIT;
    const subcategory = params.subcategory
      ? params.department
        ? findSubcategory(params.department, params.subcategory)
        : null
      : undefined;
    if (subcategory === null) {
      throw new BadRequestException('Unknown subcategory');
    }
    const rows = await this.repo.browse({
      department: params.department,
      query: params.q?.trim() || undefined,
      ...(subcategory ? { subcategory: subcategory.key } : {}),
      take: limit + 1,
      cursor: params.cursor,
    });
    const page = toPage(rows, limit);
    const matches = await this.repo.findPantryMatches(
      userId,
      page.items.map((item) => item.id),
      page.items
        .map((item) => item.normalizedBarcode)
        .filter((code): code is string => Boolean(code)),
    );
    return {
      nextCursor: page.nextCursor,
      items: page.items.map((item) => {
        const match = matches.find(
          (product) =>
            product.catalogItemId === item.id ||
            (item.normalizedBarcode !== null &&
              product.normalizedBarcode === item.normalizedBarcode),
        );
        return { ...item, pantryProductId: match?.id ?? null };
      }),
    };
  }

  private providersFor(context: LookupContext): ExternalProvider[] {
    const preferred = (provider: ExternalProvider) =>
      provider.preferredMarkets.includes(context.market.code) ? 0 : 1;
    return [...this.providers].sort((a, b) => preferred(a) - preferred(b));
  }

  private async lookupExternal(
    userId: string,
    barcode: NormalizedBarcode,
    context: LookupContext,
  ): Promise<ProductCatalogItemDto | null> {
    let hadError = false;

    for (const provider of this.providersFor(context)) {
      if (!provider.isEnabled()) continue;
      if (provider.breaker.isOpen()) {
        hadError = true;
        continue;
      }

      const result = await provider.fetch(barcode, context);
      if (result.status === 'error') {
        provider.breaker.recordFailure();
        hadError = true;
        continue;
      }

      provider.breaker.recordSuccess();
      if (result.status === 'found') {
        const data = await this.withReferenceName(result.data, context);
        if (!data) continue;
        return this.saveExternal(data, userId);
      }
    }

    if (!hadError) await this.repo.recordMiss(barcode.canonical);
    return null;
  }

  private async withReferenceName(
    data: NormalizedProductData,
    context: LookupContext,
  ): Promise<NormalizedProductData | null> {
    if (!data.nameMissing) return data;
    const reference = await this.repo.findMarketReference(
      data.normalizedBarcode,
      context.market.code,
    );
    if (reference) {
      return {
        ...data,
        name: reference.name,
        brand: data.brand ?? reference.brand,
        nameMissing: false,
      };
    }
    const hasNutrition =
      data.caloriesPer100g !== null ||
      Boolean(data.nutrients && 'energy' in data.nutrients);
    return hasNutrition ? data : null;
  }

  private async saveExternal(
    data: NormalizedProductData,
    userId: string,
  ): Promise<ProductCatalogItemDto | null> {
    try {
      const created = await this.repo.createFromExternal(data, userId);
      await this.repo.clearMiss(data.normalizedBarcode);
      return created;
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return this.repo.findByNormalizedBarcode(data.normalizedBarcode);
      }
      throw err;
    }
  }
}
