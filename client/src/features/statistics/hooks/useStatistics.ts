import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../api/statisticsApi";
import { STATISTICS_QUERY_KEYS } from "../constants";
import { StatRange } from "../types";
import { useTodayKey } from "../../../shared/hooks/useTodayKey";

export function useStatistics(range: StatRange) {
  const endDate = useTodayKey();
  return useQuery({
    queryKey: STATISTICS_QUERY_KEYS.stats(range, endDate),
    queryFn: () => statisticsApi.get(range, endDate),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
