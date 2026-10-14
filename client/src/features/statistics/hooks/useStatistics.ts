import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../api/statisticsApi";
import { STATISTICS_QUERY_KEYS } from "../constants";
import { StatRange } from "../types";

export function useStatistics(range: StatRange) {
  return useQuery({
    queryKey: STATISTICS_QUERY_KEYS.stats(range),
    queryFn: () => statisticsApi.get(range),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
