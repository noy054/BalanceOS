import { apiClient } from '../../../shared/api/client';
import { PANTRY_ENDPOINTS } from '../constants';
import {
  CreatePantryProductPayload,
  PantryProduct,
  UpdatePantryProductPayload,
} from '../types';

export const pantryApi = {
  list(): Promise<PantryProduct[]> {
    return apiClient
      .get<PantryProduct[]>(PANTRY_ENDPOINTS.BASE)
      .then((r) => r.data);
  },

  getById(id: string): Promise<PantryProduct> {
    return apiClient
      .get<PantryProduct>(PANTRY_ENDPOINTS.BY_ID(id))
      .then((r) => r.data);
  },

  getByBarcode(barcode: string): Promise<PantryProduct> {
    return apiClient
      .get<PantryProduct>(PANTRY_ENDPOINTS.BARCODE(barcode))
      .then((r) => r.data);
  },

  create(payload: CreatePantryProductPayload): Promise<PantryProduct> {
    return apiClient
      .post<PantryProduct>(PANTRY_ENDPOINTS.BASE, payload)
      .then((r) => r.data);
  },

  update(id: string, payload: UpdatePantryProductPayload): Promise<PantryProduct> {
    return apiClient
      .patch<PantryProduct>(PANTRY_ENDPOINTS.BY_ID(id), payload)
      .then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(PANTRY_ENDPOINTS.BY_ID(id)).then(() => undefined);
  },
};
