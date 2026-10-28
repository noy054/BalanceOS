import { apiClient } from '../../../shared/api/client';
import { STATISTICS_ENDPOINTS } from '../constants';
import { StatRange, StatisticsResponse } from '../types';
import { todayKey } from '../../../shared/helpers/dateKey';

export const statisticsApi = {
  get(range: StatRange): Promise<StatisticsResponse> {
    return apiClient
      .get<StatisticsResponse>(STATISTICS_ENDPOINTS.BASE, { params: { range, endDate: todayKey() } })
      .then((r) => r.data);
  },
};
