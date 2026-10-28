import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getLocale } from "../../../shared/i18n";
import { DateKey, diffDays, fromDateKey } from "../../../shared/helpers/dateKey";

function format(date: Date, locale: string, options: Intl.DateTimeFormatOptions) {
  try {
    return date.toLocaleDateString(locale, options);
  } catch {
    return date.toDateString();
  }
}

export function useDayLabels(today: DateKey) {
  const { t, i18n } = useTranslation("dashboard");
  const locale = getLocale(i18n.language);

  const relative = useCallback(
    (key: DateKey) => {
      const offset = diffDays(today, key);
      if (offset === 0) return t("date.today");
      if (offset === -1) return t("date.yesterday");
      if (offset === 1) return t("date.tomorrow");
      return null;
    },
    [t, today],
  );

  const full = useCallback(
    (key: DateKey) => {
      const date = fromDateKey(key);
      const sameYear = date.getFullYear() === fromDateKey(today).getFullYear();
      return format(date, locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        ...(sameYear ? {} : { year: "numeric" }),
      });
    },
    [locale, today],
  );

  const short = useCallback(
    (key: DateKey) => {
      const date = fromDateKey(key);
      const sameYear = date.getFullYear() === fromDateKey(today).getFullYear();
      return format(date, locale, {
        day: "numeric",
        month: "short",
        ...(sameYear ? {} : { year: "numeric" }),
      });
    },
    [locale, today],
  );

  const title = useCallback(
    (key: DateKey) => relative(key) ?? format(fromDateKey(key), locale, { weekday: "long" }),
    [locale, relative],
  );

  const monthTitle = useCallback(
    (monthKey: DateKey) => format(fromDateKey(monthKey), locale, { month: "long", year: "numeric" }),
    [locale],
  );

  const weekdayInitials = useMemo(() => {
    const sunday = new Date(2026, 0, 4, 12);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + index);
      return {
        short: format(date, locale, { weekday: "narrow" }),
        long: format(date, locale, { weekday: "long" }),
      };
    });
  }, [locale]);

  return { relative, full, short, title, monthTitle, weekdayInitials };
}
