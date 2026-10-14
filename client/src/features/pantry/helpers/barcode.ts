import { isAxiosError } from 'axios';

/** Maps a barcode lookup failure to a pantry translation key. */
export function getBarcodeLookupErrorKey(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 400) return 'barcode.invalidBarcode';
    if (error.response?.status === 429) return 'barcode.rateLimited';
  }
  return 'barcode.lookupFailed';
}
