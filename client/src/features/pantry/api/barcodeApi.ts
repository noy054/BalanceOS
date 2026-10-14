import { apiClient } from '../../../shared/api/client';
import { BARCODE_ENDPOINTS } from '../constants';
import { BarcodeResolveResult } from '../types';

export const barcodeApi = {
  resolve(barcode: string): Promise<BarcodeResolveResult> {
    return apiClient
      .get<BarcodeResolveResult>(BARCODE_ENDPOINTS.RESOLVE(barcode))
      .then((r) => r.data);
  },
};
