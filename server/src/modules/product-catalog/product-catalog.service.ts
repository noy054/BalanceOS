import { Injectable, NotFoundException } from '@nestjs/common';
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
import { ProductCatalogItemDto } from './types/product-catalog.types';

/** How long a barcode unknown to every provider is trusted as "not found" before re-asking them. */
const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_SEARCH_LIMIT = 20;

interface ExternalProvider {
  breaker: ExternalCircuitBreaker;
  fetch: (barcode: NormalizedBarcode) => Promise<ExternalLookupResult>;
}

@Injectable()
export class ProductCatalogService {
  private readonly providers: ExternalProvider[];
  /** Concurrent lookups for the same barcode share one external round-trip */
  private readonly inFlight = new Map<
    string,
    Promise<ProductCatalogItemDto | null>
  >();

  constructor(
    private readonly repo: ProductCatalogRepository,
    offClient: OpenFoodFactsClient,
    usdaClient: UsdaFoodDataCentralClient,
  ) {
    // Order matters: OFF covers Israeli/European products best, USDA is the US fallback
    this.providers = [
      {
        breaker: new ExternalCircuitBreaker('OpenFoodFacts'),
        fetch: (b) => offClient.fetchByBarcode(b),
      },
      {
        breaker: new ExternalCircuitBreaker('USDA-FDC'),
        fetch: (b) => usdaClient.fetchByBarcode(b),
      },
    ];
  }

  /**
   * Global catalog lookup: internal DB first (indexed unique lookup), then external providers.
   * External hits are persisted so every later scan of that barcode is served from our DB.
   */
  async lookupByBarcode(
    userId: string,
    barcode: NormalizedBarcode,
  ): Promise<ProductCatalogItemDto | null> {
    const internal = await this.repo.findByNormalizedBarcode(barcode.canonical);
    if (internal) return internal;

    const miss = await this.repo.findMiss(barcode.canonical);
    if (miss && Date.now() - miss.lastCheckedAt.getTime() < MISS_TTL_MS)
      return null;

    const pending = this.inFlight.get(barcode.canonical);
    if (pending) return pending;

    const lookup = this.lookupExternal(userId, barcode).finally(() =>
      this.inFlight.delete(barcode.canonical),
    );
    this.inFlight.set(barcode.canonical, lookup);
    return lookup;
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

  private async lookupExternal(
    userId: string,
    barcode: NormalizedBarcode,
  ): Promise<ProductCatalogItemDto | null> {
    let hadError = false;

    for (const provider of this.providers) {
      if (provider.breaker.isOpen()) {
        hadError = true;
        continue;
      }

      const result = await provider.fetch(barcode);
      if (result.status === 'error') {
        provider.breaker.recordFailure();
        hadError = true;
        continue;
      }

      provider.breaker.recordSuccess();
      if (result.status === 'found') {
        return this.saveExternal(result.data, userId);
      }
    }

    // Only cache definitive misses; a provider outage must not hide a product for a week
    if (!hadError) await this.repo.recordMiss(barcode.canonical);
    return null;
  }

  /** Saves external product data, guarding against race conditions on simultaneous first-scans across instances. */
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
