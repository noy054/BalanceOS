import { MacroKey } from '../types';

type MacroConfig = {
  icon: string;
  labelKey: string;
};

export const MACRO_CONFIG: Record<MacroKey, MacroConfig> = {
  protein: { icon: 'arm-flex', labelKey: 'protein' },
  carbs: { icon: 'barley', labelKey: 'carbs' },
  fat: { icon: 'water', labelKey: 'fat' },
  fiber: { icon: 'leaf', labelKey: 'fiber' },
};
