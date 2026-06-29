import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { eventApi, type EventListFilters, type UpdateEventPayload } from '../api/event.api';
import type { EventSummary } from './types';

/** Paged event list, flattened to the current page's rows. */
export function useEvents(filters: EventListFilters = {}) {
  return useQuery<EventSummary[]>({
    queryKey: queryKeys.events.list(filters),
    queryFn: async () => (await eventApi.list(filters)).content,
  });
}

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId ?? ''),
    queryFn: () => eventApi.detail(eventId as string),
    enabled: Boolean(eventId),
  });
}

/** Update an event's core details (PUT /api/event/{id}); refreshes detail + lists. */
export function useUpdateEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEventPayload) => eventApi.update(eventId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
      qc.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

/** Add an existing user as an event host/co-host (POST …/host). */
export function useAddHost(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => eventApi.addHost(eventId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) }),
  });
}

/** Remove a co-host from the event (DELETE …/host/{userId}). */
export function useRemoveHost(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => eventApi.removeHost(eventId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) }),
  });
}
