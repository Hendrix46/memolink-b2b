import { TEAM_MEMBERS } from '@/shared/api/people';
import type { MediaAsset, MediaType } from '../model/types';

const DEVICES = ['Sony A7 IV', 'Canon R5', 'iPhone 15 Pro', 'DJI Mic', 'Zoom H6'];
const CODECS = ['HEVC', 'H.264', 'ProRes', 'WAV', 'AAC'];

/** Deterministic media type by index — mostly images, some video, some audio. */
function typeFor(i: number): MediaType {
  if (i % 7 === 3) return 'video';
  if (i % 11 === 5) return 'audio';
  return 'image';
}

function qualityFor(type: MediaType): string {
  return type === 'audio' ? '48 kHz · 24-bit' : type === 'video' ? '4K · 60fps' : '6000×4000';
}

/**
 * Deterministic per-event media generator. Seeding by index keeps the grid
 * stable across renders while giving a realistic mix of uploaders and
 * image/video/audio. No status — media is upload-and-delete only.
 */
function generate(eventId: string, count: number): MediaAsset[] {
  return Array.from({ length: count }, (_, i) => {
    const uploader = TEAM_MEMBERS[i % TEAM_MEMBERS.length];
    const type = typeFor(i);
    const timed = type !== 'image';
    return {
      id: `${eventId}_m${i}`,
      eventId,
      type,
      durationSec: timed ? 20 + ((i * 13) % 180) : undefined,
      coverSeed: `${eventId}-asset-${i}`,
      capturedAt: `${9 + (i % 9)}:${(i * 7) % 60 < 10 ? '0' : ''}${(i * 7) % 60} AM`,
      uploadedBy: uploader.name,
      meta: {
        device: DEVICES[i % DEVICES.length],
        codec: CODECS[i % CODECS.length],
        quality: qualityFor(type),
        size: `${(4 + (i % 9) * 0.7).toFixed(1)} MB`,
      },
    } satisfies MediaAsset;
  });
}

const CACHE = new Map<string, MediaAsset[]>();

const keyFor = (eventId: string, count: number) => `${eventId}:${count}`;

/** Memoized so repeated reads of an event return identical asset objects. */
export function mediaForEvent(eventId: string, count = 48): MediaAsset[] {
  const key = keyFor(eventId, count);
  if (!CACHE.has(key)) CACHE.set(key, generate(eventId, count));
  return CACHE.get(key) as MediaAsset[];
}

let uploadSeq = 0;

/** Simulate an organizer upload by prepending fresh assets to the event. */
export function addMediaToEvent(eventId: string, items: { type: MediaType; uploadedBy: string }[]): MediaAsset[] {
  const list = mediaForEvent(eventId);
  const created = items.map((it, i) => {
    uploadSeq += 1;
    const timed = it.type !== 'image';
    return {
      id: `${eventId}_up${uploadSeq}`,
      eventId,
      type: it.type,
      durationSec: timed ? 30 + ((uploadSeq * 7) % 120) : undefined,
      coverSeed: `${eventId}-up-${uploadSeq}`,
      capturedAt: 'just now',
      uploadedBy: it.uploadedBy,
      meta: {
        device: DEVICES[i % DEVICES.length],
        codec: CODECS[i % CODECS.length],
        quality: qualityFor(it.type),
        size: `${(3 + i).toFixed(1)} MB`,
      },
    } satisfies MediaAsset;
  });
  list.unshift(...created);
  return created;
}

/** Remove assets by id; returns the removed assets (for undo). */
export function removeMediaFromEvent(eventId: string, ids: string[]): MediaAsset[] {
  const list = mediaForEvent(eventId);
  const idSet = new Set(ids);
  const removed: MediaAsset[] = [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (idSet.has(list[i].id)) removed.unshift(...list.splice(i, 1));
  }
  return removed;
}

/** Re-insert previously removed assets (undo of delete). */
export function restoreMediaToEvent(eventId: string, assets: MediaAsset[]): void {
  const list = mediaForEvent(eventId);
  list.unshift(...assets);
}
