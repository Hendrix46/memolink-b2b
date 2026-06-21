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

/** Seconds → "m:ss" clock, for video durations. */
export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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
