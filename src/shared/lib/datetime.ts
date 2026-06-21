import { format, parse } from 'date-fns';
import { enUS, ru, uz, type Locale } from 'date-fns/locale';

const LOCALES: Record<string, Locale> = { en: enUS, ru, uz };

/** Map an app language code to a date-fns locale (falls back to English). */
export const dateFnsLocale = (lang: string): Locale => LOCALES[lang.split('-')[0]] ?? enUS;

const ISO = 'yyyy-MM-dd';

/** ISO date string ('yyyy-MM-dd') → Date, or undefined when empty/invalid. */
export function parseISODate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = parse(value, ISO, new Date(0));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Date → ISO date string for storage. */
export const toISODate = (date: Date): string => format(date, ISO);

/** Localized, human-readable date, e.g. "5 Jun 2026". */
export function formatLocalDate(value: string | undefined, lang: string): string | undefined {
  const date = parseISODate(value);
  return date ? format(date, 'd MMM yyyy', { locale: dateFnsLocale(lang) }) : undefined;
}
