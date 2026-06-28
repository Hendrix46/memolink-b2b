/**
 * Notification domain types, aligned with the backend `NotificationResponseContract`
 * and `NotificationStatsResponseContract` (notification API).
 */

/** Backend `NotificationResponseContract.type` enum. */
export type NotificationType =
  | 'NEW_CAPSULE'
  | 'VIDEO_READY'
  | 'COMMENT'
  | 'MENTION'
  | 'CAPSULE_INVITE'
  | 'EVENT_INVITE'
  | 'EVENT_PENDING_ATTENDEE'
  | 'EVENT_UPDATE'
  | 'EVENT_REMINDER'
  | 'EVENT_CANCELLED'
  | 'EVENT_CHECKIN'
  | 'EVENT_JOIN_REQUEST'
  | 'EVENT_JOIN_APPROVED'
  | 'EVENT_JOIN_REJECTED'
  | 'DISCOVERY_SUBMISSION_APPROVED'
  | 'DISCOVERY_SUBMISSION_REJECTED'
  | 'DISCOVERY_EVENT_REMOVED'
  | 'DAILY_PROMPT'
  | 'DIGEST'
  | 'MODERATION_BLOCKED'
  | 'PHOTOGRAPHER_ASSIGNED'
  | 'PHOTOS_DELIVERED'
  | 'SESSION_STARTING';

/** `NotificationResponseContract` — a single in-app notification. */
export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  /** Extra key-value payload (may carry `eventId` for deep-linking). */
  data?: Record<string, unknown> | null;
  createdAt: string;
  readAt?: string | null;
  capsuleId?: string | null;
  read: boolean;
}

/** `NotificationStatsResponseContract`. */
export interface NotificationStats {
  totalCount: number;
  unreadCount: number;
}
