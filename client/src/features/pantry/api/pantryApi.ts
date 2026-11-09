import { apiClient } from '../../../shared/api/client';
import { CATALOG_ENDPOINTS, PANTRY_ENDPOINTS } from '../constants';
import {
  AddFromCatalogPayload,
  CatalogBrowseItem,
  CatalogProductDetail,
  CatalogDepartment,
  CatalogDepartmentCount,
  CatalogSubcategoryCount,
  CreatePantryProductPayload,
  Page,
  PantryProduct,
  ProductCatalogProduct,
  ProductCategory,
  UpdatePantryProductPayload,
} from '../types';
import { PantrySort } from "../helpers/pantrySort";
import { FoodCategory } from "../helpers/pantryFilters";

export const pantryApi = {
  list(params: {
    search?: string;
    cursor?: string;
    limit?: number;
    sort?: PantrySort;
    focus?: Exclude<FoodCategory, "all">;
    category?: ProductCategory;
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

  frequent(limit: number, today: string): Promise<PantryProduct[]> {
    return apiClient
      .get<PantryProduct[]>(PANTRY_ENDPOINTS.FREQUENT, { params: { limit, today } })
      .then((r) => r.data);
  },

  getCatalogItem(id: string): Promise<CatalogProductDetail> {
    return apiClient
      .get<CatalogProductDetail>(CATALOG_ENDPOINTS.BY_ID(id))
      .then((r) => r.data);
  },

  getCatalogDepartments(): Promise<CatalogDepartmentCount[]> {
    return apiClient
      .get<CatalogDepartmentCount[]>(CATALOG_ENDPOINTS.DEPARTMENTS)
      .then((r) => r.data);
  },

  getCatalogSubcategories(department: CatalogDepartment): Promise<CatalogSubcategoryCount[]> {
    return apiClient
      .get<CatalogSubcategoryCount[]>(CATALOG_ENDPOINTS.SUBCATEGORIES(department))
      .then((r) => r.data);
  },

  browseCatalog(params: {
    department?: CatalogDepartment;
    subcategory?: string;
    q?: string;
    cursor?: string;
    limit?: number;
  }): Promise<Page<CatalogBrowseItem>> {
    return apiClient
      .get<Page<CatalogBrowseItem>>(CATALOG_ENDPOINTS.BROWSE, { params })
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
