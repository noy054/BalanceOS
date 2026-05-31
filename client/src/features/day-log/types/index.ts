export type MacroKey = 'protein' | 'carbs' | 'fat' | 'fiber';

export type MacroItem = {
  key: MacroKey;
  current: number;
  target: number;
};

export type DayLogSummary = {
  date: string;
  caloriesEaten: number;
  caloriesTarget: number;
  macros: MacroItem[];
};
