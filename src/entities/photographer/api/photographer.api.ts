import { http } from '@/shared/api';
import type { PagedResponse } from '@/shared/api';
import type { EventSummary } from '@/entities/event';
import type {
  PhotographerAvailability,
  PhotographerAvailabilityInput,
  PhotographerPhoto,
  PhotographerProfile,
  PhotographerProfileInput,
} from '../model/types';

const PROFILE = '/api/photographer/profile';
const AVAILABILITY = '/api/photographer/availability';

/**
 * Photographer profile, availability windows and own event photos.
 *
 * Note: the wire serializes the boolean `isPublic` getter as `public`
 * (Jackson), so both request and response use the `public` key.
 */
export const photographerApi = {
  // --- Profile ---
  getProfile(): Promise<PhotographerProfile> {
    return http.get<PhotographerProfile>(PROFILE);
  },
  updateProfile(body: PhotographerProfileInput): Promise<PhotographerProfile> {
    return http.put<PhotographerProfile>(PROFILE, body);
  },
  uploadPhoto(file: File): Promise<PhotographerProfile> {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<PhotographerProfile>(`${PROFILE}/photo`, undefined, { formData });
  },
  /** Public profile of another photographer (404 unless `public`). */
  getPublicProfile(userId: string): Promise<PhotographerProfile> {
    return http.get<PhotographerProfile>(`/api/photographer/${userId}/profile`);
  },

  // --- Availability windows ---
  listAvailability(): Promise<PhotographerAvailability[]> {
    return http.get<PhotographerAvailability[]>(AVAILABILITY);
  },
  addAvailability(body: PhotographerAvailabilityInput): Promise<PhotographerAvailability> {
    return http.post<PhotographerAvailability>(AVAILABILITY, body);
  },
  deleteAvailability(availabilityId: number): Promise<void> {
    return http.delete<void>(`${AVAILABILITY}/${availabilityId}`);
  },

  // --- Assignments (derived) ---
  /**
   * The photographer's assignment list. The backend exposes no dedicated
   * "my assignments" endpoint, so we derive it best-effort from the active
   * org's events (changelog §11 / §13 `GET /api/org/events`).
   */
  myEvents(page = 1, size = 50): Promise<PagedResponse<EventSummary>> {
    return http.get<PagedResponse<EventSummary>>('/api/org/events', { query: { page, size } });
  },

  /** Own photos for an event (incl. DRAFT), used to show upload progress. */
  myPhotos(eventId: string): Promise<PhotographerPhoto[]> {
    return http.get<PhotographerPhoto[]>(`/api/event/${eventId}/photographer/photos`);
  },

  /** Flip all of my DRAFT photos for an event to DELIVERED. */
  deliver(eventId: string): Promise<unknown> {
    return http.post<unknown>(`/api/event/${eventId}/photographer/photos/deliver`);
  },
};
