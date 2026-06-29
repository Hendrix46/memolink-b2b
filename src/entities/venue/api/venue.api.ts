import { http } from '@/shared/api';
import type { Room, RoomInput, Venue, VenueInput } from '../model/types';

const venueBase = (eventId: string) => `/api/event/${eventId}/venue`;

export const venueApi = {
  /** All venues for an event, each with its rooms. */
  list(eventId: string): Promise<Venue[]> {
    return http.get<Venue[]>(venueBase(eventId));
  },

  // --- Venues ---
  create(eventId: string, body: VenueInput): Promise<Venue> {
    return http.post<Venue>(venueBase(eventId), body);
  },
  update(eventId: string, venueId: string, body: VenueInput): Promise<Venue> {
    return http.put<Venue>(`${venueBase(eventId)}/${venueId}`, body);
  },
  remove(eventId: string, venueId: string): Promise<void> {
    return http.delete<void>(`${venueBase(eventId)}/${venueId}`);
  },

  // --- Rooms (nested under a venue) ---
  createRoom(eventId: string, venueId: string, body: RoomInput): Promise<Room> {
    return http.post<Room>(`${venueBase(eventId)}/${venueId}/rooms`, body);
  },
  updateRoom(eventId: string, venueId: string, roomId: string, body: RoomInput): Promise<Room> {
    return http.put<Room>(`${venueBase(eventId)}/${venueId}/rooms/${roomId}`, body);
  },
  removeRoom(eventId: string, venueId: string, roomId: string): Promise<void> {
    return http.delete<void>(`${venueBase(eventId)}/${venueId}/rooms/${roomId}`);
  },
};
