import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dayLogApi } from '../api/dayLogApi';
import { DAY_LOG_QUERY_KEYS } from '../constants';
import {
  AddMealItemPayload,
  CopyMealPayload,
  DayLogMealsResponse,
  DayLogResponse,
  DayLogSummary,
  MealMacros,
} from '../types';

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

function refreshDayLog(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.today, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.todayMeals, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['statistics'] }),
  ]);
}

type RemovalSnapshot = {
  meals: DayLogMealsResponse | undefined;
  summary: DayLogSummary | undefined;
};

const ZERO_MACROS: MealMacros = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

function subtract1(current: number, removed: number): number {
  return Math.max(0, Math.round((current - removed) * 10) / 10);
}

function subtractMacros<T extends MealMacros>(target: T, removed: MealMacros): T {
  return {
    ...target,
    calories: Math.max(0, target.calories - removed.calories),
    protein: subtract1(target.protein, removed.protein),
    carbs: subtract1(target.carbs, removed.carbs),
    fat: subtract1(target.fat, removed.fat),
    fiber: subtract1(target.fiber, removed.fiber),
  };
}

async function cancelDayLogQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: DAY_LOG_QUERY_KEYS.today }),
    queryClient.cancelQueries({ queryKey: DAY_LOG_QUERY_KEYS.todayMeals }),
  ]);
}

function applyRemoval(
  queryClient: QueryClient,
  removed: MealMacros,
  updateMeals: (meals: DayLogMealsResponse) => DayLogMealsResponse,
): RemovalSnapshot {
  const snapshot: RemovalSnapshot = {
    meals: queryClient.getQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.todayMeals),
    summary: queryClient.getQueryData<DayLogSummary>(DAY_LOG_QUERY_KEYS.today),
  };

  if (snapshot.meals) {
    queryClient.setQueryData(DAY_LOG_QUERY_KEYS.todayMeals, updateMeals(snapshot.meals));
  }

  if (snapshot.summary) {
    queryClient.setQueryData<DayLogSummary>(DAY_LOG_QUERY_KEYS.today, {
      ...snapshot.summary,
      caloriesEaten: Math.max(0, snapshot.summary.caloriesEaten - removed.calories),
      macros: snapshot.summary.macros.map((macro) => ({
        ...macro,
        current: subtract1(macro.current, removed[macro.key]),
      })),
    });
  }

  return snapshot;
}

function restore(queryClient: QueryClient, snapshot: RemovalSnapshot | undefined) {
  if (!snapshot) return;
  queryClient.setQueryData(DAY_LOG_QUERY_KEYS.todayMeals, snapshot.meals);
  queryClient.setQueryData(DAY_LOG_QUERY_KEYS.today, snapshot.summary);
}

export function useTodayDayLog() {
  return useQuery({
    queryKey: DAY_LOG_QUERY_KEYS.today,
    queryFn: async () => toDayLogSummary(await dayLogApi.getToday()),
    staleTime: 30 * 1000,
  });
}

export function useTodayMeals() {
  return useQuery({
    queryKey: DAY_LOG_QUERY_KEYS.todayMeals,
    queryFn: () => dayLogApi.getTodayMeals(),
    staleTime: 30 * 1000,
  });
}

export function useAddMealItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMealItemPayload) => dayLogApi.addMealItem(payload),
    onSuccess: () => refreshDayLog(queryClient),
  });
}

/** Thrown when only the first `savedCount` items of a batch were logged. */
export class PartialAddMealItemsError extends Error {
  constructor(
    readonly savedCount: number,
    readonly originalError: unknown,
  ) {
    super('Some meal items were not logged');
  }
}

export function useAddMealItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payloads: AddMealItemPayload[]) => {
      let savedCount = 0;
      try {
        for (const payload of payloads) {
          await dayLogApi.addMealItem(payload);
          savedCount += 1;
        }
      } catch (err: unknown) {
        throw new PartialAddMealItemsError(savedCount, err);
      }
    },
    onSettled: () => refreshDayLog(queryClient),
  });
}

export function useRemoveMealItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => dayLogApi.removeMealItem(itemId),
    onMutate: async (itemId: string) => {
      await cancelDayLogQueries(queryClient);
      const meals = queryClient.getQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.todayMeals);
      const item = meals?.meals.flatMap((meal) => meal.items).find((entry) => entry.id === itemId);
      return applyRemoval(
        queryClient,
        item ?? ZERO_MACROS,
        (data) => ({
          meals: data.meals
            .map((meal) => {
              const removed = meal.items.find((entry) => entry.id === itemId);
              if (!removed) return meal;
              return {
                ...subtractMacros(meal, removed),
                items: meal.items.filter((entry) => entry.id !== itemId),
              };
            })
            .filter((meal) => meal.items.length > 0),
        }),
      );
    },
    onError: (_error, _itemId, snapshot) => restore(queryClient, snapshot),
    onSettled: () => refreshDayLog(queryClient),
  });
}

export function useRemoveMealEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealEntryId: string) => dayLogApi.removeMealEntry(mealEntryId),
    onMutate: async (mealEntryId: string) => {
      await cancelDayLogQueries(queryClient);
      const meals = queryClient.getQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.todayMeals);
      const entry = meals?.meals.find((meal) => meal.id === mealEntryId);
      return applyRemoval(
        queryClient,
        entry ?? ZERO_MACROS,
        (data) => ({ meals: data.meals.filter((meal) => meal.id !== mealEntryId) }),
      );
    },
    onError: (_error, _id, snapshot) => restore(queryClient, snapshot),
    onSettled: () => refreshDayLog(queryClient),
  });
}

export function useCopyMealEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CopyMealPayload) => dayLogApi.copyMealEntry(payload),
    onSuccess: () => refreshDayLog(queryClient),
  });
}
