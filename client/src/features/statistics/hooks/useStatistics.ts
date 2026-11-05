import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../api/statisticsApi";
import { STATISTICS_QUERY_KEYS } from "../constants";
import { StatRange } from "../types";
import { statisticsWindow } from "../helpers/statsWindow";
import { useTodayKey } from "../../../shared/hooks/useTodayKey";

export function useStatistics(range: StatRange, weekOffset = 0, enabled = true) {
  const today = useTodayKey();
  const window = statisticsWindow(range, today, weekOffset);
  const query = useQuery({
    queryKey: STATISTICS_QUERY_KEYS.stats(range, window.end, today),
    queryFn: () => statisticsApi.get(range, window.end, today),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: keepPreviousData,
    enabled,
  });
  return { ...query, window, today };
}
