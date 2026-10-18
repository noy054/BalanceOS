import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ProductSource,
  ProductVerificationStatus,
} from '../../../generated/prisma/enums';
import { NormalizedBarcode } from '../../common/barcode/barcode.utils';
import {
  ExternalLookupResult,
  NormalizedProductData,
} from './types/external-product.types';

// Nutrient IDs from the USDA FDC branded-food dataset (values are per 100g)
const NUTRIENT_CALORIES = 1008; // Energy (kcal)
const NUTRIENT_PROTEIN = 1003; // Protein
const NUTRIENT_CARBS = 1005; // Carbohydrate, by difference
const NUTRIENT_FAT = 1004; // Total lipid (fat)
const NUTRIENT_FIBER = 1079; // Fiber, total dietary

interface FDCFoodNutrient {
  nutrientId: number;
  unitName?: string;
  value?: number;
}

interface FDCFood {
  fdcId: number;
  description?: string;
  brandOwner?: string;
  brandName?: string;
  /** GTIN/UPC barcode stored in FDC */
  gtinUpc?: string;
  /** Numeric serving size (unit in servingSizeUnit) */
  servingSize?: number;
  servingSizeUnit?: string;
  /** Human-readable serving, e.g. "1 cup" */
  householdServingFullText?: string;
  foodNutrients: FDCFoodNutrient[];
}

interface FDCSearchResponse {
  foods?: FDCFood[];
}

/**
 * USDA FoodData Central barcode client.
 * Coverage is strongest for US-branded products; OFF handles European/Israeli products better and runs first.
 */
@Injectable()
export class UsdaFoodDataCentralClient {
  private readonly BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('USDA_API_KEY'));
  }

  async fetchByBarcode(
    barcode: NormalizedBarcode,
  ): Promise<ExternalLookupResult> {
    const apiKey = this.config.get<string>('USDA_API_KEY');
    if (!apiKey) return { status: 'error' };

    try {
      const url =
        `${this.BASE_URL}/foods/search` +
        `?query=${encodeURIComponent(barcode.digits)}` +
        `&dataType=Branded` +
        `&pageSize=5` +
        `&api_key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'BalanceOS/1.0' },
      });

      if (!response.ok) return { status: 'error' };

      const data = (await response.json()) as FDCSearchResponse;
      if (!data.foods?.length) return { status: 'not_found' };

      const food = this.findBestMatch(data.foods, barcode.digits);
      if (!food) return { status: 'not_found' };

      return { status: 'found', data: this.normalize(food, barcode) };
    } catch {
      return { status: 'error' };
    }
  }

  /**
   * Finds the food whose gtinUpc matches the scanned barcode.
   * UPC-A (12 digits) and EAN-13 (13 digits, UPC with leading zero) are treated as equivalent.
   */
  private findBestMatch(foods: FDCFood[], barcode: string): FDCFood | null {
    const stripped = barcode.trim().replace(/^0+/, '');

    const match = foods.find((f) => {
      if (!f.gtinUpc) return false;
      const gtin = f.gtinUpc.trim();
      return gtin === barcode.trim() || gtin.replace(/^0+/, '') === stripped;
    });

    return match ?? null;
  }

  private normalize(
    food: FDCFood,
    barcode: NormalizedBarcode,
  ): NormalizedProductData {
    const findNutrient = (id: number): number | null => {
      const n = food.foodNutrients.find((fn) => fn.nutrientId === id);
      return n?.value != null ? n.value : null;
    };

    const name = food.description?.trim() || barcode.digits;
    const brand = food.brandOwner?.trim() || food.brandName?.trim() || null;

    let servingSizeGrams: number | null = null;
    if (
      food.servingSize != null &&
      food.servingSizeUnit?.toLowerCase() === 'g'
    ) {
      servingSizeGrams = food.servingSize;
    }

    const servingSizeText = food.householdServingFullText?.trim() || null;

    return {
      barcode: barcode.digits,
      normalizedBarcode: barcode.canonical,
      name,
      brand,
      imageUrl: null, // USDA FDC does not provide product images
      caloriesPer100g: findNutrient(NUTRIENT_CALORIES),
      proteinPer100g: findNutrient(NUTRIENT_PROTEIN),
      carbsPer100g: findNutrient(NUTRIENT_CARBS),
      fatPer100g: findNutrient(NUTRIENT_FAT),
      fiberPer100g: findNutrient(NUTRIENT_FIBER),
      servingSizeGrams,
      servingSizeText,
      source: ProductSource.USDA_FDC,
      verificationStatus: ProductVerificationStatus.AUTO_IMPORTED,
      externalProvider: 'usda_fdc',
      externalId: String(food.fdcId),
      externalRawData: food as unknown as Record<string, unknown>,
    };
  }
}
