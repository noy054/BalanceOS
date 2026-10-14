import { Injectable } from '@nestjs/common';
import {
  ProductSource,
  ProductVerificationStatus,
} from '../../../generated/prisma/enums';
import { NormalizedBarcode } from '../../common/barcode/barcode.utils';
import {
  ExternalLookupResult,
  NormalizedProductData,
} from './types/external-product.types';

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
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
      // Only digits reach this point (validated by normalizeBarcode), so the URL cannot be manipulated
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
    const n = product.nutriments ?? {};
    const nullableNum = (v: number | undefined): number | null =>
      v != null ? v : null;

    const name =
      product.product_name_he?.trim() ||
      product.product_name?.trim() ||
      barcode.digits;

    const brand = product.brands
      ? product.brands.split(',')[0].trim() || null
      : null;

    // Prefer the 400px display variant to avoid fetching multi-MB full images.
    // Fall back to image_front_url then image_url if the display variant is absent.
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
      caloriesPer100g: nullableNum(n['energy-kcal_100g']),
      proteinPer100g: nullableNum(n.proteins_100g),
      carbsPer100g: nullableNum(n.carbohydrates_100g),
      fatPer100g: nullableNum(n.fat_100g),
      fiberPer100g: nullableNum(n.fiber_100g),
      source: ProductSource.OPEN_FOOD_FACTS,
      verificationStatus: ProductVerificationStatus.AUTO_IMPORTED,
      externalProvider: 'open_food_facts',
      externalId:
        typeof product.code === 'string' ? product.code : barcode.digits,
      externalRawData: product as Record<string, unknown>,
    };
  }
}
