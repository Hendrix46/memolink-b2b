import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Camera, CheckCircle2, Send } from 'lucide-react';

import { IconButton } from '@/shared/ui';
import { paths } from '@/shared/config/paths';

interface Notification {
  id: string;
  icon: 'upload' | 'decision' | 'delivery';
  text: string;
  time: string;
  unread: boolean;
  /** Where clicking the notification takes the user. */
  to: string;
}

const NOTIFICATIONS: Notification[] = [
  { id: 'n1', icon: 'upload', text: 'Dana Whitfield uploaded 48 files to JetBrains Summit', time: '2m', unread: true, to: `${paths.event('evt_summit')}?tab=media` },
  { id: 'n2', icon: 'delivery', text: 'Fleet Launch Party gallery was published', time: '18m', unread: true, to: `${paths.event('evt_launch')}?tab=delivery` },
  { id: 'n3', icon: 'upload', text: 'Marco Bellini uploaded 23 files to KotlinConf Berlin', time: '1h', unread: true, to: `${paths.event('evt_kotlinconf')}?tab=media` },
  { id: 'n4', icon: 'decision', text: 'Developer Day APAC reached 1,204 registrations', time: '3h', unread: false, to: `${paths.event('evt_devday')}?tab=registrations` },
];

const ICONS = {
  upload: { Icon: Camera, color: 'var(--color-processing)' },
  decision: { Icon: CheckCircle2, color: 'var(--color-approved)' },
  delivery: { Icon: Send, color: 'var(--color-accent)' },
} as const;

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
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
              <button className="text-xs font-medium text-accent hover:text-accent-soft">
                {t('notifications.markAllRead')}
              </button>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {NOTIFICATIONS.map((n) => {
                const { Icon, color } = ICONS[n.icon];
                return (
                  <button
                    key={n.id}
                    onClick={() => go(n.to)}
                    className="flex w-full gap-3 border-b border-hairline px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-hover"
                  >
                    <span
                      className="flex size-8 flex-none items-center justify-center rounded-lg"
                      style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
                    >
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug">{n.text}</p>
                      <span className="mt-1 block font-mono text-[11px] text-text-muted">{n.time} ago</span>
                    </div>
                    {n.unread && <span className="mt-1.5 size-2 flex-none rounded-full bg-accent" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
