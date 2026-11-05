import { addDays, DateKey, fromDateKey } from "../../../shared/helpers/dateKey";
import { StatRange } from "../types";

const RANGE_DAYS: Record<StatRange, number> = { "7D": 7, "14D": 14, "30D": 30 };

export function weekStart(date: DateKey): DateKey {
  return addDays(date, -fromDateKey(date).getDay());
}

export function statisticsWindow(range: StatRange, today: DateKey, weekOffset: number) {
  if (range === "7D") {
    const start = addDays(weekStart(today), weekOffset * 7);
    return { start, end: addDays(start, 6) };
  }
  return { start: addDays(today, -(RANGE_DAYS[range] - 1)), end: today };
}
