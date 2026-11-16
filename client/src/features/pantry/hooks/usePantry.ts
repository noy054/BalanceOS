import { todayKey } from '../../../shared/helpers/dateKey';
import { useCallback, useEffect, useState } from 'react';
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { pantryApi } from '../api/pantryApi';
import { FoodCategory } from '../helpers/pantryFilters';
import { ProductCategory } from '../types';
import {
  BARCODE_QUERY_KEYS,
  CATALOG_QUERY_KEYS,
  PANTRY_PAGE_SIZE,
  PANTRY_QUERY_KEYS,
  RECIPE_QUERY_KEYS,
  SAVED_MEAL_QUERY_KEYS,
} from '../constants';
import {
  AddFromCatalogPayload,
  CreatePantryProductPayload,
  Page,
  PantryProduct,
  UpdatePantryProductPayload,
} from '../types';
import { PantrySort } from '../helpers/pantrySort';

type ProductPages = InfiniteData<Page<PantryProduct>, string | undefined>;

function patchProductPages(
  queryClient: QueryClient,
  update: (items: PantryProduct[], pageIndex: number) => PantryProduct[],
) {
  queryClient.setQueriesData<ProductPages>(
    { queryKey: ['pantry', 'products', 'pages'] },
    (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page, index) => ({
              ...page,
              items: update(page.items, index),
            })),
          }
        : data,
  );
}

function upsertProduct(queryClient: QueryClient, product: PantryProduct) {
  queryClient.setQueryData(PANTRY_QUERY_KEYS.detail(product.id), product);
  let found = false;
  patchProductPages(queryClient, (items) =>
    items.map((item) => {
      if (item.id !== product.id) return item;
      found = true;
      return product;
    }),
  );
  if (!found) {
    patchProductPages(queryClient, (items, index) =>
      index === 0
        ? [product, ...items]
        : items,
    );
  }
}

function invalidatePantryProducts(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEYS.list }),
    queryClient.invalidateQueries({ queryKey: BARCODE_QUERY_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: RECIPE_QUERY_KEYS.list, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: SAVED_MEAL_QUERY_KEYS.list, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.browseAll }),
    queryClient.invalidateQueries({ queryKey: ['product-catalog'], refetchType: 'all' }),
  ]);
}

export function usePantryProducts(
  search?: string,
  sort: PantrySort = 'newest',
  focus: FoodCategory = 'all',
  category: ProductCategory | null = null,
) {
  const trimmed = (search ?? '').trim();
  const [debouncedSearch, setDebouncedSearch] = useState(trimmed);

  useEffect(() => {
    if (!trimmed) {
      setDebouncedSearch('');
      return;
    }
    const id = setTimeout(() => setDebouncedSearch(trimmed), 300);
    return () => clearTimeout(id);
  }, [trimmed]);

  const query = useInfiniteQuery({
    queryKey: PANTRY_QUERY_KEYS.pages(debouncedSearch, sort, focus, category ?? ''),
    queryFn: ({ pageParam }) =>
      pantryApi.list({
        search: debouncedSearch || undefined,
        cursor: pageParam,
        limit: PANTRY_PAGE_SIZE,
        sort,
        focus: focus === 'all' ? undefined : focus,
        category: category ?? undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data): PantryProduct[] => data.pages.flatMap((page) => page.items),
    staleTime: 2 * 60 * 1000,
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ...query, loadMore };
}

export function usePantryProduct(id: string) {
  return useQuery({
    queryKey: PANTRY_QUERY_KEYS.detail(id),
    queryFn: () => pantryApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePantryProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analytics: 'product_created' },
    mutationFn: (payload: CreatePantryProductPayload) => pantryApi.create(payload),
    onSuccess: (created) => {
      upsertProduct(queryClient, created);
      void invalidatePantryProducts(queryClient);
    },
  });
}

export function useFrequentProducts(enabled = true) {
  return useQuery({
    queryKey: PANTRY_QUERY_KEYS.frequent,
    queryFn: () => pantryApi.frequent(5, todayKey()),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useCatalogItem(id: string) {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.detail(id),
    queryFn: () => pantryApi.getCatalogItem(id),
    enabled: Boolean(id),
  });
}

export function useAddPantryProductFromCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analytics: 'product_created' },
    mutationFn: ({
      catalogItemId,
      payload,
    }: {
      catalogItemId: string;
      payload: AddFromCatalogPayload;
    }) => pantryApi.addFromCatalog(catalogItemId, payload),
    onSuccess: (created) => {
      upsertProduct(queryClient, created);
      void invalidatePantryProducts(queryClient);
    },
  });
}

export function useUpdatePantryProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analytics: 'product_updated' },
    mutationFn: (payload: UpdatePantryProductPayload) =>
      pantryApi.update(id, payload),
    onSuccess: (updated) => {
      upsertProduct(queryClient, updated);
      void invalidatePantryProducts(queryClient);
    },
  });
}

export function useDeletePantryProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analytics: 'product_deleted' },
    mutationFn: (id: string) => pantryApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: PANTRY_QUERY_KEYS.detail(id) });
      patchProductPages(queryClient, (items) => items.filter((item) => item.id !== id));
      void invalidatePantryProducts(queryClient);
    },
  });
}
