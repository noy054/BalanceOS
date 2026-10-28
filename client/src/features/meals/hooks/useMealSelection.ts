import { useState } from 'react';

import { CalculatedNutrition, PantryProduct, PantryRecipe, SavedMeal } from '../../pantry/types';
import { nutritionForAmount } from '../../pantry/helpers/nutrition';
import {
  AmountUnit,
  canUseGrams,
  convertAmount,
  defaultAmount,
  defaultAmountUnit,
  formatAmount,
  hasServing,
  toAmountPayload,
} from '../../pantry/helpers/serving';
import { AddMealItemPayload } from '../../day-log/types';

export type SelectedItem =
  | { kind: 'product'; item: PantryProduct }
  | { kind: 'recipe'; item: PantryRecipe }
  | { kind: 'savedMeal'; item: SavedMeal };

export type MealCartEntry = {
  key: string;
  name: string;
  amount: SelectedAmount;
  calories: number;
  payload: AddMealItemPayload;
};

export type SelectedAmount =
  | { kind: 'product'; product: PantryProduct; grams?: number; servings?: number }
  | { kind: 'recipe'; servings: number }
  | { kind: 'savedMeal' };

function parseQuantity(value: string) {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
}

function scaleTotals(
  totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number },
  factor: number,
): CalculatedNutrition {
  return {
    calories: Math.round(totals.calories * factor),
    protein: Math.round(totals.protein * factor * 10) / 10,
    carbs: Math.round(totals.carbs * factor * 10) / 10,
    fat: Math.round(totals.fat * factor * 10) / 10,
    fiber: Math.round(totals.fiber * factor * 10) / 10,
  };
}

export function useMealSelection() {
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<AmountUnit>('servings');

  function isSelected(kind: SelectedItem['kind'], id: string) {
    return selected?.kind === kind && selected.item.id === id;
  }

  function select(next: SelectedItem) {
    if (isSelected(next.kind, next.item.id)) {
      setSelected(null);
      return;
    }
    setSelected(next);
    if (next.kind === 'product') {
      const nextUnit = defaultAmountUnit(next.item);
      setUnit(nextUnit);
      setQuantity(defaultAmount(next.item, nextUnit));
    } else {
      setUnit('servings');
      setQuantity('1');
    }
  }

  function deselect() {
    setSelected(null);
  }

  function changeUnit(next: AmountUnit) {
    if (selected?.kind !== 'product' || next === unit) return;
    setQuantity(convertAmount(selected.item, quantity, unit, next));
    setUnit(next);
  }

  function step(direction: 1 | -1) {
    const current = parseQuantity(quantity) ?? 0;
    const increment = unit === 'grams' && selected?.kind === 'product' ? 10 : current < 1 ? 0.5 : 1;
    const next = Math.max(increment, current + direction * increment);
    setQuantity(formatAmount(next));
  }

  const product = selected?.kind === 'product' ? selected.item : null;
  const parsed = parseQuantity(quantity);
  const unitOptions: AmountUnit[] = product
    ? [...(hasServing(product) ? (['servings'] as const) : []), ...(canUseGrams(product) ? (['grams'] as const) : [])]
    : [];

  let amount: SelectedAmount | null = null;
  let nutrition: CalculatedNutrition | null = null;

  if (selected?.kind === 'product' && parsed) {
    const payload = toAmountPayload(selected.item, parsed, unit);
    amount = { kind: 'product', product: selected.item, ...payload };
    nutrition = nutritionForAmount(selected.item, payload);
  } else if (selected?.kind === 'recipe' && parsed) {
    amount = { kind: 'recipe', servings: parsed };
    nutrition = scaleTotals(selected.item.totals, parsed);
  } else if (selected?.kind === 'savedMeal') {
    amount = { kind: 'savedMeal' };
    nutrition = scaleTotals(selected.item.totals, 1);
  }

  function buildEntry(mealType: string): MealCartEntry | null {
    if (!selected || !amount || !nutrition) return null;
    const payload: AddMealItemPayload = { mealType };

    if (amount.kind === 'product') {
      payload.pantryProductId = selected.item.id;
      if (amount.grams != null) payload.grams = amount.grams;
      if (amount.servings != null) payload.servings = amount.servings;
    } else if (amount.kind === 'recipe') {
      payload.pantryRecipeId = selected.item.id;
      payload.servings = amount.servings;
    } else {
      payload.savedMealId = selected.item.id;
    }

    return {
      key: Math.random().toString(36).slice(2),
      name: selected.item.name,
      amount,
      calories: nutrition.calories,
      payload,
    };
  }

  return {
    selected,
    quantity,
    unit,
    unitOptions,
    amount,
    nutrition,
    isSelected,
    select,
    deselect,
    setQuantity,
    changeUnit,
    step,
    buildEntry,
  };
}
