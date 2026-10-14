import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { barcodeApi } from '../api/barcodeApi';
import { BARCODE_QUERY_KEYS, BARCODE_RESOLVE_STALE_TIME } from '../constants';
import { BarcodeResolveResult } from '../types';

/**
 * Returns an imperative resolver for scan callbacks. Results are cached per barcode,
 * so re-scanning the same product is instant; pantry mutations invalidate the cache.
 */
export function useBarcodeResolver() {
  const queryClient = useQueryClient();

  return useCallback(
    (barcode: string): Promise<BarcodeResolveResult> =>
      queryClient.fetchQuery({
        queryKey: BARCODE_QUERY_KEYS.resolve(barcode),
        queryFn: () => barcodeApi.resolve(barcode),
        staleTime: BARCODE_RESOLVE_STALE_TIME,
      }),
    [queryClient],
  );
}
