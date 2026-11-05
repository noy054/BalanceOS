import { create } from "zustand";

import { AmountUnit } from "./helpers/serving";

export type IngredientEditTarget = "savedMeal" | "recipe";

export type IngredientEditResult = {
  key: string;
  amount: string;
  unit: AmountUnit;
};

type IngredientEditStore = {
  pending: (IngredientEditResult & { target: IngredientEditTarget }) | null;
  setPending: (target: IngredientEditTarget, result: IngredientEditResult) => void;
  take: (target: IngredientEditTarget) => IngredientEditResult | null;
};

export function isIngredientEditTarget(value: string | undefined): value is IngredientEditTarget {
  return value === "savedMeal" || value === "recipe";
}

export const useIngredientEdit = create<IngredientEditStore>((set, get) => ({
  pending: null,
  setPending: (target, result) => set({ pending: { ...result, target } }),
  take: (target) => {
    const pending = get().pending;
    if (!pending || pending.target !== target) return null;
    set({ pending: null });
    return { key: pending.key, amount: pending.amount, unit: pending.unit };
  },
}));
