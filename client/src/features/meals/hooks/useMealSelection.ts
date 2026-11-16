import { useState } from 'react';

import { CalculatedNutrition, PantryProduct, PantryRecipe, SavedMeal } from '../../pantry/types';
import { nutritionForAmount } from '../../pantry/helpers/nutrition';
import {
  AmountUnit,
  amountUnits,
  convertAmount,
  defaultAmount,
  defaultAmountUnit,
  formatAmount,
  isAmountPayloadValid,
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
  | { kind: 'product'; product: PantryProduct; grams?: number; servings?: number; milliliters?: number }
  | { kind: 'recipe'; servings?: number; portions?: number; grams?: number }
  | { kind: 'savedMeal' };

export type SelectionUnit = AmountUnit | 'portions';

export function recipeUnits(recipe: PantryRecipe): SelectionUnit[] {
  const units: SelectionUnit[] = [];
  if (recipe.portionPlan?.status === 'ok') units.push('portions');
  if (recipeWeight(recipe)) units.push('grams');
  units.push('servings');
  return units;
}

export function recipeWeight(recipe: PantryRecipe) {
  return recipe.cookedWeightG ?? recipe.rawWeightG ?? null;
}

function portionFraction(recipe: PantryRecipe) {
  return recipe.portionPlan?.status === 'ok' ? recipe.portionPlan.portion.fraction : null;
}

function recipeBatchFraction(recipe: PantryRecipe, unit: SelectionUnit, quantity: number): number | null {
  if (unit === 'portions') {
    const fraction = portionFraction(recipe);
    return fraction ? fraction * quantity : null;
  }
  const weight = recipeWeight(recipe);
  if (unit === 'grams') return weight ? quantity / weight : null;
  return quantity;
}

function recipeQuantity(recipe: PantryRecipe, unit: SelectionUnit, batchFraction: number): number | null {
  if (unit === 'portions') {
    const fraction = portionFraction(recipe);
    return fraction ? batchFraction / fraction : null;
  }
  const weight = recipeWeight(recipe);
  if (unit === 'grams') return weight ? batchFraction * weight : null;
  return batchFraction;
}

export function leftoverPortionQuantity(recipe: PantryRecipe): number | null {
  const plan = recipe.portionPlan;
  if (plan?.status !== 'ok' || !plan.leftover || plan.leftoverMode !== 'SEPARATE') return null;
  return plan.leftover.fraction / plan.portion.fraction;
}

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
  const [unit, setUnit] = useState<SelectionUnit>('servings');

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
    } else if (next.kind === 'recipe') {
      const nextUnit = recipeUnits(next.item)[0];
      setUnit(nextUnit);
      const portion = next.item.portionPlan?.status === 'ok' ? next.item.portionPlan.portion : null;
      setQuantity(nextUnit === 'grams' ? formatAmount(portion?.grams ?? 100) : '1');
    } else {
      setUnit('servings');
      setQuantity('1');
    }
  }

  function deselect() {
    setSelected(null);
  }

  function changeUnit(next: SelectionUnit) {
    if (next === unit) return;
    if (selected?.kind === 'recipe') {
      const current = parseQuantity(quantity);
      const fraction = current ? recipeBatchFraction(selected.item, unit, current) : null;
      const converted = fraction != null ? recipeQuantity(selected.item, next, fraction) : null;
      if (converted != null) setQuantity(formatAmount(Math.round(converted * 100) / 100));
      setUnit(next);
      return;
    }
    if (selected?.kind !== 'product' || next === 'portions' || unit === 'portions') return;
    setQuantity(convertAmount(selected.item, quantity, unit, next));
    setUnit(next);
  }

  function pickLeftoverPortion() {
    if (selected?.kind !== 'recipe') return;
    const leftover = leftoverPortionQuantity(selected.item);
    if (leftover == null) return;
    setUnit('portions');
    setQuantity(formatAmount(Math.round(leftover * 100) / 100));
  }

  function step(direction: 1 | -1) {
    const current = parseQuantity(quantity) ?? 0;
    const increment = unit === 'grams' || unit === 'milliliters' ? 10 : current < 1 ? 0.5 : 1;
    const next = Math.max(increment, current + direction * increment);
    setQuantity(formatAmount(next));
  }

  const product = selected?.kind === 'product' ? selected.item : null;
  const parsed = parseQuantity(quantity);
  const unitOptions: SelectionUnit[] = product
    ? amountUnits(product)
    : selected?.kind === 'recipe'
      ? recipeUnits(selected.item)
      : [];

  let amount: SelectedAmount | null = null;
  let nutrition: CalculatedNutrition | null = null;

  const productPayload =
    selected?.kind === 'product' && parsed && unit !== 'portions' ? toAmountPayload(selected.item, parsed, unit) : null;
  const recipeFraction =
    selected?.kind === 'recipe' && parsed ? recipeBatchFraction(selected.item, unit, parsed) : null;

  if (selected?.kind === 'product' && productPayload && isAmountPayloadValid(productPayload)) {
    amount = { kind: 'product', product: selected.item, ...productPayload };
    nutrition = nutritionForAmount(selected.item, productPayload);
  } else if (selected?.kind === 'recipe' && parsed && recipeFraction) {
    amount =
      unit === 'portions'
        ? { kind: 'recipe', portions: parsed }
        : unit === 'grams'
          ? { kind: 'recipe', grams: parsed }
          : { kind: 'recipe', servings: parsed };
    const plan = selected.item.portionPlan;
    nutrition =
      unit === 'portions' && plan?.status === 'ok'
        ? scaleTotals(plan.portion, parsed)
        : scaleTotals(selected.item.totals, recipeFraction);
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
      if (amount.milliliters != null) payload.milliliters = amount.milliliters;
    } else if (amount.kind === 'recipe') {
      payload.pantryRecipeId = selected.item.id;
      if (amount.portions != null) payload.portions = amount.portions;
      else if (amount.grams != null) payload.grams = amount.grams;
      else payload.servings = amount.servings;
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
    pickLeftoverPortion,
    step,
    buildEntry,
  };
}
