import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { savedMealsApi } from "../api/savedMealsApi";
import { SAVED_MEAL_QUERY_KEYS } from "../constants";
import { CreateSavedMealPayload, SavedMeal, UpdateSavedMealPayload } from "../types";
import { refetchAll, removeFromList, upsertInList } from "../helpers/listCache";
import { todayKey } from "../../../shared/helpers/dateKey";
import { DAY_LOG_QUERY_KEYS } from "../../day-log/constants";

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
    meta: { analytics: "saved_meal_created" },
    mutationFn: (payload: CreateSavedMealPayload) =>
      savedMealsApi.create(payload),
    onSuccess: (created) => {
      queryClient.setQueryData(SAVED_MEAL_QUERY_KEYS.detail(created.id), created);
      upsertInList<SavedMeal>(queryClient, SAVED_MEAL_QUERY_KEYS.list, created);
      void refetchAll(queryClient, [SAVED_MEAL_QUERY_KEYS.list]);
    },
  });
}

export function useUpdateSavedMeal(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { analytics: "saved_meal_updated" },
    mutationFn: (payload: UpdateSavedMealPayload) =>
      savedMealsApi.update(id, { ...payload, logsFrom: todayKey() }),
    onSuccess: (updated) => {
      queryClient.setQueryData(SAVED_MEAL_QUERY_KEYS.detail(id), updated);
      upsertInList<SavedMeal>(queryClient, SAVED_MEAL_QUERY_KEYS.list, updated);
      void refetchAll(queryClient, [SAVED_MEAL_QUERY_KEYS.list]);
      void queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function useDeleteSavedMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => savedMealsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: SAVED_MEAL_QUERY_KEYS.detail(id) });
      removeFromList<SavedMeal>(queryClient, SAVED_MEAL_QUERY_KEYS.list, id);
      void refetchAll(queryClient, [SAVED_MEAL_QUERY_KEYS.list]);
    },
  });
}
