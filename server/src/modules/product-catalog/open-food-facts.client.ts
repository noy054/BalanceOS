import { Injectable } from '@nestjs/common';
import { ProductSource, ProductVerificationStatus } from '../../../generated/prisma/enums';

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
  nutriments?: OFFNutriments;
  [key: string]: unknown;
}

interface OFFResponse {
  status: number;
  product?: OFFProduct;
}

export interface NormalizedProductData {
  barcode: string;
  normalizedBarcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  source: ProductSource;
  verificationStatus: ProductVerificationStatus;
  externalProvider: string;
  externalRawData: Record<string, unknown>;
}

@Injectable()
export class OpenFoodFactsClient {
  private readonly BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

  async fetchByBarcode(barcode: string): Promise<NormalizedProductData | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/${barcode}.json`, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'BalanceOS/1.0' },
      });

      if (!response.ok) return null;

      const data = (await response.json()) as OFFResponse;
      if (data.status !== 1 || !data.product) return null;

      return this.normalize(data.product, barcode);
    } catch {
      return null;
    }
  }

  private normalize(product: OFFProduct, barcode: string): NormalizedProductData {
    const n = product.nutriments ?? {};
    const nullableNum = (v: number | undefined): number | null =>
      v != null ? v : null;

    const name =
      product.product_name_he?.trim() ||
      product.product_name?.trim() ||
      barcode;

    const brand = product.brands
      ? product.brands.split(',')[0].trim() || null
      : null;

    const imageUrl =
      product.image_front_url || product.image_url || null;

    return {
      barcode,
      normalizedBarcode: barcode.trim().toLowerCase(),
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
      externalRawData: product as Record<string, unknown>,
    };
  }
}
