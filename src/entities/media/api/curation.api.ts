import { http } from '@/shared/api';
import type { PagedResponse } from '@/shared/api';
import type { CurationState, ModerationStatus } from '@/shared/config/status';
import type { MediaAsset } from '../model/types';

/** `CurationPhotoResponseContract` (changelog §8). */
export interface CurationPhotoContract {
  eventPhotoId: string;
  fileId: string;
  thumbnailUrl?: string | null;
  uploadedByUserId?: string | null;
  uploaderFirstName?: string | null;
  uploaderLastName?: string | null;
  moderationStatus?: ModerationStatus | null;
  editorialState: CurationState;
  featuredRank?: number | null;
  reason?: string | null;
  dateCreated: string;
}

/** Bulk curation action (maps to backend APPROVED/REJECTED/FEATURED). */
export type BulkCurationAction = 'APPROVE' | 'REJECT' | 'FEATURE';

/** A curation photo plus its raw editorial fields, surfaced for the tile. */
export interface CurationPhoto extends MediaAsset {
  editorialState: CurationState;
  reason: string | null;
}

function uploaderName(c: CurationPhotoContract): string {
  const name = `${c.uploaderFirstName ?? ''} ${c.uploaderLastName ?? ''}`.trim();
  return name || c.uploadedByUserId || '—';
}

function toCurationPhoto(c: CurationPhotoContract, eventId: string): CurationPhoto {
  return {
    id: c.eventPhotoId,
    eventId,
    fileId: c.fileId,
    type: 'image',
    coverSeed: c.fileId,
    thumbnailUrl: c.thumbnailUrl ?? null,
    capturedAt: c.dateCreated,
    uploadedBy: uploaderName(c),
    featured: c.editorialState === 'FEATURED',
    processing: (c.moderationStatus ?? undefined) === 'PENDING',
    editorialState: c.editorialState,
    moderationStatus: c.moderationStatus ?? undefined,
    reason: c.reason ?? null,
    meta: { device: '', codec: '', quality: '', size: '' },
  };
}

export interface CurationPage {
  items: CurationPhoto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const base = (eventId: string) => `/api/event/${eventId}/curation/photos`;

export const curationApi = {
  async list(eventId: string, page = 1, size = 100): Promise<CurationPage> {
    const res = await http.get<PagedResponse<CurationPhotoContract>>(base(eventId), {
      query: { page, size },
    });
    return {
      items: res.content.map((c) => toCurationPhoto(c, eventId)),
      page: res.page,
      size: res.size,
      totalElements: res.totalElements,
      totalPages: res.totalPages,
    };
  },

  /** Update one photo's editorial state. `reason` is required when REJECTED. */
  updateOne(eventId: string, photoId: string, state: CurationState, reason?: string): Promise<void> {
    return http.patch<void>(`${base(eventId)}/${photoId}`, { state, reason });
  },

  /** All-or-nothing bulk action. `reason` is required when action is REJECT. */
  bulk(eventId: string, photoIds: string[], action: BulkCurationAction, reason?: string): Promise<void> {
    return http.post<void>(`${base(eventId)}/bulk`, { photoIds, action, reason });
  },
};
