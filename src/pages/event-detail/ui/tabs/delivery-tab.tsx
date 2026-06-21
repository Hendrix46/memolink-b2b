import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, ExternalLink, Globe, Lock, Mail, QrCode } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import { cn } from '@/shared/lib/cn';
import { Button, Card, SectionHeader, SuccessCheck, toast } from '@/shared/ui';

type Access = 'public' | 'password' | 'invite';

const ACCESS: { key: Access; i18nLabel: string; i18nDesc: string; icon: typeof Globe }[] = [
  { key: 'public', i18nLabel: 'publicLink', i18nDesc: 'publicLinkDesc', icon: Globe },
  { key: 'password', i18nLabel: 'password', i18nDesc: 'passwordDesc', icon: Lock },
  { key: 'invite', i18nLabel: 'inviteOnly', i18nDesc: 'inviteOnlyDesc', icon: Mail },
];

export function DeliveryTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  const [access, setAccess] = useState<Access>('public');
  const [published, setPublished] = useState(event.status === 'delivered');
  // Bumps on each publish so the success seal replays its draw + ping.
  const [publishTick, setPublishTick] = useState(0);
  const link = `https://gallery.memolink.app/${event.id}`;

  const togglePublish = () => {
    const next = !published;
    setPublished(next);
    if (next) {
      setPublishTick((n) => n + 1);
      toast.success(t('eventDetail.delivery.published'));
    } else {
      toast.info(t('eventDetail.delivery.unpublished'));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.2fr_1fr]">
      <Card className="space-y-5">
        <SectionHeader title={t('eventDetail.delivery.accessLevel')} />
        <div className="space-y-2">
          {ACCESS.map((a) => {
            const Icon = a.icon;
            const selected = access === a.key;
            return (
              <button
                key={a.key}
                onClick={() => setAccess(a.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[12px] border px-4 py-3 text-left transition-colors',
                  selected ? 'border-accent bg-[rgba(109,94,246,0.1)]' : 'border-border hover:border-border-strong',
                )}
              >
                <span className={cn('flex size-9 items-center justify-center rounded-lg', selected ? 'bg-accent text-white' : 'bg-surface-raised text-text-secondary')}>
                  <Icon size={17} />
                </span>
                <span className="flex-1">
                  <span className="block text-[13.5px] font-medium">{t(`eventDetail.delivery.${a.i18nLabel}`)}</span>
                  <span className="block text-xs text-text-muted">{t(`eventDetail.delivery.${a.i18nDesc}`)}</span>
                </span>
                <span className={cn('size-4 rounded-full border-2', selected ? 'border-accent bg-accent' : 'border-border')} />
              </button>
            );
          })}
        </div>

        {/* Pre-publish readiness */}
        {!published && (
          <div className="rounded-[12px] border border-border bg-surface px-4 py-3">
            <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-wide text-text-muted">
              {t('eventDetail.delivery.readyToPublish')}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-text-secondary">
              <Check size={15} className="text-approved" />
              {t('eventDetail.delivery.readyNote', {
                count: event.assetCount,
                access: t(`eventDetail.delivery.${ACCESS.find((a) => a.key === access)!.i18nLabel}`),
              })}
            </div>
          </div>
        )}

        <Button variant={published ? 'secondary' : 'primary'} fullWidth onClick={togglePublish}>
          {published ? t('eventDetail.delivery.unpublish') : t('eventDetail.delivery.publish')}
        </Button>
      </Card>

      <Card className={cn('space-y-4 transition-colors duration-500', published && 'border-approved/30')}>
        {published ? (
          <div className="flex flex-col items-center pb-1 pt-2 text-center">
            {/* key forces the seal to replay its draw + ping on each publish */}
            <SuccessCheck key={publishTick} ping size={60} />
            <h2 className="mt-3 text-[16px] font-semibold tracking-[-0.01em]">{t('eventDetail.delivery.publishedTitle')}</h2>
            <p className="mt-1 max-w-[260px] text-[13px] text-text-secondary">{t('eventDetail.delivery.publishedDesc')}</p>
          </div>
        ) : (
          <SectionHeader title={t('eventDetail.delivery.share')} />
        )}

        <div
          className={cn(
            'rounded-[12px] border px-3 py-3 text-[13px]',
            published ? 'border-approved/40 bg-[rgba(61,214,140,0.06)]' : 'border-border bg-surface',
          )}
        >
          <div className="mb-1 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: published ? 'var(--color-approved)' : 'var(--color-text-muted)' }}>
            <span className="size-1.5 rounded-full" style={{ background: published ? 'var(--color-approved)' : 'var(--color-text-muted)' }} />
            {published ? t('eventDetail.delivery.live') : t('eventDetail.delivery.draftNotPublished')}
          </div>
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-[12.5px] text-text-secondary">{link}</span>
            <button
              aria-label={t('eventDetail.delivery.copyLink')}
              onClick={() => toast.success(t('eventDetail.delivery.linkCopied'))}
              className="ml-auto flex size-7 flex-none items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-[12px] border border-border bg-surface py-6">
          <div className={cn('flex size-32 items-center justify-center rounded-xl bg-white text-base', published && 'animate-pop-in')}>
            <QrCode size={88} strokeWidth={1.2} />
          </div>
        </div>

        {published && (
          <Button variant="secondary" fullWidth leadingIcon={<ExternalLink size={15} />} onClick={() => toast.info(t('eventDetail.delivery.previewToast'))}>
            {t('eventDetail.delivery.previewAttendee')}
          </Button>
        )}
        <p className="text-center text-xs text-text-muted">{t('eventDetail.delivery.scanToOpen')}</p>
      </Card>
    </div>
  );
}
