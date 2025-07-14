import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../locales/en/common.json';
import no from '../locales/no/common.json';

const resources = {
  en: {
    common: en
  },
  no: {
    common: no
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // ❌ REMOVE THIS LINE: lng: 'en', 
    // ✅ Let LanguageDetector handle it automatically
    fallbackLng: 'en', // Only used if detection fails
    debug: false,
    
    // Configure language detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Default namespace
    defaultNS: 'common',
    ns: ['common'],
  });

export default i18n;