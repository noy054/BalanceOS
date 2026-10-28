import { create } from "zustand";

import { DateKey } from "../../../shared/helpers/dateKey";

type SelectedDateStore = {
  selectedDate: DateKey | null;
  setSelectedDate: (date: DateKey | null) => void;
};

export const useSelectedDateStore = create<SelectedDateStore>((set) => ({
  selectedDate: null,
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
