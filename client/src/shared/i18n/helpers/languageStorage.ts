import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { DEFAULT_LANGUAGE, SupportedLanguage, isSupportedLanguage } from '../i18n';

const LANGUAGE_KEY = 'balanceos_language';

export async function saveLanguage(lang: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

export async function loadSavedLanguage(): Promise<{ lang: SupportedLanguage; wasSet: boolean }> {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (isSupportedLanguage(saved)) {
    return { lang: saved, wasSet: true };
  }
  return { lang: DEFAULT_LANGUAGE, wasSet: false };
}
