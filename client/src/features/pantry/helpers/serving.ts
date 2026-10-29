import { NutritionBasis } from "../types";

export type ServingSource = {
  nutritionBasis?: NutritionBasis;
  servingSizeG?: number | null;
  servingQuantity?: number | null;
  servingUnit?: string | null;
};

export type ServingInfo = {
  grams: number | null;
  quantity: number;
  unit: string | null;
  unitGrams: number | null;
};

export type AmountUnit = "grams" | "servings";

export type AmountPayload = {
  grams?: number;
  servings?: number;
};

const MIN_PAYLOAD_GRAMS = 0.1;
const MIN_PAYLOAD_SERVINGS = 0.0001;

export function isAmountPayloadValid(payload: AmountPayload): boolean {
  if (payload.grams != null) return payload.grams >= MIN_PAYLOAD_GRAMS;
  return payload.servings != null && payload.servings >= MIN_PAYLOAD_SERVINGS;
}

function roundPayload(value: number) {
  return Math.round(value * 10000) / 10000;
}

export function getServing(product: ServingSource): ServingInfo | null {
  const grams =
    product.servingSizeG != null && product.servingSizeG > 0 ? product.servingSizeG : null;
  const perServing = product.nutritionBasis === "PER_SERVING";

  if (!grams && !perServing) {
    return null;
  }

  const unit = product.servingUnit?.trim() || null;
  const quantity =
    product.servingQuantity != null && product.servingQuantity > 0 && (unit || perServing)
      ? product.servingQuantity
      : 1;

  return { grams, quantity, unit, unitGrams: grams ? grams / quantity : null };
}

export function hasServing(product: ServingSource) {
  return getServing(product) !== null;
}

export function canUseGrams(product: ServingSource) {
  return product.nutritionBasis !== "PER_SERVING" || getServing(product)?.grams != null;
}

export function formatAmount(value: number) {
  return String(Math.round(value * 100) / 100);
}

export function defaultAmountUnit(product: ServingSource): AmountUnit {
  return hasServing(product) ? "servings" : "grams";
}

export function defaultAmount(product: ServingSource, unit = defaultAmountUnit(product)) {
  const serving = getServing(product);

  if (unit === "servings" && serving) {
    return formatAmount(serving.quantity);
  }

  return serving?.grams ? formatAmount(serving.grams) : "100";
}

export function amountToGrams(
  product: ServingSource,
  amount: number,
  unit: AmountUnit,
): number | null {
  if (unit === "grams") return amount;
  const serving = getServing(product);
  return serving?.unitGrams ? amount * serving.unitGrams : null;
}

export function toAmountPayload(
  product: ServingSource,
  amount: number,
  unit: AmountUnit,
): AmountPayload {
  if (unit === "grams") return { grams: roundPayload(amount) };
  const serving = getServing(product);
  if (!serving) return { grams: roundPayload(amount) };
  if (serving.unitGrams) return { grams: roundPayload(amount * serving.unitGrams) };
  return { servings: roundPayload(amount / serving.quantity) };
}

export function amountFromStored(
  product: ServingSource,
  stored: { grams?: number | null; servings?: number | null },
): { amount: string; unit: AmountUnit } {
  if (stored.servings != null) {
    const serving = getServing(product);
    return {
      amount: formatAmount(stored.servings * (serving?.quantity ?? 1)),
      unit: "servings",
    };
  }
  return { amount: formatAmount(stored.grams ?? 0), unit: "grams" };
}

export function convertAmount(
  product: ServingSource,
  amount: string,
  from: AmountUnit,
  to: AmountUnit,
) {
  const serving = getServing(product);
  const parsed = parseFloat(amount.replace(",", "."));

  if (!serving?.unitGrams || from === to || Number.isNaN(parsed) || parsed <= 0) {
    return defaultAmount(product, to);
  }

  const grams = amountToGrams(product, parsed, from) ?? parsed;
  return formatAmount(to === "servings" ? grams / serving.unitGrams : grams);
}
