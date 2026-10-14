import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pantryApi } from '../api/pantryApi';
import { PANTRY_QUERY_KEYS } from '../constants';
import { CreatePantryProductPayload, UpdatePantryProductPayload } from '../types';

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

  return useQuery({
    queryKey: debouncedSearch
      ? ([...PANTRY_QUERY_KEYS.list, debouncedSearch] as const)
      : PANTRY_QUERY_KEYS.list,
    queryFn: () => pantryApi.list(debouncedSearch || undefined),
    staleTime: 2 * 60 * 1000,
  });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEYS.list });
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
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEYS.list });
    },
  });
}

export function useDeletePantryProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pantryApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: PANTRY_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEYS.list });
    },
  });
}
