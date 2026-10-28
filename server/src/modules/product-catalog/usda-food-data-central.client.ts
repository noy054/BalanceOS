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
  NutrientMap,
} from './types/external-product.types';

const NUTRIENT_CALORIES = 1008;
const NUTRIENT_PROTEIN = 1003;
const NUTRIENT_CARBS = 1005;
const NUTRIENT_FAT = 1004;
const NUTRIENT_FIBER = 1079;
const NUTRIENT_SUGARS = 2000;
const NUTRIENT_SATURATED_FAT = 1258;
const NUTRIENT_SODIUM = 1093;

const MASS_TO_GRAMS: Record<string, number> = { G: 1, MG: 0.001, UG: 0.000001 };

interface FDCFoodNutrient {
  nutrientId: number;
  nutrientName?: string;
  unitName?: string;
  value?: number;
}

function nutrientKey(name: string, unit: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (unit === 'KCAL') return 'energy-kcal';
  if (unit === 'KJ') return 'energy-kj';
  if (MASS_TO_GRAMS[unit] !== undefined) return slug;
  return `${slug}-${unit.toLowerCase()}`;
}

function nutrientValue(nutrient: FDCFoodNutrient): number | null {
  if (nutrient.value == null || !Number.isFinite(nutrient.value)) return null;
  const unit = nutrient.unitName?.toUpperCase() ?? '';
  const factor = MASS_TO_GRAMS[unit];
  return factor !== undefined ? nutrient.value * factor : nutrient.value;
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
      return n ? nutrientValue(n) : null;
    };

    const nutrients: NutrientMap = {};
    for (const nutrient of food.foodNutrients) {
      const value = nutrientValue(nutrient);
      if (value === null || !nutrient.nutrientName) continue;
      const key = nutrientKey(
        nutrient.nutrientName,
        nutrient.unitName?.toUpperCase() ?? '',
      );
      if (key && nutrients[key] === undefined) nutrients[key] = value;
    }

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
      imageUrl: null,
      caloriesPer100g: findNutrient(NUTRIENT_CALORIES),
      proteinPer100g: findNutrient(NUTRIENT_PROTEIN),
      carbsPer100g: findNutrient(NUTRIENT_CARBS),
      fatPer100g: findNutrient(NUTRIENT_FAT),
      fiberPer100g: findNutrient(NUTRIENT_FIBER),
      sugarPer100g: findNutrient(NUTRIENT_SUGARS),
      saturatedFatPer100g: findNutrient(NUTRIENT_SATURATED_FAT),
      sodiumPer100g: findNutrient(NUTRIENT_SODIUM),
      saltPer100g: null,
      nutrients: Object.keys(nutrients).length > 0 ? nutrients : null,
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
