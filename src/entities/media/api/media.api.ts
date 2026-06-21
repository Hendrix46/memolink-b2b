import { resolve } from '@/shared/api/mock-client';
import type { MediaAsset, MediaType, MediaTypeCounts } from '../model/types';
import {
  addMediaToEvent,
  mediaForEvent,
  removeMediaFromEvent,
  restoreMediaToEvent,
} from './media.mock';

export interface MediaQuery {
  /** Restrict to a single media format. */
  type?: MediaType | 'all';
}

function applyFilter(assets: MediaAsset[], query: MediaQuery): MediaAsset[] {
  if (query.type && query.type !== 'all') return assets.filter((m) => m.type === query.type);
  return assets;
}

function countByType(assets: MediaAsset[]): MediaTypeCounts {
  return {
    all: assets.length,
    image: assets.filter((m) => m.type === 'image').length,
    video: assets.filter((m) => m.type === 'video').length,
    audio: assets.filter((m) => m.type === 'audio').length,
  };
}

export const mediaApi = {
  listForEvent(eventId: string, query: MediaQuery = {}): Promise<MediaAsset[]> {
    return resolve(() => applyFilter(mediaForEvent(eventId), query));
  },
  countsForEvent(eventId: string): Promise<MediaTypeCounts> {
    return resolve(() => countByType(mediaForEvent(eventId)), { delay: [80, 200] });
  },
  /** Most-recent strip used by dashboards/overviews. */
  recent(eventId: string, limit = 10): Promise<MediaAsset[]> {
    return resolve(() => mediaForEvent(eventId).slice(0, limit), { delay: [120, 320] });
  },
  /** Organizer self-upload — adds image/video/audio assets to the event. */
  upload(eventId: string, items: { type: MediaType; uploadedBy: string }[]): Promise<MediaAsset[]> {
    return resolve(() => addMediaToEvent(eventId, items), { delay: [600, 1200] });
  },
  /** Delete assets; returns the removed assets so the UI can offer undo. */
  remove(eventId: string, ids: string[]): Promise<MediaAsset[]> {
    return resolve(() => removeMediaFromEvent(eventId, ids), { delay: [200, 400] });
  },
  /** Restore previously deleted assets (undo). */
  restore(eventId: string, assets: MediaAsset[]): Promise<void> {
    return resolve(() => restoreMediaToEvent(eventId, assets), { delay: [120, 240] });
  },
};
