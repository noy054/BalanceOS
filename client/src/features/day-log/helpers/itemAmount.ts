import { getServing } from "../../pantry/helpers/serving";
import { MealItemSummary, MealMacros } from "../types";

export type EditableAmountKind = "grams" | "units" | "servings";

export type EditableAmount = {
  kind: EditableAmountKind;
  initial: number;
  unit: string | null;
  step: number;
  min: number;
  toPayload: (value: number) => { grams: number } | { servings: number };
  ratio: (value: number) => number;
};

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function editableAmount(item: MealItemSummary): EditableAmount | null {
  if (item.grams != null && item.grams > 0) {
    const grams = item.grams;
    return {
      kind: "grams",
      initial: round(grams, 1),
      unit: null,
      step: 10,
      min: 0.1,
      toPayload: (value) => ({ grams: round(value, 1) }),
      ratio: (value) => round(value, 1) / grams,
    };
  }

  if (item.servings != null && item.servings > 0) {
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
        min: 0.01,
        toPayload: (value) => ({ servings: round(value / perServing, 4) }),
        ratio: (value) => round(value / perServing, 4) / servings,
      };
    }

    return {
      kind: "servings",
      initial: round(servings, 2),
      unit: null,
      step: 0.5,
      min: 0.01,
      toPayload: (value) => ({ servings: round(value, 4) }),
      ratio: (value) => round(value, 4) / servings,
    };
  }

  return null;
}

export function parseAmountInput(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (!/^\d*\.?\d+$|^\d+\.$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
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
