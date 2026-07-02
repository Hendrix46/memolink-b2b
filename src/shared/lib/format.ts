/** Presentation-only formatters. Pure, side-effect free, locale-aware. */

const NUMBER = new Intl.NumberFormat('en-US');

/** 1234 → "1,234" */
export const formatNumber = (value: number): string => NUMBER.format(value);

/** 12500 → "12.5k", 1_300_000 → "1.3M" */
export function formatCompact(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${trim(value / 1000)}k`;
  return `${trim(value / 1_000_000)}M`;
}

/** Bytes → human readable, base-1024. */
export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${trim(bytes / 1024 ** i, fractionDigits)} ${units[i]}`;
}

/** 0.732 → "73%" */
export const formatPercent = (ratio: number): string => `${Math.round(ratio * 100)}%`;

const DATE_RANGE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const DATE_SHORT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/**
 * Human date for an event from ISO `LocalDateTime` strings. Collapses a
 * single-day event to one date and spans multi-day events ("Jun 18 – 20, 2026").
 */
export function formatEventDate(start: string, end?: string | null): string {
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return start;
  if (!end) return DATE_RANGE.format(s);
  const e = new Date(end);
  if (Number.isNaN(e.getTime())) return DATE_RANGE.format(s);
  if (s.toDateString() === e.toDateString()) return DATE_RANGE.format(s);
  if (s.getFullYear() === e.getFullYear()) return `${DATE_SHORT.format(s)} – ${DATE_RANGE.format(e)}`;
  return `${DATE_RANGE.format(s)} – ${DATE_RANGE.format(e)}`;
}

/** Whole days from now until an ISO date (negative = past, 0 = today). */
export function daysUntil(iso: string): number {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return 0;
  const ms = target.getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

/** Seconds → "m:ss" clock, for video durations. */
export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const REL_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

/** Locale-aware "2 minutes ago" from an ISO/`LocalDateTime` string. */
export function formatRelativeTime(iso: string, locale = 'en'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  let duration = (date.getTime() - Date.now()) / 1000;
  for (const division of REL_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return iso;
}

/** Initials from a display name, max two letters. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function trim(value: number, digits = 1): string {
  return value
    .toFixed(digits)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
}

/** "First Last" from optional name parts, or `undefined` when both are empty. */
export function personFullName(
  firstName?: string | null,
  lastName?: string | null,
): string | undefined {
  const name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  return name || undefined;
}
