import { create } from "zustand";

type CalorieToneStore = {
  overTarget: boolean;
  setOverTarget: (overTarget: boolean) => void;
};

export const useCalorieToneStore = create<CalorieToneStore>((set) => ({
  overTarget: false,
  setOverTarget: (overTarget) => set({ overTarget }),
}));
