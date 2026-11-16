import { Injectable } from '@nestjs/common';
import {
  ProductSource,
  ProductVerificationStatus,
} from '../../../generated/prisma/enums';
import {
  gtinVariants,
  NormalizedBarcode,
} from '../../common/barcode/barcode.utils';
import {
  LookupContext,
  lookupContext,
  nameLanguages,
} from '../../common/market/lookup-context';
import { marketForCountryTag } from '../../common/market/markets';
import {
  ExternalLookupResult,
  NormalizedProductData,
  NutrientMap,
} from './types/external-product.types';

type OFFNutriments = Record<string, unknown>;

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractPer100g(nutriments: OFFNutriments): NutrientMap {
  const result: NutrientMap = {};
  for (const [key, value] of Object.entries(nutriments)) {
    if (!key.endsWith('_100g')) continue;
    const parsed = toNumber(value);
    if (parsed !== null) result[key.slice(0, -'_100g'.length)] = parsed;
  }
  return result;
}

const REQUESTS_PER_MINUTE = 80;

interface OFFProduct {
  product_name?: string;
  lang?: string;
  countries_tags?: string[];
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  image_front_display_url?: string;
  nutriments?: OFFNutriments;
  serving_size?: string;
  serving_quantity?: number | string;
  serving_quantity_unit?: string;
  code?: string;
  [key: string]: unknown;
}

interface OFFResponse {
  status: number;
  product?: OFFProduct;
}

@Injectable()
export class OpenFoodFactsClient {
  private readonly BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';
  private recentRequests: number[] = [];

  async fetchByBarcode(
    barcode: NormalizedBarcode,
    context: LookupContext = lookupContext(),
  ): Promise<ExternalLookupResult> {
    for (const code of gtinVariants(barcode)) {
      const result = await this.fetchCode(code);
      if (result === 'not_found') continue;
      if (result === 'error') return { status: 'error' };
      return {
        status: 'found',
        data: this.normalize(result, barcode, context),
      };
    }
    return { status: 'not_found' };
  }

  private takeRequestSlot(): boolean {
    const now = Date.now();
    this.recentRequests = this.recentRequests.filter(
      (time) => now - time < 60_000,
    );
    if (this.recentRequests.length >= REQUESTS_PER_MINUTE) return false;
    this.recentRequests.push(now);
    return true;
  }

  private async fetchCode(
    code: string,
  ): Promise<OFFProduct | 'not_found' | 'error'> {
    if (!this.takeRequestSlot()) return 'error';
    try {
      const response = await fetch(`${this.BASE_URL}/${code}.json`, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'TrackMode/1.0' },
      });
      if (response.status === 404) return 'not_found';
      if (!response.ok) return 'error';
      const data = (await response.json()) as OFFResponse;
      if (data.status !== 1 || !data.product) return 'not_found';
      return data.product;
    } catch {
      return 'error';
    }
  }

  private localizedName(
    product: OFFProduct,
    context: LookupContext,
  ): { name: string; language: string | null } | null {
    for (const language of nameLanguages(context)) {
      const value = product[`product_name_${language}`];
      if (typeof value === 'string' && value.trim()) {
        return { name: value.trim(), language };
      }
    }
    const fallback = product.product_name?.trim();
    return fallback ? { name: fallback, language: product.lang ?? null } : null;
  }

  private countryCode(product: OFFProduct, context: LookupContext) {
    const tags = product.countries_tags ?? [];
    if (tags.includes(context.market.offCountryTag)) return context.market.code;
    for (const tag of tags) {
      const market = marketForCountryTag(tag);
      if (market) return market.code;
    }
    return null;
  }

  private normalize(
    product: OFFProduct,
    barcode: NormalizedBarcode,
    context: LookupContext,
  ): NormalizedProductData {
    const nutrients = extractPer100g(product.nutriments ?? {});
    const value = (key: string): number | null => nutrients[key] ?? null;
    const servingQuantity = toNumber(product.serving_quantity);
    const servingUnit = product.serving_quantity_unit?.trim().toLowerCase();
    const servingSizeGrams =
      servingQuantity !== null &&
      servingQuantity > 0 &&
      (!servingUnit || servingUnit === 'g')
        ? servingQuantity
        : null;

    const localized = this.localizedName(product, context);
    const name = localized?.name ?? barcode.digits;

    const brand = product.brands
      ? product.brands.split(',')[0].trim() || null
      : null;

    const imageUrl =
      product.image_front_display_url ||
      product.image_front_url ||
      product.image_url ||
      null;

    return {
      barcode: barcode.digits,
      normalizedBarcode: barcode.canonical,
      name,
      nameMissing: localized === null,
      brand,
      imageUrl,
      caloriesPer100g: value('energy-kcal'),
      proteinPer100g: value('proteins'),
      carbsPer100g: value('carbohydrates'),
      fatPer100g: value('fat'),
      fiberPer100g: value('fiber'),
      sugarPer100g: value('sugars'),
      saturatedFatPer100g: value('saturated-fat'),
      sodiumPer100g: value('sodium'),
      saltPer100g: value('salt'),
      nutrients: Object.keys(nutrients).length > 0 ? nutrients : null,
      servingSizeGrams,
      servingSizeText: product.serving_size?.trim() || null,
      countryCode: this.countryCode(product, context),
      languageCode: localized?.language ?? null,
      source: ProductSource.OPEN_FOOD_FACTS,
      verificationStatus: ProductVerificationStatus.AUTO_IMPORTED,
      externalProvider: 'open_food_facts',
      externalId:
        typeof product.code === 'string' ? product.code : barcode.digits,
      externalRawData: product as Record<string, unknown>,
    };
  }
}
