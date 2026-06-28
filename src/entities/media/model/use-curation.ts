import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CurationState } from '@/shared/config/status';
import {
  curationApi,
  type BulkCurationAction,
  type CurationPage,
} from '../api/curation.api';

const curationKey = (eventId: string) => ['events', 'curation', eventId] as const;

export function useCurationPhotos(eventId: string | undefined) {
  return useQuery<CurationPage>({
    queryKey: curationKey(eventId ?? ''),
    queryFn: () => curationApi.list(eventId as string),
    enabled: Boolean(eventId),
  });
}

/** Update a single photo's editorial state (reason required when REJECTED). */
export function useUpdateCuration(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ photoId, state, reason }: { photoId: string; state: CurationState; reason?: string }) =>
      curationApi.updateOne(eventId, photoId, state, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: curationKey(eventId) }),
  });
}

/** Bulk curation action (reason required when REJECT). */
export function useBulkCuration(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ photoIds, action, reason }: { photoIds: string[]; action: BulkCurationAction; reason?: string }) =>
      curationApi.bulk(eventId, photoIds, action, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: curationKey(eventId) }),
  });
}
