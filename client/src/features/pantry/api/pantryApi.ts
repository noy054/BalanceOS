import { apiClient } from '../../../shared/api/client';
import { PANTRY_ENDPOINTS } from '../constants';
import {
  AddFromCatalogPayload,
  CreatePantryProductPayload,
  Page,
  PantryProduct,
  UpdatePantryProductPayload,
} from '../types';

export const pantryApi = {
  list(params: {
    search?: string;
    cursor?: string;
    limit?: number;
  }): Promise<Page<PantryProduct>> {
    return apiClient
      .get<Page<PantryProduct>>(PANTRY_ENDPOINTS.BASE, { params })
      .then((r) => r.data);
  },

  getById(id: string): Promise<PantryProduct> {
    return apiClient
      .get<PantryProduct>(PANTRY_ENDPOINTS.BY_ID(id))
      .then((r) => r.data);
  },

  create(payload: CreatePantryProductPayload): Promise<PantryProduct> {
    return apiClient
      .post<PantryProduct>(PANTRY_ENDPOINTS.BASE, payload)
      .then((r) => r.data);
  },

  addFromCatalog(
    catalogItemId: string,
    payload: AddFromCatalogPayload,
  ): Promise<PantryProduct> {
    return apiClient
      .post<PantryProduct>(PANTRY_ENDPOINTS.FROM_CATALOG(catalogItemId), payload)
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
