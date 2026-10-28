import {
  ProductSource,
  ProductVerificationStatus,
} from '../../../../generated/prisma/enums';

export type NutrientMap = Record<string, number>;

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
  sugarPer100g?: number | null;
  saturatedFatPer100g?: number | null;
  sodiumPer100g?: number | null;
  saltPer100g?: number | null;
  nutrients?: NutrientMap | null;
  servingSizeGrams?: number | null;
  servingSizeText?: string | null;
  source: ProductSource;
  verificationStatus: ProductVerificationStatus;
  externalProvider: string;
  externalId: string | null;
  externalRawData: Record<string, unknown>;
}

export type ExternalLookupResult =
  | { status: 'found'; data: NormalizedProductData }
  | { status: 'not_found' }
  | { status: 'error' };
