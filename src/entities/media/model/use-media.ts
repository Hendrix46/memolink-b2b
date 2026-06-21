import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { mediaApi, type MediaQuery } from '../api/media.api';
import type { MediaAsset, MediaType } from './types';

const invalidate = (qc: ReturnType<typeof useQueryClient>, eventId: string) =>
  qc.invalidateQueries({ queryKey: ['events', 'media', eventId] });

export function useEventMedia(eventId: string | undefined, query: MediaQuery = {}) {
  return useQuery({
    queryKey: queryKeys.events.media(eventId ?? '', query),
    queryFn: () => mediaApi.listForEvent(eventId as string, query),
    enabled: Boolean(eventId),
  });
}

export function useEventMediaCounts(eventId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.events.media(eventId ?? ''), 'counts'],
    queryFn: () => mediaApi.countsForEvent(eventId as string),
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
    mutationFn: (items: { type: MediaType; uploadedBy: string }[]) => mediaApi.upload(eventId, items),
    onSuccess: () => invalidate(qc, eventId),
  });
}

/** Delete assets; returns the removed assets so the caller can offer undo. */
export function useDeleteMedia(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => mediaApi.remove(eventId, ids),
    onSuccess: () => invalidate(qc, eventId),
  });
}

/** Restore previously deleted assets (undo of delete). */
export function useRestoreMedia(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assets: MediaAsset[]) => mediaApi.restore(eventId, assets),
    onSuccess: () => invalidate(qc, eventId),
  });
}
