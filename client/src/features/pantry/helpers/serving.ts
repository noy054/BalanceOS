import { NutritionBasis } from "../types";

export type ServingSource = {
  nutritionBasis?: NutritionBasis;
  servingSizeG?: number | null;
  servingSizeMl?: number | null;
  servingQuantity?: number | null;
  servingUnit?: string | null;
};

export type ServingInfo = {
  grams: number | null;
  milliliters: number | null;
  quantity: number;
  unit: string | null;
  unitGrams: number | null;
  unitMilliliters: number | null;
};

export type AmountUnit = "grams" | "milliliters" | "servings";

export type AmountPayload = {
  grams?: number;
  servings?: number;
  milliliters?: number;
};

export type StoredAmountInput = {
  grams?: number | null;
  servings?: number | null;
  milliliters?: number | null;
};

const MIN_PAYLOAD_GRAMS = 0.1;
const MIN_PAYLOAD_MILLILITERS = 0.1;
const MIN_PAYLOAD_SERVINGS = 0.0001;

export function isAmountPayloadValid(payload: AmountPayload): boolean {
  if (payload.grams != null) return payload.grams >= MIN_PAYLOAD_GRAMS;
  if (payload.milliliters != null) return payload.milliliters >= MIN_PAYLOAD_MILLILITERS;
  return payload.servings != null && payload.servings >= MIN_PAYLOAD_SERVINGS;
}

function roundPayload(value: number) {
  return Math.round(value * 10000) / 10000;
}

function positive(value: number | null | undefined) {
  return value != null && value > 0 ? value : null;
}

export function isVolumeBasis(product: ServingSource) {
  return product.nutritionBasis === "PER_100ML";
}

export function getServing(product: ServingSource): ServingInfo | null {
  const grams = positive(product.servingSizeG);
  const milliliters = positive(product.servingSizeMl);
  const perServing = product.nutritionBasis === "PER_SERVING";

  if (!grams && !milliliters && !perServing) {
    return null;
  }

  const unit = product.servingUnit?.trim() || null;
  const quantity =
    product.servingQuantity != null && product.servingQuantity > 0 && (unit || perServing)
      ? product.servingQuantity
      : 1;

  return {
    grams,
    milliliters,
    quantity,
    unit,
    unitGrams: grams ? grams / quantity : null,
    unitMilliliters: milliliters ? milliliters / quantity : null,
  };
}

export function hasServing(product: ServingSource) {
  return getServing(product) !== null;
}

function gramsPerMilliliter(product: ServingSource) {
  const grams = positive(product.servingSizeG);
  const milliliters = positive(product.servingSizeMl);
  return grams && milliliters ? grams / milliliters : null;
}

export function canUseGrams(product: ServingSource) {
  if (product.nutritionBasis === "PER_SERVING") return getServing(product)?.grams != null;
  if (isVolumeBasis(product)) return gramsPerMilliliter(product) !== null;
  return true;
}

export function canUseMilliliters(product: ServingSource) {
  if (product.nutritionBasis === "PER_SERVING") return getServing(product)?.milliliters != null;
  if (isVolumeBasis(product)) return true;
  return gramsPerMilliliter(product) !== null;
}

export function baseAmountUnit(product: ServingSource): AmountUnit {
  return isVolumeBasis(product) ? "milliliters" : "grams";
}

export function amountUnits(product: ServingSource): AmountUnit[] {
  const base = baseAmountUnit(product);
  const other: AmountUnit = base === "grams" ? "milliliters" : "grams";
  const usable = (unit: AmountUnit) =>
    unit === "grams" ? canUseGrams(product) : canUseMilliliters(product);
  return [
    ...(hasServing(product) ? (["servings"] as const) : []),
    ...(usable(base) ? [base] : []),
    ...(usable(other) ? [other] : []),
  ];
}

export function formatAmount(value: number) {
  return String(Math.round(value * 100) / 100);
}

export function defaultAmountUnit(product: ServingSource): AmountUnit {
  return hasServing(product) ? "servings" : baseAmountUnit(product);
}

export function defaultAmount(product: ServingSource, unit = defaultAmountUnit(product)) {
  const serving = getServing(product);

  if (unit === "servings" && serving) {
    return formatAmount(serving.quantity);
  }

  if (unit === "milliliters") {
    return serving?.milliliters ? formatAmount(serving.milliliters) : "100";
  }

  return serving?.grams ? formatAmount(serving.grams) : "100";
}

export function convertQuantity(
  product: ServingSource,
  amount: number,
  from: AmountUnit,
  to: AmountUnit,
): number | null {
  if (from === to) return amount;
  const serving = getServing(product);
  const density = gramsPerMilliliter(product);

  let grams: number | null = null;
  let milliliters: number | null = null;
  if (from === "grams") {
    grams = amount;
    milliliters = density ? amount / density : null;
  } else if (from === "milliliters") {
    milliliters = amount;
    grams = density ? amount * density : null;
  } else {
    grams = serving?.unitGrams ? amount * serving.unitGrams : null;
    milliliters = serving?.unitMilliliters ? amount * serving.unitMilliliters : null;
  }

  if (to === "grams") return grams;
  if (to === "milliliters") return milliliters;
  if (serving?.unitGrams && grams != null) return grams / serving.unitGrams;
  if (serving?.unitMilliliters && milliliters != null) return milliliters / serving.unitMilliliters;
  return null;
}

export function amountToGrams(
  product: ServingSource,
  amount: number,
  unit: AmountUnit,
): number | null {
  return convertQuantity(product, amount, unit, "grams");
}

export function toAmountPayload(
  product: ServingSource,
  amount: number,
  unit: AmountUnit,
): AmountPayload {
  if (unit === "grams") return { grams: roundPayload(amount) };
  if (unit === "milliliters") return { milliliters: roundPayload(amount) };
  const serving = getServing(product);
  if (!serving) return isVolumeBasis(product) ? { milliliters: roundPayload(amount) } : { grams: roundPayload(amount) };
  if (isVolumeBasis(product) && serving.unitMilliliters) {
    return { milliliters: roundPayload(amount * serving.unitMilliliters) };
  }
  if (serving.unitGrams) return { grams: roundPayload(amount * serving.unitGrams) };
  if (serving.unitMilliliters) return { milliliters: roundPayload(amount * serving.unitMilliliters) };
  return { servings: roundPayload(amount / serving.quantity) };
}

export function amountFromStored(
  product: ServingSource,
  stored: StoredAmountInput,
): { amount: string; unit: AmountUnit } {
  if (stored.servings != null) {
    const serving = getServing(product);
    return {
      amount: formatAmount(stored.servings * (serving?.quantity ?? 1)),
      unit: "servings",
    };
  }
  if (stored.milliliters != null) {
    return { amount: formatAmount(stored.milliliters), unit: "milliliters" };
  }
  return { amount: formatAmount(stored.grams ?? 0), unit: "grams" };
}

export function convertAmount(
  product: ServingSource,
  amount: string,
  from: AmountUnit,
  to: AmountUnit,
) {
  const parsed = parseFloat(amount.replace(",", "."));
  if (from === to || Number.isNaN(parsed) || parsed <= 0) {
    return from === to ? amount : defaultAmount(product, to);
  }
  const converted = convertQuantity(product, parsed, from, to);
  return converted != null ? formatAmount(converted) : defaultAmount(product, to);
}

export function nextAmountUnit(product: ServingSource, current: AmountUnit): AmountUnit {
  const units = amountUnits(product);
  if (units.length < 2) return current;
  const index = units.indexOf(current);
  return units[(index + 1) % units.length];
}

export function servingAmountInGrams(product: ServingSource, amount: string, unit: AmountUnit) {
  if (unit !== "servings") return null;
  const parsed = parseFloat(amount.replace(",", "."));
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return getServing(product)?.unitGrams ? amountToGrams(product, parsed, unit) : null;
}
