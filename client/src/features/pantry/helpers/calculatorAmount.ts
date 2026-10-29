import { NutritionSource, nutritionForAmount, supportsGrams, supportsServings } from "./nutrition";
import { AmountPayload, isAmountPayloadValid, ServingSource, toAmountPayload } from "./serving";

export type CalculatorProduct = NutritionSource & ServingSource;

export type CalculatorUnit = "grams" | "servings" | "calories";

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function caloriesPer100g(product: NutritionSource): number {
  if (!supportsGrams(product)) return 0;
  return nutritionForAmount(product, { grams: 100 })?.calories ?? 0;
}

function caloriesPerServing(product: NutritionSource): number {
  if (!supportsServings(product)) return 0;
  return nutritionForAmount(product, { servings: 1 })?.calories ?? 0;
}

export function calculatorUnits(product: CalculatorProduct): CalculatorUnit[] {
  const units: CalculatorUnit[] = [];
  if (supportsGrams(product)) units.push("grams");
  if (supportsServings(product)) units.push("servings");
  if (caloriesPer100g(product) > 0 || caloriesPerServing(product) > 0) units.push("calories");
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
  } else if (unit === "servings" && supportsServings(product)) {
    payload = toAmountPayload(product, value, "servings");
  } else if (unit === "calories") {
    const per100 = caloriesPer100g(product);
    const perServing = caloriesPerServing(product);
    if (per100 > 0) payload = { grams: round((value / per100) * 100, 1) };
    else if (perServing > 0) payload = { servings: round(value / perServing, 4) };
  }

  return payload && isAmountPayloadValid(payload) ? payload : null;
}
