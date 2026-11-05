import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { recipesApi } from "../api/recipesApi";
import { savedMealsApi } from "../api/savedMealsApi";
import { RECIPE_QUERY_KEYS, SAVED_MEAL_QUERY_KEYS } from "../constants";
import { CreateRecipePayload, PantryRecipe, UpdateRecipePayload } from "../types";
import { refetchAll, removeFromList, upsertInList } from "../helpers/listCache";
import { todayKey } from "../../../shared/helpers/dateKey";
import { DAY_LOG_QUERY_KEYS } from "../../day-log/constants";

export function useRecipes() {
  return useQuery({
    queryKey: RECIPE_QUERY_KEYS.list,
    queryFn: () => recipesApi.list(),
    staleTime: 2 * 60 * 1000,
  });
}

const LISTED_USAGE_NAMES = 3;

export function useProductUsageWarning() {
  const { t } = useTranslation("pantry");
  const queryClient = useQueryClient();

  return useCallback(
    async (productId: string): Promise<string | null> => {
      function listNames(names: string[]) {
        const listed = names.slice(0, LISTED_USAGE_NAMES).join(", ");
        const extra = names.length - LISTED_USAGE_NAMES;
        return extra > 0 ? `${listed} ${t("recipeUsage.more", { count: extra })}` : listed;
      }

      try {
        const [recipes, savedMeals] = await Promise.all([
          queryClient.fetchQuery({
            queryKey: RECIPE_QUERY_KEYS.list,
            queryFn: () => recipesApi.list(),
            staleTime: 30 * 1000,
          }),
          queryClient.fetchQuery({
            queryKey: SAVED_MEAL_QUERY_KEYS.list,
            queryFn: () => savedMealsApi.list(),
            staleTime: 30 * 1000,
          }),
        ]);
        const recipeNames = recipes
          .filter((recipe) => recipe.items.some((item) => item.productId === productId))
          .map((recipe) => recipe.name);
        const mealNames = savedMeals
          .filter((meal) => meal.items.some((item) => item.productId === productId))
          .map((meal) => meal.name);
        const warnings = [
          recipeNames.length > 0
            ? t("recipeUsage.warning", { count: recipeNames.length, names: listNames(recipeNames) })
            : null,
          mealNames.length > 0
            ? t("savedMealUsage.warning", { count: mealNames.length, names: listNames(mealNames) })
            : null,
        ].filter((warning): warning is string => warning !== null);
        return warnings.length > 0 ? warnings.join("\n\n") : null;
      } catch {
        return t("recipeUsage.unknown");
      }
    },
    [queryClient, t],
  );
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
    meta: { analytics: "recipe_created" },
    mutationFn: (payload: CreateRecipePayload) => recipesApi.create(payload),
    onSuccess: (created) => {
      queryClient.setQueryData(RECIPE_QUERY_KEYS.detail(created.id), created);
      upsertInList<PantryRecipe>(queryClient, RECIPE_QUERY_KEYS.list, created);
      void refetchAll(queryClient, [RECIPE_QUERY_KEYS.list]);
    },
  });
}

export function useUpdateRecipe(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { analytics: "recipe_updated" },
    mutationFn: (payload: UpdateRecipePayload) =>
      recipesApi.update(id, { ...payload, logsFrom: todayKey() }),
    onSuccess: (updated) => {
      queryClient.setQueryData(RECIPE_QUERY_KEYS.detail(id), updated);
      upsertInList<PantryRecipe>(queryClient, RECIPE_QUERY_KEYS.list, updated);
      void refetchAll(queryClient, [RECIPE_QUERY_KEYS.list, SAVED_MEAL_QUERY_KEYS.list]);
      void queryClient.invalidateQueries({ queryKey: DAY_LOG_QUERY_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: RECIPE_QUERY_KEYS.detail(id) });
      removeFromList<PantryRecipe>(queryClient, RECIPE_QUERY_KEYS.list, id);
      void refetchAll(queryClient, [RECIPE_QUERY_KEYS.list, SAVED_MEAL_QUERY_KEYS.list]);
    },
  });
}
