import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { savedMealsApi } from '../api/savedMealsApi';
import { SAVED_MEAL_QUERY_KEYS } from '../constants';
import { CreateSavedMealPayload, UpdateSavedMealPayload } from '../types';

export function useSavedMeals() {
  return useQuery({
    queryKey: SAVED_MEAL_QUERY_KEYS.list,
    queryFn: () => savedMealsApi.list(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSavedMeal(id: string) {
  return useQuery({
    queryKey: SAVED_MEAL_QUERY_KEYS.detail(id),
    queryFn: () => savedMealsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSavedMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSavedMealPayload) => savedMealsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_MEAL_QUERY_KEYS.list });
    },
  });
}

export function useUpdateSavedMeal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSavedMealPayload) => savedMealsApi.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(SAVED_MEAL_QUERY_KEYS.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: SAVED_MEAL_QUERY_KEYS.list });
    },
  });
}

export function useDeleteSavedMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savedMealsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: SAVED_MEAL_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: SAVED_MEAL_QUERY_KEYS.list });
    },
  });
}
