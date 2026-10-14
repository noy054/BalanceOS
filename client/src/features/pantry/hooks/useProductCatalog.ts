import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { productCatalogApi } from '../api/productCatalogApi';
import { PRODUCT_CATALOG_QUERY_KEYS } from '../constants';
import { ProductCatalogProduct } from '../types';

/** Cursor-paginated global catalog search (server requires at least 2 characters) */
export function useProductCatalogSearch(q: string) {
  const trimmed = q.trim();
  return useInfiniteQuery({
    queryKey: PRODUCT_CATALOG_QUERY_KEYS.search(trimmed),
    queryFn: ({ pageParam }) => productCatalogApi.search(trimmed, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data): ProductCatalogProduct[] => data.pages.flatMap((page) => page.items),
    enabled: trimmed.length >= 2,
    staleTime: 60 * 1000,
  });
}

export function useProductCatalogItem(id: string) {
  return useQuery({
    queryKey: PRODUCT_CATALOG_QUERY_KEYS.detail(id),
    queryFn: () => productCatalogApi.getById(id),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  });
}
