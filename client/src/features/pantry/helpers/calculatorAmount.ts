import {
  NutritionSource,
  nutritionForAmount,
  supportsGrams,
  supportsMilliliters,
  supportsServings,
} from "./nutrition";
import {
  AmountPayload,
  convertQuantity,
  defaultAmount,
  formatAmount,
  getServing,
  isVolumeBasis,
  isAmountPayloadValid,
  ServingSource,
  toAmountPayload,
} from "./serving";

export type CalculatorProduct = NutritionSource & ServingSource;

export type CalculatorUnit = "grams" | "milliliters" | "servings" | "calories";

export type CalculatorSteps = {
  minor: number;
  major: number;
  button: number;
  precision: number;
  quick: number;
};

export const CALCULATOR_STEPS: Record<CalculatorUnit, CalculatorSteps> = {
  grams: { minor: 1, major: 10, button: 1, precision: 1, quick: 10 },
  milliliters: { minor: 1, major: 10, button: 1, precision: 1, quick: 10 },
  calories: { minor: 1, major: 10, button: 1, precision: 1, quick: 10 },
  servings: { minor: 0.25, major: 1, button: 0.25, precision: 0.25, quick: 0.5 },
};

const DEFAULT_CALORIES = "100";
const DEFAULT_GRAMS = "100";

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function caloriesPerBase(product: CalculatorProduct): number {
  if (isVolumeBasis(product)) {
    if (!supportsMilliliters(product)) return 0;
    return nutritionForAmount(product, { milliliters: 100 })?.calories ?? 0;
  }
  if (!supportsGrams(product)) return 0;
  return nutritionForAmount(product, { grams: 100 })?.calories ?? 0;
}

function caloriesPerServing(product: NutritionSource): number {
  if (!supportsServings(product)) return 0;
  return nutritionForAmount(product, { servings: 1 })?.calories ?? 0;
}

export function calculatorUnits(product: CalculatorProduct): CalculatorUnit[] {
  const units: CalculatorUnit[] = [];
  const grams = supportsGrams(product);
  const milliliters = supportsMilliliters(product);
  if (isVolumeBasis(product)) {
    if (milliliters) units.push("milliliters");
    if (grams) units.push("grams");
  } else {
    if (grams) units.push("grams");
    if (milliliters) units.push("milliliters");
  }
  if (supportsServings(product)) units.push("servings");
  if (caloriesPerBase(product) > 0 || caloriesPerServing(product) > 0) units.push("calories");
  return units;
}

export function calculatorAmount(
  product: CalculatorProduct,
  value: number,
  unit: CalculatorUnit,
): AmountPayload | null {
  if (!Number.isFinite(value) || value <= 0) return null;

  let payload: AmountPayload | null = null;

  if (unit === "grams" && supportsGrams(product)) {
    payload = { grams: round(value, 1) };
  } else if (unit === "milliliters" && supportsMilliliters(product)) {
    payload = { milliliters: round(value, 1) };
  } else if (unit === "servings" && supportsServings(product)) {
    payload = toAmountPayload(product, value, "servings");
  } else if (unit === "calories") {
    const per100 = caloriesPerBase(product);
    const perServing = caloriesPerServing(product);
    if (per100 > 0) {
      const base = round((value / per100) * 100, 1);
      payload = isVolumeBasis(product) ? { milliliters: base } : { grams: base };
    }
    else if (perServing > 0) payload = { servings: round(value / perServing, 4) };
  }

  return payload && isAmountPayloadValid(payload) ? payload : null;
}

export function defaultCalculatorQuantity(product: CalculatorProduct, unit: CalculatorUnit) {
  if (unit === "calories") return DEFAULT_CALORIES;
  return defaultAmount(product, unit) || DEFAULT_GRAMS;
}

export function convertCalculatorQuantity(
  product: CalculatorProduct,
  amount: AmountPayload | null,
  calories: number | null,
  to: CalculatorUnit,
): string {
  const serving = getServing(product);

  if (to === "calories" && calories != null && calories > 0) {
    return String(Math.round(calories));
  }

  if (to !== "calories" && amount) {
    const from = amount.grams != null ? "grams" : amount.milliliters != null ? "milliliters" : "servings";
    const value =
      amount.grams ?? amount.milliliters ?? (amount.servings != null && serving ? amount.servings * serving.quantity : null);
    const converted = value != null ? convertQuantity(product, value, from, to) : null;
    if (converted != null) {
      return to === "servings" ? formatAmount(converted) : String(Math.round(converted));
    }
  }

  return defaultCalculatorQuantity(product, to);
}

export function stepQuantity(value: number, step: number, direction: 1 | -1, min: number) {
  const base = Number.isFinite(value) ? value : 0;
  const snapped =
    direction > 0 ? Math.floor(base / step + 1e-9) * step + step : Math.ceil(base / step - 1e-9) * step - step;
  return Math.max(min, Math.round(snapped * 100) / 100);
}

export function calculatorEquivalents(
  product: ServingSource,
  amount: AmountPayload,
  calories: number,
): { grams: number | null; milliliters: number | null; servings: number | null; calories: number } {
  const serving = getServing(product);
  const from = amount.grams != null ? "grams" : amount.milliliters != null ? "milliliters" : "servings";
  const value =
    amount.grams ?? amount.milliliters ?? (amount.servings != null && serving ? amount.servings * serving.quantity : null);
  const pick = (to: "grams" | "milliliters" | "servings") =>
    value != null ? convertQuantity(product, value, from, to) : null;
  return { grams: pick("grams"), milliliters: pick("milliliters"), servings: serving ? pick("servings") : null, calories };
}
