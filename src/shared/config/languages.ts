/** Supported UI languages — single source for the i18n init and the switcher. */
export const SUPPORTED_LANGUAGES = ['en', 'ru', 'uz'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  ru: 'Русский',
  uz: 'Oʻzbekcha',
};

/** Short code shown in the compact switcher button. */
export const LANGUAGE_SHORT: Record<AppLanguage, string> = {
  en: 'EN',
  ru: 'RU',
  uz: 'UZ',
};
