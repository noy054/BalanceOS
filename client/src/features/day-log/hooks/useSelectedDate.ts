import { useCallback } from "react";

import { DateKey } from "../../../shared/helpers/dateKey";
import { useTodayKey } from "../../../shared/hooks/useTodayKey";
import { useSelectedDateStore } from "../store/selectedDateStore";

export function useSelectedDate() {
  const today = useTodayKey();
  const stored = useSelectedDateStore((state) => state.selectedDate);
  const setStored = useSelectedDateStore((state) => state.setSelectedDate);

  const date = stored ?? today;

  const setDate = useCallback(
    (next: DateKey) => setStored(next === today ? null : next),
    [setStored, today],
  );

  const goToToday = useCallback(() => setStored(null), [setStored]);

  return { date, today, isToday: date === today, setDate, goToToday };
}
