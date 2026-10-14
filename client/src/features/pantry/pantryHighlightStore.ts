import { create } from "zustand";

type PantryHighlightStore = {
  highlightedProductId: string | null;
  setHighlight: (id: string) => void;
  clearHighlight: () => void;
};

export const usePantryHighlight = create<PantryHighlightStore>((set) => ({
  highlightedProductId: null,
  setHighlight: (id) => set({ highlightedProductId: id }),
  clearHighlight: () => set({ highlightedProductId: null }),
}));
