import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { coverBackground } from '@/shared/lib/visual';
import { http } from './http-client';

/**
 * Presigned media URLs (backend buglist B1).
 *
 * The raw file/variant endpoints are bearer-gated, and `<img src>` cannot send
 * an Authorization header — so private (and in practice all) media never loads
 * when referenced directly. The backend exposes `/url` siblings that we fetch
 * WITH the bearer token; they return a short-lived presigned URL that works in
 * plain `<img>`/CSS. `204 No Content` means the media has no visual preview
 * (e.g. audio) → `null`.
 */

/** `MediaUrlResponseContract`. */
export interface MediaUrl {
  url: string;
  expiresAt?: string | null;
}

export type VariantSize = 'THUMBNAIL' | 'SMALL' | 'MEDIUM' | 'LARGE';

/** Presigned URLs are short-lived; refetch after ~4 minutes. */
const PRESIGN_STALE_MS = 4 * 60_000;

export const mediaUrlApi = {
  /** Presigned URL for an event-file variant (THUMBNAIL/SMALL/…); null when no preview. */
  async eventVariant(eventId: string, fileId: string, size: VariantSize): Promise<string | null> {
    const res = await http.get<MediaUrl>(`/api/event/${eventId}/file/${fileId}/variant/${size}/url`);
    return res?.url ?? null;
  },
  /** Presigned URL for the original event file. */
  async eventFile(eventId: string, fileId: string): Promise<string | null> {
    const res = await http.get<MediaUrl>(`/api/event/${eventId}/file/${fileId}/url`);
    return res?.url ?? null;
  },
  /** Presigned URL for the event poster (cover). */
  async eventPoster(eventId: string): Promise<string | null> {
    const res = await http.get<MediaUrl>(`/api/event/${eventId}/poster/url`);
    return res?.url ?? null;
  },
};

/** Presigned variant URL for `<img src>`; `null` while loading / when no preview. */
export function useEventVariantUrl(
  eventId: string | undefined,
  fileId: string | undefined,
  size: VariantSize,
  enabled = true,
): string | null {
  const { data } = useQuery({
    queryKey: queryKeys.mediaUrl.variant(eventId ?? '', fileId ?? '', size),
    queryFn: () => mediaUrlApi.eventVariant(eventId as string, fileId as string, size),
    enabled: enabled && Boolean(eventId && fileId),
    staleTime: PRESIGN_STALE_MS,
    retry: 1,
  });
  return data ?? null;
}

/**
 * CSS background for an event cover: the presigned poster when the event has
 * one (deterministic gradient while it loads / when absent). Cached per event,
 * so cards, rows and the detail hero share one request.
 */
export function useEventCoverBackground(
  eventId: string,
  posterFileId: string | null | undefined,
): string {
  const { data: url } = useQuery({
    queryKey: queryKeys.mediaUrl.poster(eventId),
    queryFn: () => mediaUrlApi.eventPoster(eventId),
    enabled: Boolean(posterFileId),
    staleTime: PRESIGN_STALE_MS,
    retry: 1,
  });
  return url
    ? `center / cover no-repeat url("${url}"), ${coverBackground(eventId)}`
    : coverBackground(eventId);
}
