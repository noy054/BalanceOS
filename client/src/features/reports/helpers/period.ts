import { addDays, DateKey, endOfMonth, fromDateKey, startOfMonth } from "../../../shared/helpers/dateKey";
import { ReportPeriod } from "../types";

export function reportRange(
  period: ReportPeriod,
  anchor: DateKey,
  today: DateKey,
  weekStartsOn: 0 | 1,
): { from: DateKey; to: DateKey } {
  if (period === "day") return { from: anchor, to: anchor };

  if (period === "week") {
    const weekday = fromDateKey(anchor).getDay();
    const offset = (weekday - weekStartsOn + 7) % 7;
    const from = addDays(anchor, -offset);
    const end = addDays(from, 6);
    return { from, to: end > today ? today : end };
  }

  const from = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  return { from, to: end > today ? today : end };
}
