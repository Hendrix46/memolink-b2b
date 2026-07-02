import type { AccessLevel, EventStatus } from '@/shared/config/status';

/** Backend `RSVPStatus` (changelog §3). */
export type RsvpStatus = 'INVITED' | 'GOING' | 'MAYBE' | 'NOT_GOING' | 'CANCELLED';

/** Viewer's relationship to an event, surfaced in summaries. */
export type EventViewerRole = 'HOST' | 'ATTENDEE' | 'INVITED' | 'OUTSIDER';

/**
 * `EventSummaryResponseContract` — the row shape returned by
 * `GET /api/event/list` and `GET /api/event/search` (changelog §3).
 */
export interface EventSummary {
  eventId: string;
  title: string;
  description?: string | null;
  locationName?: string | null;
  accessLevel: AccessLevel;
  eventStartDate: string;
  eventEndDate: string;
  eventStatus: EventStatus;
  maxAttendees?: number | null;
  currentAttendeeCount: number;
  hostCount: number;
  posterFileId?: string | null;
  coverPhotoUrl?: string | null;
  dateCreated: string;
  viewerRole?: EventViewerRole | null;
  rsvpStatus?: RsvpStatus | null;
  creatorUserId?: string | null;
}

/* ─────────────────────────── raw detail contracts ─────────────────────────── */

export interface EventLocationContract {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface OwnerDetailsContract {
  userId: string;
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export interface EventHostContract {
  eventHostId: string;
  userId: string;
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  dateCreated: string;
}

export interface EventAttendeeContract {
  attendeeId: string;
  userId: string;
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  rsvpStatus?: RsvpStatus | null;
  respondedAt?: string | null;
  checkedIn: boolean;
  checkedInAt?: string | null;
  checkedInByHostUserId?: string | null;
  dateCreated: string;
}

export interface EventPhotoContract {
  eventPhotoId: string;
  fileId: string;
  thumbnailUrl?: string | null;
  mediaType?: string | null;
  processingStatus?: string | null;
  dateCreated: string;
}

/** `GetEventResponseContract` — rich detail from `GET /api/event/{eventId}`. */
export interface GetEventResponseContract {
  eventId: string;
  title: string;
  description?: string | null;
  eventUrl?: string | null;
  location?: EventLocationContract | null;
  accessLevel: AccessLevel;
  allowJoinRequests?: boolean | null;
  discoveryStatus?: string | null;
  eventStartDate: string;
  eventEndDate: string;
  eventStatus: EventStatus;
  maxAttendees?: number | null;
  currentAttendeeCount: number;
  hosts?: EventHostContract[] | null;
  attendees?: EventAttendeeContract[] | null;
  posterFileId?: string | null;
  coverPhotoUrl?: string | null;
  files?: unknown[] | null;
  photos?: EventPhotoContract[] | null;
  creator?: OwnerDetailsContract | null;
  dateCreated: string;
  dateUpdated?: string | null;
  /** Caller's max per-file upload size for this event (500 MB, or 50 GB for an active photographer). */
  myFileUploadMaxBytes?: number | null;
  /** Whether the caller may use the resumable (50 GB) door — true only for an active photographer. */
  resumableUploadAllowed?: boolean | null;
  /** IANA zone the naive event times are local to (buglist E5). */
  timezone?: string | null;
}

/* ─────────────────────────── detail view model ─────────────────────────── */

/** Access role of an event host / co-host (view-model). */
export type HostRole = 'owner' | 'manager' | 'editor' | 'viewer';

export interface EventHostMember {
  id: string;
  /** Backend user id — needed to remove the host (`DELETE …/host/{userId}`). */
  userId: string;
  name: string;
  email: string;
  role: HostRole;
  status: 'active' | 'pending';
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  company: string;
  ticket: 'VIP' | 'Speaker' | 'Standard' | 'Staff';
  checkedIn: boolean;
}

/** Lifecycle of a photographer assigned to an event. */
export type PhotographerStatus = 'invited' | 'active' | 'done';

export interface EventPhotographer {
  id: string;
  name: string;
  email: string;
  status: PhotographerStatus;
  uploadCount: number;
  lastUpload: string;
  quota: number;
}

export interface AgendaSession {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  room: string;
  track: string;
  /** Track accent color. */
  color: string;
}

/** Per-type media breakdown for the overview library panel. */
export interface MediaTypeBreakdown {
  image: number;
  video: number;
  audio: number;
}

/**
 * Event-detail view model. Core fields mirror `GetEventResponseContract`;
 * design-only collections are mapped from the contract where data exists and
 * fall back to empty/derived values otherwise.
 */
export interface EventDetail {
  eventId: string;
  title: string;
  description: string | null;
  locationName: string | null;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  accessLevel: AccessLevel;
  eventStartDate: string;
  eventEndDate: string;
  eventStatus: EventStatus;
  maxAttendees: number | null;
  currentAttendeeCount: number;
  coverPhotoUrl: string | null;
  posterFileId: string | null;
  dateCreated: string;
  allowJoinRequests: boolean;
  /** Display name of the creator (event owner). */
  hostName: string;
  /** Total photos collected (gallery media count). */
  mediaCount: number;
  mediaBreakdown: MediaTypeBreakdown;
  attendees: Attendee[];
  registration: { total: number; capacity: number; checkedIn: number; noShow: number };
  /** Event-scoped photographer crew (empty until the assignment API is wired). */
  photographerTeam: EventPhotographer[];
  /** Owner + co-hosts (Hosts tab). */
  hosts: EventHostMember[];
  /** Conference agenda highlights (empty until the agenda API is wired). */
  agenda: AgendaSession[];
  /** Caller's max per-file upload size (bytes), or null when the API doesn't report it. */
  uploadMaxBytes: number | null;
  /** Whether the caller may use the resumable (50 GB) upload door (active photographer). */
  resumableUploadAllowed: boolean;
  /** IANA zone the naive event times are local to (null on older backends). */
  timezone: string | null;
}
