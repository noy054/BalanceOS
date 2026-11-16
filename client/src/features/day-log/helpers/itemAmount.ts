import { getServing } from "../../pantry/helpers/serving";
import { MealItemSummary, MealMacros } from "../types";

export type EditableAmountKind = "grams" | "milliliters" | "units" | "servings" | "portions";

export type EditableAmount = {
  kind: EditableAmountKind;
  initial: number;
  unit: string | null;
  step: number;
  min: number;
  toPayload: (value: number) => { grams: number } | { milliliters: number } | { servings: number } | { portions: number };
  ratio: (value: number) => number;
  fromServings?: (servings: number) => number;
  servingsOf?: (value: number) => number;
};

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export type AmountSource = Pick<MealItemSummary, "grams" | "servings" | "milliliters" | "portions" | "source" | "serving">;

export function editableAmount(item: AmountSource, options: { allowZero?: boolean } = {}): EditableAmount | null {
  const allowZero = options.allowZero ?? false;
  const usable = (value: number | null | undefined): value is number =>
    value != null && (allowZero ? value >= 0 : value > 0);
  const floor = (min: number) => (allowZero ? 0 : min);

  if (usable(item.grams)) {
    const grams = item.grams;
    return {
      kind: "grams",
      initial: round(grams, 1),
      unit: null,
      step: 10,
      min: floor(0.1),
      toPayload: (value) => ({ grams: round(value, 1) }),
      ratio: (value) => round(value, 1) / grams,
    };
  }

  if (usable(item.milliliters)) {
    const milliliters = item.milliliters;
    return {
      kind: "milliliters",
      initial: round(milliliters, 1),
      unit: null,
      step: 10,
      min: floor(0.1),
      toPayload: (value) => ({ milliliters: round(value, 1) }),
      ratio: (value) => round(value, 1) / milliliters,
    };
  }

  if (usable(item.portions)) {
    const portions = item.portions;
    return {
      kind: "portions",
      initial: round(portions, 2),
      unit: null,
      step: 0.5,
      min: floor(0.01),
      toPayload: (value) => ({ portions: round(value, 4) }),
      ratio: (value) => round(value, 4) / portions,
      fromServings: (count) => count,
      servingsOf: (value) => value,
    };
  }

  if (usable(item.servings)) {
    const servings = item.servings;
    const serving =
      item.source === "PRODUCT" && item.serving ? getServing(item.serving) : null;

    if (serving?.unit) {
      const perServing = serving.quantity;
      return {
        kind: "units",
        initial: round(servings * perServing, 2),
        unit: serving.unit,
        step: 1,
        min: floor(0.01),
        toPayload: (value) => ({ servings: round(value / perServing, 4) }),
        ratio: (value) => round(value / perServing, 4) / servings,
        fromServings: (count) => round(count * perServing, 2),
        servingsOf: (value) => value / perServing,
      };
    }

    return {
      kind: "servings",
      initial: round(servings, 2),
      unit: null,
      step: 0.5,
      min: floor(0.01),
      toPayload: (value) => ({ servings: round(value, 4) }),
      ratio: (value) => round(value, 4) / servings,
      fromServings: (count) => count,
      servingsOf: (value) => value,
    };
  }

  return null;
}

export function parseAmountInput(text: string, allowZero = false): number | null {
  const normalized = text.trim().replace(",", ".");
  if (!/^\d*\.?\d+$|^\d+\.$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) && (allowZero ? value >= 0 : value > 0) ? value : null;
}

export function formatAmountInput(value: number) {
  return String(round(value, 2));
}

export function scaleMacros(item: MealMacros, ratio: number): MealMacros {
  return {
    calories: Math.round(item.calories * ratio),
    protein: round(item.protein * ratio, 1),
    carbs: round(item.carbs * ratio, 1),
    fat: round(item.fat * ratio, 1),
    fiber: round(item.fiber * ratio, 1),
  };
}
