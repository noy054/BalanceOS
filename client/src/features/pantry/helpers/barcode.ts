import { isAxiosError } from 'axios';

function getStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

const SCANNABLE_BARCODE_LENGTHS = new Set([8, 12, 13, 14]);

export function isScannableBarcode(raw: string | null | undefined): boolean {
  const digits = raw?.trim() ?? '';
  if (!/^\d+$/.test(digits) || !SCANNABLE_BARCODE_LENGTHS.has(digits.length)) {
    return false;
  }
  let sum = 0;
  for (let i = digits.length - 2, weight = 3; i >= 0; i--, weight = 4 - weight) {
    sum += Number(digits[i]) * weight;
  }
  return (10 - (sum % 10)) % 10 === Number(digits[digits.length - 1]);
}

export function getBarcodeLookupErrorKey(error: unknown): string {
  const status = getStatus(error);
  if (status === 400) return 'barcode.invalidBarcode';
  if (status === 429) return 'barcode.rateLimited';
  return 'barcode.lookupFailed';
}

export function getProductSaveErrorKey(error: unknown): string {
  return getStatus(error) === 409 ? 'barcode.alreadyInPantry' : 'errors.saveFailed';
}
