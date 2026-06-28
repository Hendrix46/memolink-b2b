import { http } from '@/shared/api';
import type { PagedResponse } from '@/shared/api';
import type { AppNotification, NotificationStats } from '../model/types';

const BASE = '/api/notification';

/** Tolerate either a paged envelope or a bare array for the list endpoint. */
type ListResponse = PagedResponse<AppNotification> | AppNotification[];

function toItems(res: ListResponse | null | undefined): AppNotification[] {
  if (Array.isArray(res)) return res;
  return res?.content ?? [];
}

export const notificationApi = {
  /** In-app notification feed (paged; `unreadOnly` filters server-side). */
  async list(unreadOnly = false, page = 1, size = 20): Promise<AppNotification[]> {
    const res = await http.get<ListResponse>(`${BASE}/list`, {
      query: { unreadOnly, page, size },
    });
    return toItems(res);
  },

  /** Aggregate counts used for the unread badge. */
  stats(): Promise<NotificationStats> {
    return http.get<NotificationStats>(`${BASE}/stats`);
  },

  /** Mark a single notification as read. */
  markRead(id: number): Promise<void> {
    return http.put<void>(`${BASE}/${id}/read`);
  },

  /** Mark every notification as read. */
  markAllRead(): Promise<void> {
    return http.put<void>(`${BASE}/read-all`);
  },
};
