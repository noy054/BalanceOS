import { create } from "zustand";
import { PantryProduct } from "./types";

type MealReturnStore = {
  pendingProduct: PantryProduct | null;
  setPending: (product: PantryProduct) => void;
  clearPending: () => void;
};

export const useMealReturn = create<MealReturnStore>((set) => ({
  pendingProduct: null,
  setPending: (product) => set({ pendingProduct: product }),
  clearPending: () => set({ pendingProduct: null }),
}));
