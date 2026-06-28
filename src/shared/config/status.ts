/**
 * Single source of truth for status vocabulary and color, aligned with the
 * Memolink backend enums (Frontend Integration Guide v4.1 §3, §8). Every
 * chip/badge derives its color + label from here — never inline a status color
 * anywhere else. Colors reference CSS variables so they stay in lockstep with
 * the Tailwind theme defined in global.css.
 */

interface StatusMeta {
  label: string;
  /** CSS color value (token var). */
  color: string;
}

/**
 * Backend `EventStatus` lifecycle: `UPCOMING → ONGOING → COMPLETED`, plus the
 * terminal `CANCELLED` (auto-advanced server-side by the scheduler).
 */
export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export const EVENT_STATUS: Record<EventStatus, StatusMeta> = {
  UPCOMING: { label: 'Upcoming', color: 'var(--color-processing)' },
  ONGOING: { label: 'Ongoing', color: 'var(--color-approved)' },
  COMPLETED: { label: 'Completed', color: 'var(--color-accent-soft)' },
  CANCELLED: { label: 'Cancelled', color: 'var(--color-rejected)' },
};

export const eventStatusMeta = (s: EventStatus): StatusMeta => EVENT_STATUS[s];

/** Backend `CapsuleAccessLevel` — an event is either public or private. */
export type AccessLevel = 'PUBLIC' | 'PRIVATE';

/** Backend `PhotoAccessLevel` — visibility scope of an uploaded photo. */
export type PhotoAccessLevel = 'PRIVATE_TO_ME' | 'EVENT_ATTENDEES_ONLY' | 'PUBLIC';

/**
 * Backend curation `editorialState` (Phase 56): an organizer's editorial
 * decision on an event photo. Independent of NSFW moderation state.
 */
export type CurationState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FEATURED';

export const CURATION_STATE: Record<CurationState, StatusMeta> = {
  PENDING: { label: 'Pending', color: 'var(--color-pending)' },
  APPROVED: { label: 'Approved', color: 'var(--color-approved)' },
  REJECTED: { label: 'Rejected', color: 'var(--color-rejected)' },
  FEATURED: { label: 'Featured', color: 'var(--color-featured)' },
};

export const curationStateMeta = (s: CurationState): StatusMeta => CURATION_STATE[s];

/**
 * Backend NSFW `moderationStatus` (Phase 56) — independent of editorial state.
 * Represented minimally; only `BLOCKED` is surfaced in the UI.
 */
export type ModerationStatus = 'PENDING' | 'APPROVED' | 'BLOCKED';
