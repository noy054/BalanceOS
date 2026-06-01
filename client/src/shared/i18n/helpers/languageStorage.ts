import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import i18n, { SupportedLanguage } from '../i18n';

const LANGUAGE_KEY = 'balanceos_language';

export async function saveLanguage(lang: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  const shouldBeRTL = lang === 'he';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }
  await i18n.changeLanguage(lang);
}

export async function loadSavedLanguage(): Promise<{ lang: SupportedLanguage; wasSet: boolean }> {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (saved === 'en' || saved === 'he') {
    return { lang: saved, wasSet: true };
  }
  return { lang: 'he', wasSet: false };
}
