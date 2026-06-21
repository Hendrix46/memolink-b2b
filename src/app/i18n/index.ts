import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { SUPPORTED_LANGUAGES } from '@/shared/config/languages';
import en from './locales/en.json';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

// Single shared i18next instance. Components consume it via `useTranslation`
// from react-i18next — no app-layer import needed at the leaves.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uz: { translation: uz },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'memolink.lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
