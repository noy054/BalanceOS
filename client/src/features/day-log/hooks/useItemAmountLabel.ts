import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { formatAmount } from "../../pantry/helpers/serving";
import { useServingFormat } from "../../pantry/hooks/useServingFormat";
import { MealItemSummary } from "../types";

export function useItemAmountLabel() {
  const { t } = useTranslation("dashboard");
  const servingFormat = useServingFormat();

  return useCallback(
    (item: MealItemSummary): string | null => {
      if (item.source === "SAVED_MEAL") {
        return t("meals.savedMeal");
      }

      if (item.grams == null && item.servings == null && item.milliliters == null && item.portions == null) {
        return null;
      }

      if (item.source === "RECIPE" && item.portions != null) {
        const portions = t("meals.recipePortions", { count: Number(formatAmount(item.portions)) });
        return item.grams != null
          ? `${portions} · ${t("meals.recipeGrams", { value: formatAmount(item.grams) })}`
          : portions;
      }

      if (item.source === "RECIPE" && item.grams != null) {
        return t("meals.recipeGrams", { value: formatAmount(item.grams) });
      }

      if (item.source === "RECIPE" && item.servings != null) {
        return t("meals.recipeServings", {
          count: Number(formatAmount(item.servings)),
        });
      }

      return servingFormat.amount(item.serving ?? {}, {
        grams: item.grams,
        servings: item.servings,
        milliliters: item.milliliters,
      });
    },
    [t, servingFormat],
  );
}
