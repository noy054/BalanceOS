import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatGrams } from "../../../shared/helpers/formatNumber";
import { formatAmount, getServing, isVolumeBasis, ServingInfo, ServingSource } from "../helpers/serving";

export type StoredAmount = {
  grams?: number | null;
  servings?: number | null;
  milliliters?: number | null;
};

export function useServingFormat() {
  const { t } = useTranslation("pantry");

  return useMemo(() => {
    function grams(value: number) {
      return t("measure.grams", { value: formatGrams(value) });
    }

    function milliliters(value: number) {
      return t("measure.milliliters", { value: formatGrams(value) });
    }

    function servingMeasure(product: ServingSource, serving: ServingInfo, count = serving.quantity) {
      const ratio = count / serving.quantity;
      const volumeFirst = isVolumeBasis(product);
      if (volumeFirst && serving.milliliters) return milliliters(serving.milliliters * ratio);
      if (serving.grams) return grams(serving.grams * ratio);
      if (serving.milliliters) return milliliters(serving.milliliters * ratio);
      return null;
    }

    function unitName(product: ServingSource) {
      return getServing(product)?.unit ?? t("serving.servingsUnit");
    }

    function per100(product: ServingSource) {
      return isVolumeBasis(product) ? t("product.per100ml") : t("product.per100g");
    }

    function perServing(product: ServingSource) {
      const serving = getServing(product);

      if (!serving) {
        return per100(product);
      }

      const quantity = formatAmount(serving.quantity);
      const measure = servingMeasure(product, serving);

      if (serving.unit) {
        return measure
          ? t("serving.per", { quantity, unit: serving.unit, measure })
          : t("serving.perNoWeight", { quantity, unit: serving.unit });
      }

      return measure ? t("serving.perGrams", { measure }) : t("serving.perServingPlain");
    }

    function basis(product: ServingSource) {
      const serving = getServing(product);

      if (!serving) {
        return isVolumeBasis(product) ? t("serving.basisShort.per100ml") : t("serving.basisShort.per100g");
      }

      const quantity = formatAmount(serving.quantity);
      const measure = servingMeasure(product, serving);

      if (serving.unit) {
        return measure
          ? t("serving.basisShort.unit", { quantity, unit: serving.unit, measure })
          : t("serving.basisShort.unitNoWeight", { quantity, unit: serving.unit });
      }

      return measure
        ? t("serving.basisShort.servingGrams", { measure })
        : t("serving.basisShort.serving");
    }

    function amount(product: ServingSource, stored: StoredAmount) {
      const serving = getServing(product);

      if (stored.servings != null && serving) {
        const count = Number(formatAmount(stored.servings * serving.quantity));
        const measure = servingMeasure(product, serving, count);

        if (serving.unit) {
          return measure
            ? t("serving.amount", { count, unit: serving.unit, measure })
            : t("serving.amountNoWeight", { count, unit: serving.unit });
        }

        return measure
          ? t("foodCard.servingsQuantity", { count, measure })
          : t("foodCard.servingsCount", { count });
      }

      if (stored.milliliters != null) {
        const value = stored.milliliters;
        if (!serving?.unitMilliliters) return milliliters(value);
        const count = Number(formatAmount(value / serving.unitMilliliters));
        return serving.unit
          ? t("serving.amount", { count, unit: serving.unit, measure: milliliters(value) })
          : t("foodCard.servingsQuantity", { count, measure: milliliters(value) });
      }

      const value = stored.grams ?? 0;

      if (!serving?.unitGrams) {
        return grams(value);
      }

      const count = Number(formatAmount(value / serving.unitGrams));

      return serving.unit
        ? t("serving.amount", { count, unit: serving.unit, measure: grams(value) })
        : t("foodCard.servingsQuantity", { count, measure: grams(value) });
    }

    function unitWeight(product: ServingSource) {
      const serving = getServing(product);
      if (!serving || (serving.unit && serving.quantity === 1)) return null;

      const unitMeasure = serving.unitGrams
        ? grams(serving.unitGrams)
        : serving.unitMilliliters
          ? milliliters(serving.unitMilliliters)
          : null;
      if (!unitMeasure) return null;

      return serving.unit
        ? t("serving.unitWeight", { measure: unitMeasure })
        : t("serving.servingWeight", { measure: servingMeasure(product, serving) ?? unitMeasure });
    }

    return { unitName, per100, perServing, basis, amount, unitWeight, grams, milliliters };
  }, [t]);
}
