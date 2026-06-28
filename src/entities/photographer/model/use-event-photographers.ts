import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import {
  eventPhotographersApi,
  type AssignPhotographerInput,
} from '../api/event-photographers.api';

export function useEventPhotographers(eventId: string | undefined, includeRemoved = false) {
  return useQuery({
    queryKey: queryKeys.events.photographers(eventId ?? '', includeRemoved),
    queryFn: () => eventPhotographersApi.list(eventId as string, includeRemoved),
    enabled: Boolean(eventId),
  });
}

export function useAssignPhotographer(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignPhotographerInput) => eventPhotographersApi.assign(eventId, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.events.photographers(eventId, false) }),
  });
}

export function useUnassignPhotographer(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => eventPhotographersApi.unassign(eventId, userId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.events.photographers(eventId, false) }),
  });
}
