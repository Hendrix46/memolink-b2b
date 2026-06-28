import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  BellOff,
  Calendar,
  Camera,
  CheckCircle2,
  MessageSquare,
  Send,
  ShieldAlert,
  Video,
  type LucideIcon,
} from 'lucide-react';

import {
  useNotifications,
  useNotificationStats,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  type AppNotification,
  type NotificationType,
} from '@/entities/notification';
import { IconButton, Skeleton } from '@/shared/ui';
import { formatRelativeTime } from '@/shared/lib/format';
import { paths } from '@/shared/config/paths';

interface IconMeta {
  Icon: LucideIcon;
  color: string;
}

/** Map a backend notification `type` onto an icon + accent color. */
function iconFor(type: NotificationType): IconMeta {
  switch (type) {
    case 'NEW_CAPSULE':
    case 'PHOTOGRAPHER_ASSIGNED':
      return { Icon: Camera, color: 'var(--color-processing)' };
    case 'VIDEO_READY':
      return { Icon: Video, color: 'var(--color-processing)' };
    case 'PHOTOS_DELIVERED':
      return { Icon: Send, color: 'var(--color-accent)' };
    case 'COMMENT':
    case 'MENTION':
      return { Icon: MessageSquare, color: 'var(--color-accent)' };
    case 'MODERATION_BLOCKED':
    case 'EVENT_CANCELLED':
    case 'DISCOVERY_SUBMISSION_REJECTED':
    case 'EVENT_JOIN_REJECTED':
    case 'DISCOVERY_EVENT_REMOVED':
      return { Icon: ShieldAlert, color: 'var(--color-rejected)' };
    case 'EVENT_JOIN_APPROVED':
    case 'DISCOVERY_SUBMISSION_APPROVED':
    case 'EVENT_CHECKIN':
      return { Icon: CheckCircle2, color: 'var(--color-approved)' };
    case 'EVENT_INVITE':
    case 'EVENT_UPDATE':
    case 'EVENT_REMINDER':
    case 'EVENT_PENDING_ATTENDEE':
    case 'EVENT_JOIN_REQUEST':
    case 'SESSION_STARTING':
      return { Icon: Calendar, color: 'var(--color-accent-soft)' };
    default:
      return { Icon: Bell, color: 'var(--color-text-muted)' };
  }
}

/** Best-effort deep link from the notification payload. */
function targetFor(n: AppNotification): string | null {
  const eventId = n.data?.eventId;
  if (typeof eventId === 'string' && eventId) return paths.event(eventId);
  return null;
}

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading } = useNotifications();
  const { data: stats } = useNotificationStats();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unread = stats?.unreadCount ?? notifications.filter((n) => !n.read).length;

  const onItemClick = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    const to = targetFor(n);
    if (to) {
      setOpen(false);
      navigate(to);
    }
  };

  return (
    <div className="relative">
      <IconButton aria-label={t('notifications.title')} onClick={() => setOpen((v) => !v)}>
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-base bg-rejected px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </IconButton>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="animate-in absolute right-0 top-[46px] z-40 w-[340px] overflow-hidden rounded-[12px] border border-border bg-surface-raised shadow-[var(--shadow-pop)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">{t('notifications.title')}</span>
              {unread > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="text-xs font-medium text-accent hover:text-accent-soft disabled:opacity-50"
                >
                  {t('notifications.markAllRead')}
                </button>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} height={52} radius={10} />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-text-muted">
                  <BellOff size={22} />
                  <span className="text-[13px]">{t('notifications.empty')}</span>
                </div>
              ) : (
                notifications.map((n) => {
                  const { Icon, color } = iconFor(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => onItemClick(n)}
                      className="flex w-full gap-3 border-b border-hairline px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-hover"
                    >
                      <span
                        className="flex size-8 flex-none items-center justify-center rounded-lg"
                        style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
                      >
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium leading-snug">{n.title}</p>
                        {n.body && <p className="mt-0.5 text-[12.5px] leading-snug text-text-secondary">{n.body}</p>}
                        <span className="mt-1 block font-mono text-[11px] text-text-muted">
                          {formatRelativeTime(n.createdAt, i18n.language)}
                        </span>
                      </div>
                      {!n.read && <span className="mt-1.5 size-2 flex-none rounded-full bg-accent" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
