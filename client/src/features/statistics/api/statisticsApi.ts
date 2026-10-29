import { apiClient } from '../../../shared/api/client';
import { STATISTICS_ENDPOINTS } from '../constants';
import { StatRange, StatisticsResponse } from '../types';
import { DateKey } from '../../../shared/helpers/dateKey';

export const statisticsApi = {
  get(range: StatRange, endDate: DateKey): Promise<StatisticsResponse> {
    return apiClient
      .get<StatisticsResponse>(STATISTICS_ENDPOINTS.BASE, { params: { range, endDate } })
      .then((r) => r.data);
  },
};
