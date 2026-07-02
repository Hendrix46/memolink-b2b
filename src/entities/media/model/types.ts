import type { CurationState, ModerationStatus } from '@/shared/config/status';

/** Supported media formats — uploaded by the organizer's team or photographers. */
export type MediaType = 'image' | 'video' | 'audio';

export interface MediaAsset {
  id: string;
  eventId: string;
  /** Backing file id — used to presign display URLs (variant `/url` endpoints). */
  fileId: string;
  type: MediaType;
  /** Seconds — videos and audio only. */
  durationSec?: number;
  coverSeed: string;
  /** Real backend thumbnail; when absent the tile falls back to a gradient. */
  thumbnailUrl?: string | null;
  /** Larger variant (or original) shown full-screen in the lightbox. */
  previewUrl?: string | null;
  capturedAt: string;
  /** Org team member or photographer who uploaded the asset. */
  uploadedBy: string;
  /** Pinned to the top of the gallery (curation). */
  featured?: boolean;
  /** Still transcoding — not yet viewable in the gallery. */
  processing?: boolean;
  /** Organizer's editorial decision (curation / "My Uploads"). */
  editorialState?: CurationState;
  /** Independent NSFW moderation state. */
  moderationStatus?: ModerationStatus;
  /** File metadata shown in the lightbox side panel. */
  meta: { device: string; codec: string; quality: string; size: string };
}

export const MEDIA_TYPE_META: Record<MediaType, { labelKey: string; accept: string }> = {
  image: { labelKey: 'media.type.image', accept: 'image/*' },
  video: { labelKey: 'media.type.video', accept: 'video/*' },
  audio: { labelKey: 'media.type.audio', accept: 'audio/*' },
};
