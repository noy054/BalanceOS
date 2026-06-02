import { useMutation, useQuery } from '@tanstack/react-query';
import { productCatalogApi } from '../api/productCatalogApi';
import { PRODUCT_CATALOG_QUERY_KEYS } from '../constants';
import { CreateProductCatalogPayload, UpdateProductCatalogPayload } from '../types';

export function useProductCatalogBarcode(barcode: string | null) {
  return useQuery({
    queryKey: PRODUCT_CATALOG_QUERY_KEYS.barcode(barcode ?? ''),
    queryFn: () => productCatalogApi.lookupByBarcode(barcode!),
    enabled: !!barcode,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useProductCatalogSearch(q: string) {
  return useQuery({
    queryKey: PRODUCT_CATALOG_QUERY_KEYS.search(q),
    queryFn: () => productCatalogApi.search(q),
    enabled: q.length >= 2,
    staleTime: 60 * 1000,
  });
}

export function useCreateProductCatalog() {
  return useMutation({
    mutationFn: (payload: CreateProductCatalogPayload) =>
      productCatalogApi.create(payload),
  });
}

export function useUpdateProductCatalog() {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductCatalogPayload;
    }) => productCatalogApi.update(id, payload),
  });
}
