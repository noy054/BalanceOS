import { isAxiosError } from 'axios';

function getStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
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
