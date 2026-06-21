/** Supported media formats — uploaded by the organizer's team. */
export type MediaType = 'image' | 'video' | 'audio';

export interface MediaAsset {
  id: string;
  eventId: string;
  type: MediaType;
  /** Seconds — videos and audio only. */
  durationSec?: number;
  coverSeed: string;
  capturedAt: string;
  /** Org team member who uploaded the asset. */
  uploadedBy: string;
  /** File metadata shown in the lightbox side panel. */
  meta: { device: string; codec: string; quality: string; size: string };
}

/** Per-type counts for the library breakdown / filter chips. */
export interface MediaTypeCounts {
  all: number;
  image: number;
  video: number;
  audio: number;
}

export const MEDIA_TYPE_META: Record<MediaType, { labelKey: string; accept: string }> = {
  image: { labelKey: 'media.type.image', accept: 'image/*' },
  video: { labelKey: 'media.type.video', accept: 'video/*' },
  audio: { labelKey: 'media.type.audio', accept: 'audio/*' },
};
