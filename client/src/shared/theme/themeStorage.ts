import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppThemeMode } from './colors';

const THEME_MODE_KEY = 'balanceos_theme_mode';

export async function saveThemeMode(mode: AppThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_MODE_KEY, mode);
}

export async function loadSavedThemeMode(): Promise<AppThemeMode | null> {
  const saved = await AsyncStorage.getItem(THEME_MODE_KEY);
  if (saved === 'LIGHT' || saved === 'DARK' || saved === 'SYSTEM') {
    return saved;
  }
  return null;
}
