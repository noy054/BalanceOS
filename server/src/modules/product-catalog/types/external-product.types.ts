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
  /** Grams per serving when the external source provides it */
  servingSizeGrams?: number | null;
  /** Human-readable serving description (e.g. "1 cup") */
  servingSizeText?: string | null;
  source: ProductSource;
  verificationStatus: ProductVerificationStatus;
  externalProvider: string;
  externalId: string | null;
  externalRawData: Record<string, unknown>;
}

/**
 * Distinguishes a definitive "provider does not know this barcode" from a transient failure,
 * so only real misses are negatively cached and only failures trip the circuit breaker.
 */
export type ExternalLookupResult =
  | { status: 'found'; data: NormalizedProductData }
  | { status: 'not_found' }
  | { status: 'error' };
