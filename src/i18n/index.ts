// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en/common.json';
import noTranslations from '../locales/no/common.json';

const resources = {
  en: {
    common: enTranslations,
  },
  no: {
    common: noTranslations,
  },
};

i18n
  .use(LanguageDetector) // Detects browser language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    
    // Language settings
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    
    // Namespace settings
    defaultNS: 'common',
    ns: ['common'],
    
    // Detection settings
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Debug mode (set to false in production)
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;