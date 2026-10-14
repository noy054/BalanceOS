/**
 * Barcode normalization shared by every module that stores or looks up barcodes.
 *
 * Canonical form is a 13-digit GTIN:
 * - EAN-8  (8)  → left-padded with zeros
 * - UPC-A  (12) → left-padded with one zero (iOS already reports UPC-A this way)
 * - EAN-13 (13) → unchanged
 * - GTIN-14 (14) with a leading 0 → leading zero dropped; other GTIN-14 kept as-is
 *
 * This guarantees the same product always maps to the same key, regardless of
 * which scanner/format produced it.
 */

const SUPPORTED_LENGTHS = new Set([8, 12, 13, 14]);

export interface NormalizedBarcode {
  /** Canonical key used for storage, uniqueness and lookups */
  canonical: string;
  /** Digits exactly as scanned (used when querying external providers) */
  digits: string;
}

export function isValidGtinCheckDigit(digits: string): boolean {
  // GS1 mod-10: weights alternate 3,1,3,1… from the rightmost data digit
  let sum = 0;
  for (
    let i = digits.length - 2, weight = 3;
    i >= 0;
    i--, weight = 4 - weight
  ) {
    sum += Number(digits[i]) * weight;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[digits.length - 1]);
}

/** Returns null when the input is not a valid GTIN (wrong length, non-digits or bad check digit). */
export function normalizeBarcode(
  raw: string | null | undefined,
): NormalizedBarcode | null {
  if (raw == null) return null;
  const digits = raw.trim();
  if (!/^\d+$/.test(digits) || !SUPPORTED_LENGTHS.has(digits.length))
    return null;
  if (!isValidGtinCheckDigit(digits)) return null;

  let canonical: string;
  if (digits.length === 14) {
    canonical = digits.startsWith('0') ? digits.slice(1) : digits;
  } else {
    canonical = digits.padStart(13, '0');
  }
  return { canonical, digits };
}
