import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipesApi } from '../api/recipesApi';
import { RECIPE_QUERY_KEYS } from '../constants';
import { CreateRecipePayload, UpdateRecipePayload } from '../types';

export function useRecipes() {
  return useQuery({
    queryKey: RECIPE_QUERY_KEYS.list,
    queryFn: () => recipesApi.list(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: RECIPE_QUERY_KEYS.detail(id),
    queryFn: () => recipesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRecipePayload) => recipesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECIPE_QUERY_KEYS.list });
    },
  });
}

export function useUpdateRecipe(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRecipePayload) => recipesApi.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(RECIPE_QUERY_KEYS.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: RECIPE_QUERY_KEYS.list });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: RECIPE_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: RECIPE_QUERY_KEYS.list });
    },
  });
}
