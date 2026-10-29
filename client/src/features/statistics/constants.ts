import { DateKey } from '../../shared/helpers/dateKey';
import { StatRange } from './types';

export const STATISTICS_ENDPOINTS = {
  BASE: '/statistics',
} as const;

export const STATISTICS_QUERY_KEYS = {
  stats: (range: StatRange, endDate: DateKey) => ['statistics', range, endDate] as const,
};

export const STAT_RANGES: StatRange[] = ['7D', '14D', '30D'];
