import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Globe, Lock, Mail, Plus, Trash2 } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import {
  useAddGalleryInvite,
  useCreateGallery,
  useEventGalleries,
  useRemoveGalleryInvite,
  useUpdateGallery,
  type Gallery,
  type GalleryShareType,
} from '@/entities/gallery';
import { ApiError } from '@/shared/api';
import { cn } from '@/shared/lib/cn';
import { buildShareLink } from '@/shared/lib/gallery-link';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  SectionHeader,
  Select,
  Skeleton,
  Switch,
  toast,
} from '@/shared/ui';

const ACCESS: { key: GalleryShareType; i18nLabel: string; i18nDesc: string; icon: typeof Globe }[] = [
  { key: 'PUBLIC', i18nLabel: 'publicLink', i18nDesc: 'publicLinkDesc', icon: Globe },
  { key: 'PASSWORD', i18nLabel: 'password', i18nDesc: 'passwordDesc', icon: Lock },
  { key: 'INVITE_ONLY', i18nLabel: 'inviteOnly', i18nDesc: 'inviteOnlyDesc', icon: Mail },
];

export function DeliveryTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  const eventId = event.eventId;
  const galleriesQuery = useEventGalleries(eventId);
  const createGallery = useCreateGallery(eventId);

  const gallery = galleriesQuery.data?.[0];

  if (galleriesQuery.isError) {
    return <ErrorState onRetry={() => galleriesQuery.refetch()} />;
  }
  if (galleriesQuery.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.2fr_1fr]">
        <Skeleton height={320} radius={16} />
        <Skeleton height={320} radius={16} />
      </div>
    );
  }
  if (!gallery) {
    return (
      <EmptyState
        title={t('eventDetail.delivery.noGalleryTitle')}
        description={t('eventDetail.delivery.noGalleryDesc')}
        action={
          <Button
            variant="primary"
            leadingIcon={<Plus size={15} />}
            disabled={createGallery.isPending}
            onClick={() =>
              createGallery.mutate(
                { shareType: 'PUBLIC', downloadEnabled: true, downloadQuality: 'WEB' },
                {
                  onSuccess: () => toast.success(t('eventDetail.delivery.galleryCreated')),
                  onError: (e) =>
                    toast.error(e instanceof ApiError ? e.message : t('eventDetail.delivery.createFailed')),
                },
              )
            }
          >
            {t('eventDetail.delivery.createGallery')}
          </Button>
        }
      />
    );
  }

  return <GalleryEditor eventId={eventId} gallery={gallery} mediaCount={event.mediaCount} />;
}

function GalleryEditor({
  eventId,
  gallery,
  mediaCount,
}: {
  eventId: string;
  gallery: Gallery;
  mediaCount: number;
}) {
  const { t } = useTranslation();
  const updateGallery = useUpdateGallery(eventId);
  const addInvite = useAddGalleryInvite(eventId);
  const removeInvite = useRemoveGalleryInvite(eventId);

  const [shareType, setShareType] = useState<GalleryShareType>(gallery.shareType);
  const [password, setPassword] = useState('');
  const [downloadEnabled, setDownloadEnabled] = useState(gallery.downloadEnabled);
  const [downloadQuality, setDownloadQuality] = useState(gallery.downloadQuality ?? 'WEB');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    setShareType(gallery.shareType);
    setDownloadEnabled(gallery.downloadEnabled);
    setDownloadQuality(gallery.downloadQuality ?? 'WEB');
  }, [gallery]);

  const published = gallery.published;
  const link = buildShareLink(gallery.shareToken);

  const saveSettings = () => {
    updateGallery.mutate(
      {
        galleryId: gallery.galleryId,
        body: {
          shareType,
          password: shareType === 'PASSWORD' && password ? password : undefined,
          downloadEnabled,
          downloadQuality,
        },
      },
      {
        onSuccess: () => {
          setPassword('');
          toast.success(t('eventDetail.delivery.settingsSaved'));
        },
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : t('eventDetail.delivery.saveFailed')),
      },
    );
  };

  const togglePublish = () => {
    updateGallery.mutate(
      { galleryId: gallery.galleryId, body: { published: !published } },
      {
        onSuccess: () =>
          toast.success(
            !published
              ? t('eventDetail.delivery.published')
              : t('eventDetail.delivery.unpublished'),
          ),
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : t('eventDetail.delivery.saveFailed')),
      },
    );
  };

  const submitInvite = () => {
    const email = inviteEmail.trim();
    if (!email) return;
    addInvite.mutate(
      { galleryId: gallery.galleryId, email },
      {
        onSuccess: () => setInviteEmail(''),
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : t('eventDetail.delivery.inviteFailed')),
      },
    );
  };

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.2fr_1fr]">
      <Card className="space-y-5">
        <SectionHeader title={t('eventDetail.delivery.accessLevel')} />
        <div className="space-y-2">
          {ACCESS.map((a) => {
            const Icon = a.icon;
            const selected = shareType === a.key;
            return (
              <button
                key={a.key}
                onClick={() => setShareType(a.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[12px] border px-4 py-3 text-left transition-colors',
                  selected
                    ? 'border-accent bg-[rgba(102,112,255,0.1)]'
                    : 'border-border hover:border-border-strong',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg',
                    selected ? 'bg-accent text-white' : 'bg-surface-raised text-text-secondary',
                  )}
                >
                  <Icon size={17} />
                </span>
                <span className="flex-1">
                  <span className="block text-[13.5px] font-medium">
                    {t(`eventDetail.delivery.${a.i18nLabel}`)}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {t(`eventDetail.delivery.${a.i18nDesc}`)}
                  </span>
                </span>
                <span
                  className={cn(
                    'size-4 rounded-full border-2',
                    selected ? 'border-accent bg-accent' : 'border-border',
                  )}
                />
              </button>
            );
          })}
        </div>

        {shareType === 'PASSWORD' && (
          <Field label={t('eventDetail.delivery.passwordLabel')}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('eventDetail.delivery.passwordPh')}
            />
          </Field>
        )}

        {shareType === 'INVITE_ONLY' && (
          <div>
            <SectionHeader title={t('eventDetail.delivery.inviteList')} />
            <div className="flex gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('eventDetail.delivery.invitePh')}
                onKeyDown={(e) => e.key === 'Enter' && submitInvite()}
              />
              <Button
                variant="secondary"
                leadingIcon={<Plus size={15} />}
                disabled={!inviteEmail.trim() || addInvite.isPending}
                onClick={submitInvite}
              >
                {t('common.invite')}
              </Button>
            </div>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {gallery.inviteEmails.length === 0 ? (
                <p className="text-[12.5px] text-text-muted">{t('eventDetail.delivery.noInvites')}</p>
              ) : (
                gallery.inviteEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px]"
                  >
                    <span className="flex-1 truncate">{email}</span>
                    <IconButton
                      aria-label={t('common.remove')}
                      size="sm"
                      onClick={() =>
                        removeInvite.mutate({ galleryId: gallery.galleryId, email })
                      }
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Download policy */}
        <div className="space-y-3 rounded-[12px] border border-border bg-surface px-4 py-3">
          <label className="flex items-center justify-between gap-3 text-[13.5px]">
            {t('eventDetail.delivery.downloadEnabled')}
            <Switch
              checked={downloadEnabled}
              onChange={setDownloadEnabled}
              aria-label={t('eventDetail.delivery.downloadEnabled')}
            />
          </label>
          {downloadEnabled && (
            <Field label={t('eventDetail.delivery.downloadQuality')}>
              <Select
                value={downloadQuality}
                options={[
                  { value: 'WEB', label: t('eventDetail.delivery.qualityWeb') },
                  { value: 'FULL', label: t('eventDetail.delivery.qualityFull') },
                ]}
                onChange={(e) => setDownloadQuality(e.target.value as 'WEB' | 'FULL')}
              />
            </Field>
          )}
        </div>

        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            disabled={updateGallery.isPending}
            onClick={saveSettings}
          >
            {t('common.saveChanges')}
          </Button>
          <Button
            variant={published ? 'secondary' : 'primary'}
            fullWidth
            disabled={updateGallery.isPending}
            onClick={togglePublish}
          >
            {published ? t('eventDetail.delivery.unpublish') : t('eventDetail.delivery.publish')}
          </Button>
        </div>
      </Card>

      <Card className={cn('space-y-4', published && 'border-approved/30')}>
        <SectionHeader title={t('eventDetail.delivery.share')} />

        {!published && (
          <div className="rounded-[12px] border border-border bg-surface px-4 py-3">
            <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-wide text-text-muted">
              {t('eventDetail.delivery.readyToPublish')}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-text-secondary">
              <Check size={15} className="text-approved" />
              {t('eventDetail.delivery.readyNote', {
                count: mediaCount,
                access: t(`eventDetail.delivery.${ACCESS.find((a) => a.key === shareType)!.i18nLabel}`),
              })}
            </div>
          </div>
        )}

        <div
          className={cn(
            'rounded-[12px] border px-3 py-3 text-[13px]',
            published ? 'border-approved/40 bg-[rgba(61,214,140,0.06)]' : 'border-border bg-surface',
          )}
        >
          <div
            className="mb-1 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wide"
            style={{ color: published ? 'var(--color-approved)' : 'var(--color-text-muted)' }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: published ? 'var(--color-approved)' : 'var(--color-text-muted)' }}
            />
            {published ? t('eventDetail.delivery.live') : t('eventDetail.delivery.draftNotPublished')}
          </div>
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-[12.5px] text-text-secondary">{link}</span>
            <button
              aria-label={t('eventDetail.delivery.copyLink')}
              onClick={() => {
                void navigator.clipboard?.writeText(link);
                toast.success(t('eventDetail.delivery.linkCopied'));
              }}
              className="ml-auto flex size-7 flex-none items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted">{t('eventDetail.delivery.scanToOpen')}</p>
      </Card>
    </div>
  );
}
