import { http } from '@/shared/api';
import type { CursorPage } from '@/shared/api';
import type { MediaAsset, MediaType } from '../model/types';

/**
 * `EventPhotoResponseContract` — a single uploaded event photo/asset as returned
 * by the live photos endpoints (`GET /api/event/{eventId}/photos`).
 */
export interface EventPhotoResponseContract {
  eventPhotoId: string;
  fileId: string;
  fileUrl?: string | null;
  fileName?: string | null;
  uploadedByUserId?: string | null;
  uploaderFirstName?: string | null;
  uploaderLastName?: string | null;
  uploaderAvatarUrl?: string | null;
  accessLevel?: string | null;
  mediaType?: string | null;
  dateCreated: string;
  thumbnailUrl?: string | null;
  smallUrl?: string | null;
  mediumUrl?: string | null;
  streamUrl?: string | null;
  processingStatus?: string | null;
  moderationBadge?: string | null;
}

export interface MediaQuery {
  /** Restrict to a single media format. */
  type?: MediaType | 'all';
}

const VIDEO_EXT = /\.(mp4|mov|m4v|webm|avi|mkv|hevc|3gp)$/i;
const AUDIO_EXT = /\.(m4a|mp3|wav|aac|ogg|oga|opus|flac|amr)$/i;

/**
 * Resolve the gallery type. The live `mediaType` field is frequently `null`, so
 * we fall back to the file extension (a `.m4a` voice note must not render as a
 * photo tile).
 */
function toMediaType(c: EventPhotoResponseContract): MediaType {
  const raw = (c.mediaType ?? '').toLowerCase();
  if (raw.includes('video')) return 'video';
  if (raw.includes('audio')) return 'audio';
  if (raw.includes('image')) return 'image';
  const name = c.fileName ?? '';
  if (VIDEO_EXT.test(name)) return 'video';
  if (AUDIO_EXT.test(name)) return 'audio';
  return 'image';
}

/**
 * Derivative-processing flag (D-07): only `PENDING` is still transcoding.
 * `READY`/`FAILED`/`null` are all terminal — the variant endpoint serves the
 * original (or nearest-ready) for those, so no spinner.
 */
function isProcessing(status?: string | null): boolean {
  return (status ?? '').toUpperCase() === 'PENDING';
}

function uploaderName(c: EventPhotoResponseContract): string {
  const name = `${c.uploaderFirstName ?? ''} ${c.uploaderLastName ?? ''}`.trim();
  return name || c.uploadedByUserId || '—';
}

/** Map a live event-photo contract onto the gallery's `MediaAsset` shape. */
export function toMediaAsset(c: EventPhotoResponseContract, eventId: string): MediaAsset {
  const type = toMediaType(c);
  // Audio has no image preview (the variant endpoint 204s); let the tile fall
  // back to its waveform over a gradient instead of a broken background.
  const thumbnailUrl =
    type === 'audio' ? null : (c.thumbnailUrl ?? c.mediumUrl ?? c.smallUrl ?? c.fileUrl ?? null);
  // Lightbox preview: prefer a larger variant, falling back to the original file.
  const previewUrl =
    type === 'audio' ? null : (c.mediumUrl ?? c.smallUrl ?? c.fileUrl ?? c.thumbnailUrl ?? null);
  return {
    id: c.eventPhotoId,
    eventId,
    fileId: c.fileId,
    type,
    coverSeed: c.fileId,
    thumbnailUrl,
    previewUrl,
    capturedAt: c.dateCreated,
    uploadedBy: uploaderName(c),
    processing: isProcessing(c.processingStatus),
    // The photos endpoint does not expose file metadata (size/codec/device).
    meta: { device: '—', codec: '—', quality: '—', size: '—' },
  };
}

function applyFilter(assets: MediaAsset[], query: MediaQuery): MediaAsset[] {
  if (query.type && query.type !== 'all') return assets.filter((m) => m.type === query.type);
  return assets;
}

const photosBase = (eventId: string) => `/api/event/${eventId}/photos`;

export const mediaApi = {
  /** Event gallery (cursor page, size 100). `query.type` filters client-side. */
  async listForEvent(eventId: string, query: MediaQuery = {}): Promise<MediaAsset[]> {
    const page = await http.get<CursorPage<EventPhotoResponseContract>>(photosBase(eventId), {
      query: { size: 100 },
    });
    return applyFilter(
      page.items.map((p) => toMediaAsset(p, eventId)),
      query,
    );
  },

  /** Most-recent strip used by dashboards/overviews. */
  async recent(eventId: string, limit = 10): Promise<MediaAsset[]> {
    const page = await http.get<CursorPage<EventPhotoResponseContract>>(photosBase(eventId), {
      query: { size: limit },
    });
    return page.items.map((p) => toMediaAsset(p, eventId));
  },

  /** Organizer self-upload — batch multipart upload of the selected files. */
  async upload(eventId: string, files: File[]): Promise<MediaAsset[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const created = await http.post<EventPhotoResponseContract[]>(`${photosBase(eventId)}/batch`, undefined, {
      formData,
    });
    return (created ?? []).map((p) => toMediaAsset(p, eventId));
  },

  /** Delete assets one-by-one; returns the removed ids. */
  async remove(eventId: string, ids: string[]): Promise<string[]> {
    await Promise.all(ids.map((id) => http.delete<void>(`/api/event/${eventId}/photo/${id}`)));
    return ids;
  },
};
