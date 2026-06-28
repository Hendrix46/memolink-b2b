import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { eventApi, type EventListFilters } from '../api/event.api';
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
