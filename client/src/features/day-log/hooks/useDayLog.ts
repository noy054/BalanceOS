import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dayLogApi } from '../api/dayLogApi';
import { DAY_LOG_QUERY_KEYS } from '../constants';
import { AddMealItemPayload, DayLogResponse, DayLogSummary } from '../types';

function toDayLogSummary(r: DayLogResponse): DayLogSummary {
  return {
    date: r.date,
    caloriesEaten: Math.round(r.caloriesTotal),
    caloriesTarget: r.targetsSnapshot.calories,
    macros: [
      { key: 'protein', current: r.proteinTotal, target: r.targetsSnapshot.protein },
      { key: 'carbs', current: r.carbsTotal, target: r.targetsSnapshot.carbs },
      { key: 'fat', current: r.fatTotal, target: r.targetsSnapshot.fat },
      { key: 'fiber', current: r.fiberTotal, target: r.targetsSnapshot.fiber },
    ],
  };
}

export function useTodayDayLog() {
  return useQuery({
    queryKey: DAY_LOG_QUERY_KEYS.today,
    queryFn: async () => toDayLogSummary(await dayLogApi.getToday()),
    staleTime: 30 * 1000,
  });
}

export function useAddMealItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMealItemPayload) => dayLogApi.addMealItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.today });
    },
  });
}

export function useRemoveMealItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => dayLogApi.removeMealItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.today });
    },
  });
}
