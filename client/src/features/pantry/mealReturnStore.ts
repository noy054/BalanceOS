import { create } from "zustand";
import { PantryProduct } from "./types";

export type ProductReturnTarget = "meal" | "savedMeal";

export type SuperPick = {
  target: ProductReturnTarget;
  returnHref: { pathname: string; params: Record<string, string> };
};

type MealReturnStore = {
  pending: { target: ProductReturnTarget; product: PantryProduct } | null;
  superPick: SuperPick | null;
  setPending: (target: ProductReturnTarget, product: PantryProduct) => void;
  take: (target: ProductReturnTarget) => PantryProduct | null;
  startSuperPick: (pick: SuperPick) => void;
  endSuperPick: () => void;
};

export function isProductReturnTarget(value: string | undefined): value is ProductReturnTarget {
  return value === "meal" || value === "savedMeal";
}

export const useMealReturn = create<MealReturnStore>((set, get) => ({
  pending: null,
  superPick: null,
  setPending: (target, product) => set({ pending: { target, product } }),
  startSuperPick: (pick) => set({ superPick: pick }),
  endSuperPick: () => set({ superPick: null }),
  take: (target) => {
    const pending = get().pending;
    if (!pending || pending.target !== target) return null;
    set({ pending: null });
    return pending.product;
  },
}));
