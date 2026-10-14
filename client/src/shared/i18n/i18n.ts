import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enAuth from "./locales/en/auth.json";
import enOnboarding from "./locales/en/onboarding.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enPantry from "./locales/en/pantry.json";
import enSettings from "./locales/en/settings.json";
import enStatistics from "./locales/en/statistics.json";

import heAuth from "./locales/he/auth.json";
import heOnboarding from "./locales/he/onboarding.json";
import heCommon from "./locales/he/common.json";
import heDashboard from "./locales/he/dashboard.json";
import hePantry from "./locales/he/pantry.json";
import heSettings from "./locales/he/settings.json";
import heStatistics from "./locales/he/statistics.json";

export type SupportedLanguage = "he" | "en";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["he", "en"];

export const DEFAULT_LANGUAGE: SupportedLanguage = "he";

export function isSupportedLanguage(
  language: string | null | undefined,
): language is SupportedLanguage {
  return language === "he" || language === "en";
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
      statistics: enStatistics,
    },
    he: {
      auth: heAuth,
      onboarding: heOnboarding,
      common: heCommon,
      dashboard: heDashboard,
      pantry: hePantry,
      settings: heSettings,
      statistics: heStatistics,
    },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: "en",
  ns: ["auth", "onboarding", "common", "dashboard", "pantry", "settings", "statistics"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
