import { create } from "zustand";

import { PantryProduct } from "./types";

type RecipeReturnStore = {
  pendingProduct: PantryProduct | null;
  setPending: (product: PantryProduct) => void;
  clearPending: () => void;
  reopenPicker: boolean;
  setReopenPicker: (v: boolean) => void;
  recipeFormMounted: boolean;
  setRecipeFormMounted: (v: boolean) => void;
};

export const useRecipeReturn = create<RecipeReturnStore>((set) => ({
  pendingProduct: null,
  setPending: (product) => set({ pendingProduct: product }),
  clearPending: () => set({ pendingProduct: null }),
  reopenPicker: false,
  setReopenPicker: (v) => set((state) => ({ reopenPicker: v && state.recipeFormMounted })),
  recipeFormMounted: false,
  setRecipeFormMounted: (v) =>
    set(v ? { recipeFormMounted: true } : { recipeFormMounted: false, reopenPicker: false }),
}));
