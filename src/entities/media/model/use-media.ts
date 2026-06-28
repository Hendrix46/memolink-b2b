import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { mediaApi, type MediaQuery } from '../api/media.api';

const invalidate = (qc: ReturnType<typeof useQueryClient>, eventId: string) =>
  qc.invalidateQueries({ queryKey: ['events', 'media', eventId] });

export function useEventMedia(eventId: string | undefined, query: MediaQuery = {}) {
  return useQuery({
    queryKey: queryKeys.events.media(eventId ?? '', query),
    queryFn: () => mediaApi.listForEvent(eventId as string, query),
    enabled: Boolean(eventId),
  });
}

export function useRecentMedia(eventId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.events.media(eventId ?? ''), 'recent', limit],
    queryFn: () => mediaApi.recent(eventId as string, limit),
    enabled: Boolean(eventId),
  });
}

/** Organizer self-upload mutation; refreshes the event's media on success. */
export function useUploadMedia(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => mediaApi.upload(eventId, files),
    onSuccess: () => invalidate(qc, eventId),
  });
}

/** Delete assets; returns the removed ids. */
export function useDeleteMedia(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => mediaApi.remove(eventId, ids),
    onSuccess: () => invalidate(qc, eventId),
  });
}
