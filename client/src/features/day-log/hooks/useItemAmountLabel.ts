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

      if (item.grams == null && item.servings == null) {
        return null;
      }

      if (item.source === "RECIPE" && item.servings != null) {
        return t("meals.recipeServings", {
          count: Number(formatAmount(item.servings)),
        });
      }

      return servingFormat.amount(item.serving ?? {}, {
        grams: item.grams,
        servings: item.servings,
      });
    },
    [t, servingFormat],
  );
}
