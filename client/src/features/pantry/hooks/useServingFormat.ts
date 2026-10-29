import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatGrams } from "../../../shared/helpers/formatNumber";
import { formatAmount, getServing, ServingSource } from "../helpers/serving";

export type StoredAmount = {
  grams?: number | null;
  servings?: number | null;
};

export function useServingFormat() {
  const { t } = useTranslation("pantry");

  return useMemo(() => {
    function unitName(product: ServingSource) {
      return getServing(product)?.unit ?? t("serving.servingsUnit");
    }

    function perServing(product: ServingSource) {
      const serving = getServing(product);

      if (!serving) {
        return t("product.per100g");
      }

      const quantity = formatAmount(serving.quantity);

      if (serving.unit) {
        return serving.grams
          ? t("serving.per", { quantity, unit: serving.unit, grams: formatGrams(serving.grams) })
          : t("serving.perNoWeight", { quantity, unit: serving.unit });
      }

      return serving.grams
        ? t("serving.perGrams", { grams: formatGrams(serving.grams) })
        : t("serving.perServingPlain");
    }

    function basis(product: ServingSource) {
      const serving = getServing(product);

      if (!serving) {
        return t("serving.basisShort.per100g");
      }

      const quantity = formatAmount(serving.quantity);

      if (serving.unit) {
        return serving.grams
          ? t("serving.basisShort.unit", { quantity, unit: serving.unit, grams: formatGrams(serving.grams) })
          : t("serving.basisShort.unitNoWeight", { quantity, unit: serving.unit });
      }

      return serving.grams
        ? t("serving.basisShort.servingGrams", { grams: formatGrams(serving.grams) })
        : t("serving.basisShort.serving");
    }

    function amount(product: ServingSource, stored: StoredAmount) {
      const serving = getServing(product);

      if (stored.servings != null && serving) {
        const count = Number(formatAmount(stored.servings * serving.quantity));
        const grams = serving.unitGrams ? count * serving.unitGrams : null;

        if (serving.unit) {
          return grams
            ? t("serving.amount", { count, unit: serving.unit, grams: formatGrams(grams) })
            : t("serving.amountNoWeight", { count, unit: serving.unit });
        }

        return grams
          ? t("foodCard.servingsQuantity", { count, grams: formatGrams(grams) })
          : t("foodCard.servingsCount", { count });
      }

      const grams = stored.grams ?? 0;

      if (!serving?.unitGrams) {
        return t("foodCard.gramsQuantity", { grams: formatGrams(grams) });
      }

      const count = Number(formatAmount(grams / serving.unitGrams));

      return serving.unit
        ? t("serving.amount", { count, unit: serving.unit, grams: formatGrams(grams) })
        : t("foodCard.servingsQuantity", { count, grams: formatGrams(grams) });
    }

    function unitWeight(product: ServingSource) {
      const serving = getServing(product);

      if (!serving?.unitGrams || (serving.unit && serving.quantity === 1)) {
        return null;
      }

      return serving.unit
        ? t("serving.unitWeight", { grams: formatGrams(serving.unitGrams) })
        : t("serving.servingWeight", { grams: formatGrams(serving.grams) });
    }

    return { unitName, perServing, basis, amount, unitWeight };
  }, [t]);
}
