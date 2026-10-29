import { useCallback } from "react";

import { addDays, DateKey } from "../../../shared/helpers/dateKey";
import { useTodayKey } from "../../../shared/hooks/useTodayKey";
import { MAX_FUTURE_DAYS } from "../constants";
import { useSelectedDateStore } from "../store/selectedDateStore";

export function useSelectedDate() {
  const today = useTodayKey();
  const stored = useSelectedDateStore((state) => state.selectedDate);
  const setStored = useSelectedDateStore((state) => state.setSelectedDate);

  const maxDate = addDays(today, MAX_FUTURE_DAYS);
  const date = stored && stored <= maxDate ? stored : today;

  const setDate = useCallback(
    (next: DateKey) => {
      if (next > maxDate) return;
      setStored(next === today ? null : next);
    },
    [setStored, today, maxDate],
  );

  const goToToday = useCallback(() => setStored(null), [setStored]);

  return { date, today, maxDate, isToday: date === today, setDate, goToToday };
}
