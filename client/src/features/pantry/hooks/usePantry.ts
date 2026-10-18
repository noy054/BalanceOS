import { useCallback, useEffect, useState } from 'react';
import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { pantryApi } from '../api/pantryApi';
import { BARCODE_QUERY_KEYS, PANTRY_PAGE_SIZE, PANTRY_QUERY_KEYS } from '../constants';
import {
  AddFromCatalogPayload,
  CreatePantryProductPayload,
  PantryProduct,
  UpdatePantryProductPayload,
} from '../types';

function invalidatePantryProducts(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEYS.list });
  queryClient.invalidateQueries({ queryKey: BARCODE_QUERY_KEYS.all });
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
      queryClient.setQueryData(PANTRY_QUERY_KEYS.detail(created.id), created);
      invalidatePantryProducts(queryClient);
    },
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
      queryClient.setQueryData(PANTRY_QUERY_KEYS.detail(created.id), created);
      invalidatePantryProducts(queryClient);
    },
  });
}

export function useUpdatePantryProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePantryProductPayload) =>
      pantryApi.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(PANTRY_QUERY_KEYS.detail(id), updated);
      invalidatePantryProducts(queryClient);
    },
  });
}

export function useDeletePantryProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pantryApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: PANTRY_QUERY_KEYS.detail(id) });
      invalidatePantryProducts(queryClient);
    },
  });
}
