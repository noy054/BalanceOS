import {
  keepPreviousData,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
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

function refreshDayLog(queryClient: QueryClient, date?: string) {
  return Promise.all([
    ...(date
      ? [
          queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.day(date), refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.meals(date), refetchType: 'all' }),
        ]
      : []),
    queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: ['statistics'] }),
  ]);
}

type RemovalSnapshot = {
  date: string;
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

async function cancelDayLogQueries(queryClient: QueryClient, date: string) {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: DAY_LOG_QUERY_KEYS.day(date) }),
    queryClient.cancelQueries({ queryKey: DAY_LOG_QUERY_KEYS.meals(date) }),
  ]);
}

function applyRemoval(
  queryClient: QueryClient,
  date: string,
  removed: MealMacros,
  updateMeals: (meals: DayLogMealsResponse) => DayLogMealsResponse,
): RemovalSnapshot {
  const snapshot: RemovalSnapshot = {
    date,
    meals: queryClient.getQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.meals(date)),
    summary: queryClient.getQueryData<DayLogSummary>(DAY_LOG_QUERY_KEYS.day(date)),
  };

  if (snapshot.meals) {
    queryClient.setQueryData(DAY_LOG_QUERY_KEYS.meals(date), updateMeals(snapshot.meals));
  }

  if (snapshot.summary) {
    queryClient.setQueryData<DayLogSummary>(DAY_LOG_QUERY_KEYS.day(date), {
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
  queryClient.setQueryData(DAY_LOG_QUERY_KEYS.meals(snapshot.date), snapshot.meals);
  queryClient.setQueryData(DAY_LOG_QUERY_KEYS.day(snapshot.date), snapshot.summary);
}

const DAY_STALE_TIME = 30 * 1000;

function dayQuery(date: string) {
  return {
    queryKey: DAY_LOG_QUERY_KEYS.day(date),
    queryFn: async () => toDayLogSummary(await dayLogApi.getDay(date)),
    staleTime: DAY_STALE_TIME,
  };
}

function dayMealsQuery(date: string) {
  return {
    queryKey: DAY_LOG_QUERY_KEYS.meals(date),
    queryFn: () => dayLogApi.getDayMeals(date),
    staleTime: DAY_STALE_TIME,
  };
}

export function prefetchDay(queryClient: QueryClient, date: string) {
  return Promise.all([
    queryClient.prefetchQuery(dayQuery(date)),
    queryClient.prefetchQuery(dayMealsQuery(date)),
  ]);
}

export function useDayLog(date: string) {
  return useQuery({ ...dayQuery(date), placeholderData: keepPreviousData });
}

export function useDayMeals(date: string) {
  return useQuery({ ...dayMealsQuery(date), placeholderData: keepPreviousData });
}

export function useDayLogCalendar(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: DAY_LOG_QUERY_KEYS.calendar(from, to),
    queryFn: () => dayLogApi.getCalendar(from, to),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    enabled,
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

export function useAddMealItems(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payloads: AddMealItemPayload[]) => {
      let savedCount = 0;
      try {
        for (const payload of payloads) {
          await dayLogApi.addMealItem(date, payload);
          savedCount += 1;
        }
      } catch (err: unknown) {
        throw new PartialAddMealItemsError(savedCount, err);
      }
    },
    onSettled: () => refreshDayLog(queryClient, date),
  });
}

export function useRemoveMealItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => dayLogApi.removeMealItem(itemId),
    onMutate: async (itemId: string) => {
      await cancelDayLogQueries(queryClient, date);
      const meals = queryClient.getQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.meals(date));
      const item = meals?.meals.flatMap((meal) => meal.items).find((entry) => entry.id === itemId);
      return applyRemoval(
        queryClient,
        date,
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
    onSettled: () => refreshDayLog(queryClient, date),
  });
}

export function useRemoveMealEntry(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealEntryId: string) => dayLogApi.removeMealEntry(mealEntryId),
    onMutate: async (mealEntryId: string) => {
      await cancelDayLogQueries(queryClient, date);
      const meals = queryClient.getQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.meals(date));
      const entry = meals?.meals.find((meal) => meal.id === mealEntryId);
      return applyRemoval(
        queryClient,
        date,
        entry ?? ZERO_MACROS,
        (data) => ({ meals: data.meals.filter((meal) => meal.id !== mealEntryId) }),
      );
    },
    onError: (_error, _id, snapshot) => restore(queryClient, snapshot),
    onSettled: () => refreshDayLog(queryClient, date),
  });
}

export function useCopyMealEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CopyMealPayload) => dayLogApi.copyMealEntry(payload),
    onSuccess: (_data, payload) =>
      Promise.all([
        refreshDayLog(queryClient),
        ...payload.targetDates.map((date) => refreshDayLog(queryClient, date)),
      ]),
  });
}
