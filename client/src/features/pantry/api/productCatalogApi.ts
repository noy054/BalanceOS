import { apiClient } from '../../../shared/api/client';
import { PRODUCT_CATALOG_ENDPOINTS } from '../constants';
import {
  CreateProductCatalogPayload,
  ProductCatalogProduct,
  UpdateProductCatalogPayload,
} from '../types';

export const productCatalogApi = {
  lookupByBarcode(barcode: string): Promise<ProductCatalogProduct | null> {
    return apiClient
      .get<ProductCatalogProduct>(PRODUCT_CATALOG_ENDPOINTS.BARCODE(barcode))
      .then((r) => r.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      });
  },

  search(q: string, limit = 20): Promise<ProductCatalogProduct[]> {
    return apiClient
      .get<ProductCatalogProduct[]>(PRODUCT_CATALOG_ENDPOINTS.SEARCH, {
        params: { q, limit },
      })
      .then((r) => r.data);
  },

  create(payload: CreateProductCatalogPayload): Promise<ProductCatalogProduct> {
    return apiClient
      .post<ProductCatalogProduct>(PRODUCT_CATALOG_ENDPOINTS.CREATE, payload)
      .then((r) => r.data);
  },

  update(
    id: string,
    payload: UpdateProductCatalogPayload,
  ): Promise<ProductCatalogProduct> {
    return apiClient
      .patch<ProductCatalogProduct>(PRODUCT_CATALOG_ENDPOINTS.UPDATE(id), payload)
      .then((r) => r.data);
  },
};
