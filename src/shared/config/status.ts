/**
 * Single source of truth for event status vocabulary and color.
 * Every event chip/badge derives its color + label from here — never inline a
 * status color anywhere else. Colors reference CSS variables so they stay in
 * lockstep with the Tailwind theme defined in global.css.
 *
 * Media has no review workflow — assets are uploaded and deleted only — so there
 * is no media status here.
 */

export type EventStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'shooting'
  | 'in-review'
  | 'delivered'
  | 'archived';

interface StatusMeta {
  label: string;
  /** CSS color value (token var). */
  color: string;
}

export const EVENT_STATUS: Record<EventStatus, StatusMeta> = {
  draft: { label: 'Draft', color: 'var(--color-text-muted)' },
  scheduled: { label: 'Scheduled', color: 'var(--color-processing)' },
  live: { label: 'Live', color: 'var(--color-approved)' },
  shooting: { label: 'Collecting', color: 'var(--color-approved)' },
  'in-review': { label: 'In progress', color: 'var(--color-pending)' },
  delivered: { label: 'Delivered', color: 'var(--color-accent-soft)' },
  archived: { label: 'Archived', color: 'var(--color-text-muted)' },
};

export const eventStatusMeta = (s: EventStatus): StatusMeta => EVENT_STATUS[s];
