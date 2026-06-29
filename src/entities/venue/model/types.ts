/**
 * Conference Venue domain contracts (Swagger: `Conference Venue`).
 * A venue belongs to an event and owns a (possibly nested) tree of rooms.
 */

/** `RoomResponseContract`. */
export interface Room {
  roomId: string;
  name: string;
  capacity?: number | null;
  /** Parent room id for nested spaces (e.g. a hall split into breakout rooms). */
  parentRoomId?: string | null;
  sortOrder: number;
}

/** `VenueResponseContract` — a venue plus its rooms. */
export interface Venue {
  venueId: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  rooms: Room[];
}

/** `VenueRequestContract`. */
export interface VenueInput {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

/** `RoomRequestContract`. */
export interface RoomInput {
  name: string;
  capacity?: number;
  parentRoomId?: string;
  sortOrder?: number;
}
