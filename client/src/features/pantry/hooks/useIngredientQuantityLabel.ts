import { useTranslation } from "react-i18next";

import { AmountUnit, ServingSource, toAmountPayload } from "../helpers/serving";
import { useServingFormat } from "./useServingFormat";

function parse(value: string) {
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function useIngredientQuantityLabel() {
  const { t } = useTranslation("pantry");
  const format = useServingFormat();
  const missing = { label: t("ingredientEdit.setQuantity"), missing: true };

  return {
    product(product: ServingSource, amount: string, unit: AmountUnit) {
      const parsed = parse(amount);
      if (parsed === null) return missing;
      return { label: format.amount(product, toAmountPayload(product, parsed, unit)), missing: false };
    },
    recipe(servings: string) {
      const parsed = parse(servings);
      if (parsed === null) return missing;
      return { label: t("foodCard.recipeServings", { count: parsed }), missing: false };
    },
  };
}
