import { apiClient } from '../../../shared/api/client';
import { STATISTICS_ENDPOINTS } from '../constants';
import { StatRange, StatisticsResponse } from '../types';

export const statisticsApi = {
  get(range: StatRange): Promise<StatisticsResponse> {
    return apiClient
      .get<StatisticsResponse>(STATISTICS_ENDPOINTS.BASE, { params: { range } })
      .then((r) => r.data);
  },
};
