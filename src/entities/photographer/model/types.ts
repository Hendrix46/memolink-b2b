import type { PhotoAccessLevel } from '@/shared/config/status';

/**
 * `PhotographerProfileResponseContract` (changelog §11). The boolean field
 * is serialized as `public` on the wire (Jackson `isPublic` getter).
 */
export interface PhotographerProfile {
  userId: string;
  bio?: string | null;
  gear?: string | null;
  portfolioUrl?: string | null;
  photoFileId?: string | null;
  photoUrl?: string | null;
  public: boolean;
}

/** `PhotographerProfileRequestContract` (PUT body). */
export interface PhotographerProfileInput {
  bio?: string;
  gear?: string;
  portfolioUrl?: string;
  public: boolean;
}

/** `PhotographerAvailabilityResponseContract`. */
export interface PhotographerAvailability {
  id: number;
  startTime: string;
  endTime: string;
  note?: string | null;
}

/** `PhotographerAvailabilityRequestContract`. */
export interface PhotographerAvailabilityInput {
  startTime: string;
  endTime: string;
  note?: string;
}

/** `PhotographerPhotoResponseContract` — own photo with derived state. */
export interface PhotographerPhoto {
  eventPhotoId: string;
  fileId: string;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  accessLevel: PhotoAccessLevel;
  batchState: 'DRAFT' | 'DELIVERED';
  uploadBatchId?: string | null;
  processingStatus: 'PENDING' | 'READY' | 'FAILED';
  state?: string | null;
  dateCreated: string;
}
