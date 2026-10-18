import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { barcodeApi } from '../api/barcodeApi';
import { BARCODE_QUERY_KEYS, BARCODE_RESOLVE_STALE_TIME } from '../constants';
import { BarcodeResolveResult } from '../types';

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
