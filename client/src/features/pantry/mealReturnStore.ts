import { create } from "zustand";
import { PantryProduct } from "./types";

export type ProductReturnTarget = "meal" | "savedMeal";

type MealReturnStore = {
  pending: { target: ProductReturnTarget; product: PantryProduct } | null;
  setPending: (target: ProductReturnTarget, product: PantryProduct) => void;
  take: (target: ProductReturnTarget) => PantryProduct | null;
};

export function isProductReturnTarget(value: string | undefined): value is ProductReturnTarget {
  return value === "meal" || value === "savedMeal";
}

export const useMealReturn = create<MealReturnStore>((set, get) => ({
  pending: null,
  setPending: (target, product) => set({ pending: { target, product } }),
  take: (target) => {
    const pending = get().pending;
    if (!pending || pending.target !== target) return null;
    set({ pending: null });
    return pending.product;
  },
}));
