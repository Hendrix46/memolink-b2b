import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { eventApi, type EventListFilters } from '../api/event.api';

export function useEvents(filters: EventListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.events.list(filters),
    queryFn: () => eventApi.list(filters),
  });
}

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId ?? ''),
    queryFn: () => eventApi.detail(eventId as string),
    enabled: Boolean(eventId),
  });
}
