import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enOnboarding from './locales/en/onboarding.json';
import enCommon from './locales/en/common.json';
import heAuth from './locales/he/auth.json';
import heOnboarding from './locales/he/onboarding.json';
import heCommon from './locales/he/common.json';

export type SupportedLanguage = 'he' | 'en';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['he', 'en'];

i18n.use(initReactI18next).init({
  resources: {
    en: { auth: enAuth, onboarding: enOnboarding, common: enCommon },
    he: { auth: heAuth, onboarding: heOnboarding, common: heCommon },
  },
  lng: 'he',
  fallbackLng: 'en',
  ns: ['auth', 'onboarding', 'common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
