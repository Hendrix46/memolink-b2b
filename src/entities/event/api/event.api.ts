import { http } from '@/shared/api';
import type { PagedResponse } from '@/shared/api';
import type { AccessLevel, EventStatus } from '@/shared/config/status';
import type {
  Attendee,
  EventAttendeeContract,
  EventDetail,
  EventHostContract,
  EventHostMember,
  EventSummary,
  GetEventResponseContract,
  MediaTypeBreakdown,
  OwnerDetailsContract,
  RsvpStatus,
} from '../model/types';

const BASE = '/api/event';

export interface EventListFilters {
  status?: EventStatus | 'all';
  search?: string;
  page?: number;
  size?: number;
  sortBy?: 'eventStartDate' | 'eventEndDate' | 'title' | 'dateCreated';
  sortDirection?: 'asc' | 'desc';
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  location: { name: string; address: string; latitude?: number; longitude?: number };
  accessLevel: AccessLevel;
  eventStartDate: string;
  eventEndDate: string;
  maxAttendees?: number;
  coHostUserIds?: string[];
  allowJoinRequests?: boolean;
  orgId?: string;
}

export type UpdateEventPayload = Partial<
  Pick<
    CreateEventPayload,
    'title' | 'description' | 'location' | 'accessLevel' | 'eventStartDate' | 'eventEndDate' | 'maxAttendees'
  >
> & { eventStatus?: EventStatus };

/** "First Last", falling back to phone/userId. */
function personName(p: { firstName?: string | null; lastName?: string | null; phoneNumber?: string | null; userId: string }): string {
  const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
  return name || p.phoneNumber || p.userId;
}

function mapHost(h: EventHostContract, creatorUserId: string | undefined): EventHostMember {
  return {
    id: h.eventHostId,
    name: personName(h),
    email: h.phoneNumber ?? h.userId,
    role: h.userId === creatorUserId ? 'owner' : 'manager',
    status: 'active',
  };
}

function mapAttendee(a: EventAttendeeContract): Attendee {
  return {
    id: a.attendeeId,
    name: personName(a),
    email: a.phoneNumber ?? a.userId,
    company: '',
    ticket: 'Standard',
    checkedIn: a.checkedIn,
  };
}

function mediaBreakdown(photos: GetEventResponseContract['photos']): MediaTypeBreakdown {
  const counts: MediaTypeBreakdown = { image: 0, video: 0, audio: 0 };
  for (const p of photos ?? []) {
    const t = (p.mediaType ?? 'image').toLowerCase();
    if (t.includes('video')) counts.video += 1;
    else if (t.includes('audio')) counts.audio += 1;
    else counts.image += 1;
  }
  return counts;
}

/** Adapt the rich detail contract into the event-detail view model. */
function toDetail(c: GetEventResponseContract): EventDetail {
  const creatorUserId = c.creator?.userId;
  const hosts = (c.hosts ?? []).map((h) => mapHost(h, creatorUserId));
  const attendees = (c.attendees ?? []).map(mapAttendee);
  const checkedIn = attendees.filter((a) => a.checkedIn).length;
  const creator: OwnerDetailsContract | undefined = c.creator ?? undefined;

  return {
    eventId: c.eventId,
    title: c.title,
    description: c.description ?? null,
    locationName: c.location?.name ?? null,
    accessLevel: c.accessLevel,
    eventStartDate: c.eventStartDate,
    eventEndDate: c.eventEndDate,
    eventStatus: c.eventStatus,
    maxAttendees: c.maxAttendees ?? null,
    currentAttendeeCount: c.currentAttendeeCount,
    coverPhotoUrl: c.coverPhotoUrl ?? null,
    posterFileId: c.posterFileId ?? null,
    dateCreated: c.dateCreated,
    allowJoinRequests: Boolean(c.allowJoinRequests),
    hostName: creator ? personName(creator) : (hosts[0]?.name ?? ''),
    mediaCount: c.photos?.length ?? 0,
    mediaBreakdown: mediaBreakdown(c.photos),
    attendees,
    registration: {
      total: c.currentAttendeeCount,
      capacity: c.maxAttendees ?? c.currentAttendeeCount,
      checkedIn,
      noShow: 0,
    },
    photographerTeam: [],
    hosts,
    agenda: [],
  };
}

export const eventApi = {
  /** Paged event list. Routes to /search when a status/text filter is active. */
  list(filters: EventListFilters = {}): Promise<PagedResponse<EventSummary>> {
    const { status, search, page = 1, size = 50, sortBy, sortDirection } = filters;
    const filtered = (status && status !== 'all') || Boolean(search);
    if (filtered) {
      return eventApi.search({ status, search, page, size, sortBy, sortDirection });
    }
    return http.get<PagedResponse<EventSummary>>(`${BASE}/list`, { query: { page, size } });
  },

  search(filters: EventListFilters = {}): Promise<PagedResponse<EventSummary>> {
    const { status, search, page = 1, size = 50, sortBy, sortDirection } = filters;
    return http.get<PagedResponse<EventSummary>>(`${BASE}/search`, {
      query: {
        query: search,
        status: status && status !== 'all' ? status : undefined,
        page,
        size,
        sortBy,
        sortDirection,
      },
    });
  },

  async detail(eventId: string): Promise<EventDetail> {
    const c = await http.get<GetEventResponseContract>(`${BASE}/${eventId}`);
    return toDetail(c);
  },

  create(payload: CreateEventPayload): Promise<GetEventResponseContract> {
    return http.post<GetEventResponseContract>(BASE, payload);
  },

  /** Upload the event cover/poster image (multipart). Post-create only. */
  uploadPoster(eventId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<void>(`${BASE}/${eventId}/poster`, undefined, { formData });
  },

  update(eventId: string, payload: UpdateEventPayload): Promise<GetEventResponseContract> {
    return http.put<GetEventResponseContract>(`${BASE}/${eventId}`, payload);
  },

  remove(eventId: string): Promise<void> {
    return http.delete<void>(`${BASE}/${eventId}`);
  },

  cancel(eventId: string, reason: string, notifyAttendees = true): Promise<void> {
    return http.post<void>(`${BASE}/${eventId}/cancel`, { reason, notifyAttendees });
  },

  rsvp(eventId: string, rsvpStatus: RsvpStatus): Promise<void> {
    return http.post<void>(`${BASE}/${eventId}/rsvp`, { rsvpStatus });
  },

  join(eventId: string): Promise<void> {
    return http.post<void>(`${BASE}/${eventId}/join`);
  },

  hosts(eventId: string): Promise<{ hosts: EventHostContract[] }> {
    return http.get<{ hosts: EventHostContract[] }>(`${BASE}/${eventId}/hosts`);
  },

  addHost(eventId: string, userId: string): Promise<void> {
    return http.post<void>(`${BASE}/${eventId}/host`, { userId });
  },

  removeHost(eventId: string, userId: string): Promise<void> {
    return http.delete<void>(`${BASE}/${eventId}/host/${userId}`);
  },

  attendees(eventId: string, page = 1, size = 50): Promise<PagedResponse<EventAttendeeContract>> {
    return http.get<PagedResponse<EventAttendeeContract>>(`${BASE}/${eventId}/attendees/paginated`, {
      query: { page, size },
    });
  },
};
