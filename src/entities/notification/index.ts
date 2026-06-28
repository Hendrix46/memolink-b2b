export { notificationApi } from './api/notification.api';
export type { AppNotification, NotificationType, NotificationStats } from './model/types';
export {
  useNotifications,
  useNotificationStats,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from './model/use-notifications';
