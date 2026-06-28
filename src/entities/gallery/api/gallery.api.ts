import { http } from '@/shared/api';
import type { CreateGalleryInput, Gallery, UpdateGalleryInput } from '../model/types';

export const galleryApi = {
  // --- Event-scoped ---
  listForEvent(eventId: string): Promise<Gallery[]> {
    return http.get<Gallery[]>(`/api/event/${eventId}/galleries`);
  },
  create(eventId: string, body: CreateGalleryInput): Promise<Gallery> {
    return http.post<Gallery>(`/api/event/${eventId}/galleries`, body);
  },

  // --- Gallery-scoped ---
  get(galleryId: string): Promise<Gallery> {
    return http.get<Gallery>(`/api/gallery/${galleryId}`);
  },
  update(galleryId: string, body: UpdateGalleryInput): Promise<Gallery> {
    return http.patch<Gallery>(`/api/gallery/${galleryId}`, body);
  },
  remove(galleryId: string): Promise<void> {
    return http.delete<void>(`/api/gallery/${galleryId}`);
  },

  // --- INVITE_ONLY allow-list ---
  listInvites(galleryId: string): Promise<string[]> {
    return http.get<string[]>(`/api/gallery/${galleryId}/invites`);
  },
  addInvite(galleryId: string, email: string): Promise<Gallery> {
    return http.post<Gallery>(`/api/gallery/${galleryId}/invites`, { email });
  },
  removeInvite(galleryId: string, email: string): Promise<void> {
    return http.delete<void>(`/api/gallery/${galleryId}/invites/${encodeURIComponent(email)}`);
  },
};
