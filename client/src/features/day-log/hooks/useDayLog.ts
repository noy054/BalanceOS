import { useRef } from 'react';
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
  CopyToDaysPayload,
  DayLogMealsResponse,
  DayLogResponse,
  DayLogSummary,
  MealEntrySummary,
  MealItemComponent,
  MealItemSummary,
  MealMacros,
  UpdateMealItemPayload,
} from '../types';
import { PANTRY_QUERY_KEYS } from '../../pantry/constants';
import { AnalyticsAction } from '../../analytics/analytics';

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

function refreshDayLog(queryClient: QueryClient, dates: string[]) {
  return Promise.all([
    ...dates.map((date) =>
      queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.day(date), refetchType: 'all' }),
    ),
    queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: ['statistics'] }),
    queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEYS.frequent }),
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

function mealItemAction(variables: unknown): AnalyticsAction {
  const payload = (variables as { payload?: AddMealItemPayload }).payload;
  if (payload?.savedMealId) return 'saved_meal_logged';
  if (payload?.pantryRecipeId) return 'recipe_logged';
  return 'meal_item_added';
}

export function useAddMealItemOnDate() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analytics: mealItemAction },
    mutationFn: ({ date, payload }: { date: string; payload: AddMealItemPayload }) =>
      dayLogApi.addMealItem(date, payload),
    onSettled: (_data, _error, variables) => refreshDayLog(queryClient, [variables.date]),
  });
}

export function useUpdateMealItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analytics: 'meal_item_updated' },
    mutationFn: (payload: UpdateMealItemPayload) => dayLogApi.updateMealItem(payload),
    onMutate: async (payload: UpdateMealItemPayload) => {
      await cancelDayLogQueries(queryClient, date);
      const snapshot = takeSnapshot(queryClient, date);
      const item = snapshot.meals?.meals.flatMap((meal) => meal.items).find((entry) => entry.id === payload.itemId);
      const current = item ? storedAmount(item) : null;
      const next = item ? matchingAmount(item, payload) : null;
      if (!snapshot.meals || !item || !current || !next) return snapshot;

      const ratio = next / current;
      const updated: MealItemSummary = {
        ...scaleAmounts(item, ratio),
        components: item.components?.map((part) => scaleAmounts(part, ratio)),
      };
      applyItemChange(queryClient, snapshot, payload.itemId, (entry) => ({ ...entry, ...updated }), macroDelta(item, updated));
      return snapshot;
    },
    onError: (_error, _payload, snapshot) => restore(queryClient, snapshot),
    onSettled: () => refreshDayLog(queryClient, [date]),
  });
}

const MACRO_FIELDS = ['calories', 'protein', 'carbs', 'fat', 'fiber'] as const;

function roundMacro(key: (typeof MACRO_FIELDS)[number], value: number) {
  return key === 'calories' ? Math.max(0, Math.round(value)) : Math.max(0, Math.round(value * 10) / 10);
}

function addMacros<T extends MealMacros>(target: T, delta: MealMacros): T {
  const next = { ...target };
  for (const key of MACRO_FIELDS) next[key] = roundMacro(key, target[key] + delta[key]);
  return next;
}

type StoredAmounts = { grams?: number | null; servings?: number | null; milliliters?: number | null; portions?: number | null };

function storedAmount(entry: StoredAmounts) {
  return entry.grams ?? entry.milliliters ?? entry.portions ?? entry.servings ?? null;
}

function matchingAmount(entry: StoredAmounts, payload: StoredAmounts) {
  if (entry.grams != null) return payload.grams ?? null;
  if (entry.milliliters != null) return payload.milliliters ?? null;
  if (entry.portions != null) return payload.portions ?? null;
  return payload.servings ?? null;
}

function scaleAmounts<T extends MealMacros & StoredAmounts>(entry: T, ratio: number): T {
  const next = {
    ...entry,
    grams: entry.grams != null ? Math.round(entry.grams * ratio * 100) / 100 : entry.grams,
    servings: entry.servings != null ? Math.round(entry.servings * ratio * 10000) / 10000 : entry.servings,
    milliliters: entry.milliliters != null ? Math.round(entry.milliliters * ratio * 100) / 100 : entry.milliliters,
    portions: entry.portions != null ? Math.round(entry.portions * ratio * 10000) / 10000 : entry.portions,
  };
  for (const key of MACRO_FIELDS) next[key] = roundMacro(key, entry[key] * ratio);
  return next;
}

function componentAtAmount(component: MealItemComponent, amount: number): MealItemComponent | null {
  const stored = storedAmount(component);
  const base = component.baseMacros ?? (stored ? { ...component, amount: stored } : null);
  if (!base || !(base.amount > 0)) return null;
  const ratio = amount / base.amount;
  const next: MealItemComponent = {
    ...component,
    grams: component.grams != null ? amount : component.grams,
    servings: component.servings != null ? amount : component.servings,
    milliliters: component.milliliters != null ? amount : component.milliliters,
    baseMacros: base,
  };
  for (const key of MACRO_FIELDS) next[key] = roundMacro(key, base[key] * ratio);
  return next;
}

function macroDelta(before: MealMacros, after: MealMacros): MealMacros {
  const delta = { ...ZERO_MACROS };
  for (const key of MACRO_FIELDS) delta[key] = after[key] - before[key];
  return delta;
}

function takeSnapshot(queryClient: QueryClient, date: string): RemovalSnapshot {
  return {
    date,
    meals: queryClient.getQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.meals(date)),
    summary: queryClient.getQueryData<DayLogSummary>(DAY_LOG_QUERY_KEYS.day(date)),
  };
}

function applyItemChange(
  queryClient: QueryClient,
  snapshot: RemovalSnapshot,
  itemId: string,
  change: (item: MealItemSummary) => MealItemSummary,
  delta: MealMacros,
) {
  if (snapshot.meals) {
    queryClient.setQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.meals(snapshot.date), {
      meals: snapshot.meals.meals.map((meal) => {
        if (!meal.items.some((entry) => entry.id === itemId)) return meal;
        return {
          ...addMacros(meal, delta),
          items: meal.items.map((entry) => (entry.id === itemId ? change(entry) : entry)),
        };
      }),
    });
  }
  if (snapshot.summary) {
    queryClient.setQueryData<DayLogSummary>(DAY_LOG_QUERY_KEYS.day(snapshot.date), {
      ...snapshot.summary,
      caloriesEaten: roundMacro('calories', snapshot.summary.caloriesEaten + delta.calories),
      macros: snapshot.summary.macros.map((macro) => ({
        ...macro,
        current: roundMacro(macro.key, macro.current + delta[macro.key]),
      })),
    });
  }
}

export function useMealItemComponents(itemId: string, date: string, enabled: boolean) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: DAY_LOG_QUERY_KEYS.components(itemId),
    queryFn: async () => {
      const result = await dayLogApi.getMealItemComponents(itemId);
      void queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.meals(date) });
      return result.components;
    },
    enabled,
    retry: false,
    staleTime: Infinity,
  });
}

export function useRemoveMealItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analytics: 'meal_item_removed' },
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
    onSettled: () => refreshDayLog(queryClient, [date]),
  });
}

export function moveItemBetweenMeals(
  data: DayLogMealsResponse,
  itemId: string,
  mealType: string,
): DayLogMealsResponse | null {
  const source = data.meals.find((meal) => meal.items.some((entry) => entry.id === itemId));
  const item = source?.items.find((entry) => entry.id === itemId);
  if (!source || !item || source.mealType === mealType) return null;
  const existing = data.meals.find((meal) => meal.mealType === mealType);
  const target: MealEntrySummary = existing ?? { id: `pending-${mealType}`, mealType, items: [], ...ZERO_MACROS };
  const moved = { ...addMacros(target, item), items: [...target.items, item] };
  const meals = data.meals
    .map((meal) => {
      if (meal === source) return { ...subtractMacros(meal, item), items: meal.items.filter((entry) => entry.id !== itemId) };
      if (meal === existing) return moved;
      return meal;
    })
    .filter((meal) => meal.items.length > 0);
  return { meals: existing ? meals : [...meals, moved] };
}

export function useMoveMealItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analytics: 'meal_item_updated' },
    mutationFn: ({ itemId, mealType }: { itemId: string; mealType: string }) =>
      dayLogApi.moveMealItem(itemId, mealType),
    onMutate: async ({ itemId, mealType }) => {
      await cancelDayLogQueries(queryClient, date);
      const snapshot = takeSnapshot(queryClient, date);
      const next = snapshot.meals ? moveItemBetweenMeals(snapshot.meals, itemId, mealType) : null;
      if (next) queryClient.setQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.meals(date), next);
      return snapshot;
    },
    onError: (_error, _variables, snapshot) => restore(queryClient, snapshot),
    onSettled: () => refreshDayLog(queryClient, [date]),
  });
}

export function useCopyToDays() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analytics: 'meal_copied' },
    mutationFn: (payload: CopyToDaysPayload) => dayLogApi.copyToDays(payload),
    onSuccess: (_data, payload) => refreshDayLog(queryClient, payload.targetDates),
  });
}

type AmountTarget = { itemId: string; componentId?: string };
type AmountPayload = { grams?: number; servings?: number; milliliters?: number; portions?: number };

function findItem(queryClient: QueryClient, date: string, itemId: string) {
  return queryClient
    .getQueryData<DayLogMealsResponse>(DAY_LOG_QUERY_KEYS.meals(date))
    ?.meals.flatMap((meal) => meal.items)
    .find((entry) => entry.id === itemId);
}

export function useLiveAmountEdit(date: string, target: AmountTarget) {
  const queryClient = useQueryClient();
  const base = useRef<MealItemSummary | null>(null);
  const pending = useRef(0);
  const generation = useRef(0);

  function preview(payload: AmountPayload) {
    void cancelDayLogQueries(queryClient, date);
    const item = findItem(queryClient, date, target.itemId);
    if (!item) return;
    if (!base.current) base.current = item;
    const original = base.current;
    generation.current += 1;
    const snapshot = takeSnapshot(queryClient, date);

    if (target.componentId) {
      const from = original.components?.find((part) => part.id === target.componentId);
      const current = item.components?.find((part) => part.id === target.componentId);
      const next = from ? matchingAmount(from, payload) : null;
      if (!from || !current || next == null) return;
      const updated = componentAtAmount(from, next);
      if (!updated) return;
      const delta = macroDelta(current, updated);
      applyItemChange(
        queryClient,
        snapshot,
        target.itemId,
        (entry) => ({
          ...addMacros(entry, delta),
          components: entry.components?.map((part) => (part.id === target.componentId ? updated : part)),
        }),
        delta,
      );
      return;
    }

    const before = storedAmount(original);
    const next = matchingAmount(original, payload);
    if (!before || !next) return;
    const ratio = next / before;
    const updated: MealItemSummary = {
      ...scaleAmounts(original, ratio),
      components: original.components?.map((part) => scaleAmounts(part, ratio)),
    };
    applyItemChange(queryClient, snapshot, target.itemId, () => updated, macroDelta(item, updated));
  }

  const mutation = useMutation({
    meta: { analytics: 'meal_item_updated' },
    scope: { id: `meal-item-amount:${target.itemId}` },
    mutationFn: (payload: AmountPayload) =>
      target.componentId
        ? dayLogApi.updateMealItemComponent({ ...payload, itemId: target.itemId, componentId: target.componentId })
        : dayLogApi.updateMealItem({ ...payload, itemId: target.itemId }),
    onSettled: async () => {
      pending.current -= 1;
      if (pending.current > 0) return;
      const seen = generation.current;
      await refreshDayLog(queryClient, [date]);
      if (pending.current === 0 && generation.current === seen) base.current = null;
    },
  });

  function save(payload: AmountPayload, options?: Parameters<typeof mutation.mutate>[1]) {
    pending.current += 1;
    mutation.mutate(payload, options);
  }

  return { preview, save };
}
