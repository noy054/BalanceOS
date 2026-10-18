import {
  ProductSource,
  ProductVerificationStatus,
} from '../../../../generated/prisma/enums';

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
