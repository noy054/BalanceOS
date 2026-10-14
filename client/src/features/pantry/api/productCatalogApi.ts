import { apiClient } from '../../../shared/api/client';
import { PRODUCT_CATALOG_ENDPOINTS } from '../constants';
import { Page, ProductCatalogProduct } from '../types';

export const productCatalogApi = {
  search(
    q: string,
    cursor?: string,
    limit = 20,
  ): Promise<Page<ProductCatalogProduct>> {
    return apiClient
      .get<Page<ProductCatalogProduct>>(PRODUCT_CATALOG_ENDPOINTS.SEARCH, {
        params: { q, limit, ...(cursor ? { cursor } : {}) },
      })
      .then((r) => r.data);
  },

  getById(id: string): Promise<ProductCatalogProduct> {
    return apiClient
      .get<ProductCatalogProduct>(PRODUCT_CATALOG_ENDPOINTS.BY_ID(id))
      .then((r) => r.data);
  },
};
