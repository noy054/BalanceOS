import { Injectable } from '@nestjs/common';
import {
  ProductSource,
  ProductVerificationStatus,
} from '../../../generated/prisma/enums';
import { NormalizedBarcode } from '../../common/barcode/barcode.utils';
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

interface OFFProduct {
  product_name?: string;
  product_name_he?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  /** 400px display-size variant provided by OFF v2 API */
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

  async fetchByBarcode(
    barcode: NormalizedBarcode,
  ): Promise<ExternalLookupResult> {
    try {
      const response = await fetch(`${this.BASE_URL}/${barcode.digits}.json`, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'BalanceOS/1.0' },
      });

      if (response.status === 404) return { status: 'not_found' };
      if (!response.ok) return { status: 'error' };

      const data = (await response.json()) as OFFResponse;
      if (data.status !== 1 || !data.product) return { status: 'not_found' };

      return { status: 'found', data: this.normalize(data.product, barcode) };
    } catch {
      return { status: 'error' };
    }
  }

  private normalize(
    product: OFFProduct,
    barcode: NormalizedBarcode,
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

    const name =
      product.product_name_he?.trim() ||
      product.product_name?.trim() ||
      barcode.digits;

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
      source: ProductSource.OPEN_FOOD_FACTS,
      verificationStatus: ProductVerificationStatus.AUTO_IMPORTED,
      externalProvider: 'open_food_facts',
      externalId:
        typeof product.code === 'string' ? product.code : barcode.digits,
      externalRawData: product as Record<string, unknown>,
    };
  }
}
