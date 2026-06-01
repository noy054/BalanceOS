import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enAuth from "./locales/en/auth.json";
import enOnboarding from "./locales/en/onboarding.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enPantry from "./locales/en/pantry.json";
import enSettings from "./locales/en/settings.json";

import heAuth from "./locales/he/auth.json";
import heOnboarding from "./locales/he/onboarding.json";
import heCommon from "./locales/he/common.json";
import heDashboard from "./locales/he/dashboard.json";
import hePantry from "./locales/he/pantry.json";
import heSettings from "./locales/he/settings.json";

export type SupportedLanguage = "he" | "en";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["he", "en"];

export const DEFAULT_LANGUAGE: SupportedLanguage = "he";

const LANGUAGE_STORAGE_KEY = "balanceos_language";

export function isSupportedLanguage(
  language: string | null | undefined,
): language is SupportedLanguage {
  return language === "he" || language === "en";
}

export function isRTL(language: string | null | undefined = i18n.language) {
  return language === "he";
}

export function getTextAlign(
  language: string | null | undefined = i18n.language,
) {
  return isRTL(language) ? "right" : "left";
}

export function getWritingDirection(
  language: string | null | undefined = i18n.language,
) {
  return isRTL(language) ? "rtl" : "ltr";
}

function applyDirection(language: SupportedLanguage) {
  const shouldBeRTL = isRTL(language);

  I18nManager.allowRTL(true);
  I18nManager.forceRTL(shouldBeRTL);
}

export async function getSavedLanguage(): Promise<SupportedLanguage | null> {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (!isSupportedLanguage(savedLanguage)) {
    return null;
  }

  return savedLanguage;
}

export async function saveLanguage(language: SupportedLanguage) {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);

  applyDirection(language);

  await i18n.changeLanguage(language);
}

export async function loadSavedLanguage() {
  const savedLanguage = await getSavedLanguage();
  const language = savedLanguage ?? DEFAULT_LANGUAGE;

  applyDirection(language);

  if (i18n.language !== language) {
    await i18n.changeLanguage(language);
  }

  return language;
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      auth: enAuth,
      onboarding: enOnboarding,
      common: enCommon,
      dashboard: enDashboard,
      pantry: enPantry,
      settings: enSettings,
    },
    he: {
      auth: heAuth,
      onboarding: heOnboarding,
      common: heCommon,
      dashboard: heDashboard,
      pantry: hePantry,
      settings: heSettings,
    },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: "en",
  ns: ["auth", "onboarding", "common", "dashboard", "pantry", "settings"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
