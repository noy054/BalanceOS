import { create } from "zustand";

import { addDays, DateKey } from "../../../shared/helpers/dateKey";

type SelectedDateStore = {
  selectedDate: DateKey | null;
  setSelectedDate: (date: DateKey | null) => void;
  shiftSelectedDate: (delta: number, today: DateKey, maxDate: DateKey) => void;
};

export const useSelectedDateStore = create<SelectedDateStore>((set) => ({
  selectedDate: null,
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  shiftSelectedDate: (delta, today, maxDate) =>
    set((state) => {
      const current = state.selectedDate && state.selectedDate <= maxDate ? state.selectedDate : today;
      const next = addDays(current, delta);
      if (next > maxDate) return state;
      return { selectedDate: next === today ? null : next };
    }),
}));
