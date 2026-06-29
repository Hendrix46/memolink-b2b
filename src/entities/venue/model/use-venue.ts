import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { venueApi } from '../api/venue.api';
import type { RoomInput, VenueInput } from './types';

/** All venues (with rooms) for an event. */
export function useVenues(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events.venues(eventId ?? ''),
    queryFn: () => venueApi.list(eventId as string),
    enabled: Boolean(eventId),
  });
}

/** Invalidate the venue list after any venue/room mutation. */
function useVenueInvalidator(eventId: string) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: queryKeys.events.venues(eventId) });
}

export function useCreateVenue(eventId: string) {
  const invalidate = useVenueInvalidator(eventId);
  return useMutation({
    mutationFn: (body: VenueInput) => venueApi.create(eventId, body),
    onSuccess: invalidate,
  });
}

export function useUpdateVenue(eventId: string) {
  const invalidate = useVenueInvalidator(eventId);
  return useMutation({
    mutationFn: ({ venueId, body }: { venueId: string; body: VenueInput }) =>
      venueApi.update(eventId, venueId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteVenue(eventId: string) {
  const invalidate = useVenueInvalidator(eventId);
  return useMutation({
    mutationFn: (venueId: string) => venueApi.remove(eventId, venueId),
    onSuccess: invalidate,
  });
}

export function useCreateRoom(eventId: string) {
  const invalidate = useVenueInvalidator(eventId);
  return useMutation({
    mutationFn: ({ venueId, body }: { venueId: string; body: RoomInput }) =>
      venueApi.createRoom(eventId, venueId, body),
    onSuccess: invalidate,
  });
}

export function useUpdateRoom(eventId: string) {
  const invalidate = useVenueInvalidator(eventId);
  return useMutation({
    mutationFn: ({ venueId, roomId, body }: { venueId: string; roomId: string; body: RoomInput }) =>
      venueApi.updateRoom(eventId, venueId, roomId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteRoom(eventId: string) {
  const invalidate = useVenueInvalidator(eventId);
  return useMutation({
    mutationFn: ({ venueId, roomId }: { venueId: string; roomId: string }) =>
      venueApi.removeRoom(eventId, venueId, roomId),
    onSuccess: invalidate,
  });
}
