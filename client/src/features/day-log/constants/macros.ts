import type { ComponentProps } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { MacroKey } from '../types';

type MacroConfig = {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  labelKey: string;
};

export const MACRO_CONFIG: Record<MacroKey, MacroConfig> = {
  protein: { icon: 'fire', labelKey: 'protein' },
  carbs: { icon: 'circle-double', labelKey: 'carbs' },
  fat: { icon: 'water', labelKey: 'fat' },
  fiber: { icon: 'leaf', labelKey: 'fiber' },
};
