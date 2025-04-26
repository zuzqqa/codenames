import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import pl from './pl.json';

/**
 * Initializes the i18n instance with language resources and settings.
 * 
 * - Supports English ('en') and Polish ('pl').
 * - Default language is English.
 * - Uses 'react-i18next' for integration with React.
 * - Disables escaping for values in translations.
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pl: { translation: pl },
  },
  lng: 'en', // Default language
  fallbackLng: 'en', // Fallback language if the selected one is unavailable
  interpolation: {
    escapeValue: false, // Prevents escaping of values
  },
});

export default i18n;