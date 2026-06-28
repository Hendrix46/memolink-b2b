/** Gallery share-access mode (changelog §7). */
export type GalleryShareType = 'PUBLIC' | 'PASSWORD' | 'INVITE_ONLY';

/** Download quality policy. */
export type GalleryDownloadQuality = 'WEB' | 'FULL';

/** `GalleryDetailResponseContract`. */
export interface Gallery {
  galleryId: string;
  shareToken: string;
  eventId: string;
  title?: string | null;
  published: boolean;
  shareType: GalleryShareType;
  expiresAt?: string | null;
  downloadEnabled: boolean;
  downloadQuality?: GalleryDownloadQuality | null;
  inviteEmails: string[];
}

/** `CreateGalleryRequestContract`. */
export interface CreateGalleryInput {
  title?: string;
  shareType: GalleryShareType;
  password?: string;
  expiresAt?: string;
  downloadEnabled?: boolean;
  downloadQuality?: GalleryDownloadQuality;
}

/** `UpdateGalleryRequestContract` (PATCH, all optional). */
export interface UpdateGalleryInput {
  title?: string;
  published?: boolean;
  shareType?: GalleryShareType;
  password?: string;
  expiresAt?: string;
  clearExpiry?: boolean;
  downloadEnabled?: boolean;
  downloadQuality?: GalleryDownloadQuality;
}
