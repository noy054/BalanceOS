import { DayLogSummary } from '../types';

export const mockDayLogSummary: DayLogSummary = {
  date: new Date().toISOString().split('T')[0],
  caloriesEaten: 980,
  caloriesTarget: 1400,
  macros: [
    { key: 'protein', current: 62, target: 90 },
    { key: 'carbs', current: 105, target: 140 },
    { key: 'fat', current: 28, target: 40 },
    { key: 'fiber', current: 18, target: 25 },
  ],
};
