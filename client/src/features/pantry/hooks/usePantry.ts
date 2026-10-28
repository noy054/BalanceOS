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
        ? [...items, product].sort((a, b) => a.name.localeCompare(b.name))
        : items,
    );
  }
}

function invalidatePantryProducts(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEYS.list }),
    queryClient.invalidateQueries({ queryKey: BARCODE_QUERY_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: RECIPE_QUERY_KEYS.list }),
    queryClient.invalidateQueries({ queryKey: SAVED_MEAL_QUERY_KEYS.list }),
  ]);
}

export function usePantryProducts(search?: string) {
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
    queryKey: PANTRY_QUERY_KEYS.pages(debouncedSearch),
    queryFn: ({ pageParam }) =>
      pantryApi.list({
        search: debouncedSearch || undefined,
        cursor: pageParam,
        limit: PANTRY_PAGE_SIZE,
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
    mutationFn: (payload: CreatePantryProductPayload) => pantryApi.create(payload),
    onSuccess: (created) => {
      upsertProduct(queryClient, created);
      void invalidatePantryProducts(queryClient);
    },
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
    mutationFn: (id: string) => pantryApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: PANTRY_QUERY_KEYS.detail(id) });
      patchProductPages(queryClient, (items) => items.filter((item) => item.id !== id));
      void invalidatePantryProducts(queryClient);
    },
  });
}
