import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { galleryApi } from '../api/gallery.api';
import type { CreateGalleryInput, UpdateGalleryInput } from './types';

/** Galleries created from an event's eligible media. */
export function useEventGalleries(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events.galleries(eventId ?? ''),
    queryFn: () => galleryApi.listForEvent(eventId as string),
    enabled: Boolean(eventId),
  });
}

export function useCreateGallery(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGalleryInput) => galleryApi.create(eventId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.galleries(eventId) }),
  });
}

export function useUpdateGallery(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ galleryId, body }: { galleryId: string; body: UpdateGalleryInput }) =>
      galleryApi.update(galleryId, body),
    onSuccess: (gallery) => {
      qc.invalidateQueries({ queryKey: queryKeys.events.galleries(eventId) });
      qc.invalidateQueries({ queryKey: queryKeys.gallery.detail(gallery.galleryId) });
    },
  });
}

export function useDeleteGallery(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (galleryId: string) => galleryApi.remove(galleryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.galleries(eventId) }),
  });
}

export function useAddGalleryInvite(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ galleryId, email }: { galleryId: string; email: string }) =>
      galleryApi.addInvite(galleryId, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.galleries(eventId) }),
  });
}

export function useRemoveGalleryInvite(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ galleryId, email }: { galleryId: string; email: string }) =>
      galleryApi.removeInvite(galleryId, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.galleries(eventId) }),
  });
}
