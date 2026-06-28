import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Copy, ExternalLink } from 'lucide-react';

import { useEvents } from '@/entities/event';
import { galleryApi, type Gallery } from '@/entities/gallery';
import { queryKeys } from '@/shared/config/query-keys';
import { coverFrom } from '@/shared/lib/visual';
import { buildShareLink } from '@/shared/lib/gallery-link';
import { Card, EmptyState, PageContainer, PageHeader, Skeleton, toast } from '@/shared/ui';
import { paths } from '@/shared/config/paths';

/**
 * Cross-event list of delivery galleries (changelog §7). The backend exposes no
 * org-wide gallery list, so this aggregates `GET /api/event/{eventId}/galleries`
 * across the org's events.
 */
export function OrgDeliveryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: events, isLoading: eventsLoading } = useEvents();

  const galleryQueries = useQueries({
    queries: (events ?? []).map((e) => ({
      queryKey: queryKeys.events.galleries(e.eventId),
      queryFn: () => galleryApi.listForEvent(e.eventId),
    })),
  });

  const galleriesLoading = galleryQueries.some((q) => q.isLoading);
  const isLoading = eventsLoading || (Boolean(events?.length) && galleriesLoading);

  const rows = useMemo(() => {
    const eventTitle = new Map((events ?? []).map((e) => [e.eventId, e]));
    const out: { gallery: Gallery; eventTitle: string; coverSeed: string; coverUrl?: string | null }[] = [];
    for (const q of galleryQueries) {
      for (const g of q.data ?? []) {
        const ev = eventTitle.get(g.eventId);
        out.push({
          gallery: g,
          eventTitle: ev?.title ?? g.eventId,
          coverSeed: g.eventId,
          coverUrl: ev?.coverPhotoUrl,
        });
      }
    }
    return out;
    // galleryQueries identity changes each render; depend on data length instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, galleryQueries.map((q) => q.dataUpdatedAt).join(',')]);

  const copyLink = (shareToken: string) => {
    void navigator.clipboard?.writeText(buildShareLink(shareToken));
    toast.success(t('orgDelivery.linkCopied'));
  };

  return (
    <PageContainer>
      <PageHeader title={t('orgDelivery.title')} description={t('orgDelivery.subtitle')} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={72} radius={14} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title={t('orgDelivery.noTitle')} description={t('orgDelivery.noDesc')} />
      ) : (
        <Card className="p-0">
          {rows.map(({ gallery, eventTitle, coverSeed, coverUrl }) => (
            <div
              key={gallery.galleryId}
              className="flex items-center gap-4 border-b border-hairline px-5 py-3.5 last:border-0"
            >
              <span
                className="size-11 flex-none rounded-[10px]"
                style={{ background: coverFrom(coverUrl, coverSeed) }}
              />
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => navigate(`${paths.event(gallery.eventId)}?tab=delivery`)}
                  className="truncate text-[14px] font-medium hover:text-accent"
                >
                  {gallery.title || eventTitle}
                </button>
                <div className="truncate font-mono text-[11.5px] text-text-muted">
                  {buildShareLink(gallery.shareToken)}
                </div>
              </div>
              <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                {t(`orgDelivery.shareType.${gallery.shareType}`)}
              </span>
              <span
                className="flex items-center gap-1.5 text-[12px] font-semibold"
                style={{
                  color: gallery.published ? 'var(--color-approved)' : 'var(--color-text-muted)',
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    background: gallery.published
                      ? 'var(--color-approved)'
                      : 'var(--color-text-muted)',
                  }}
                />
                {gallery.published ? t('orgDelivery.live') : t('orgDelivery.draft')}
              </span>
              <button
                aria-label={t('orgDelivery.copyLink')}
                onClick={() => copyLink(gallery.shareToken)}
                className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text"
              >
                <Copy size={15} />
              </button>
              <button
                aria-label={t('orgDelivery.openGallery')}
                onClick={() => navigate(`${paths.event(gallery.eventId)}?tab=delivery`)}
                className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text"
              >
                <ExternalLink size={15} />
              </button>
            </div>
          ))}
        </Card>
      )}
    </PageContainer>
  );
}
