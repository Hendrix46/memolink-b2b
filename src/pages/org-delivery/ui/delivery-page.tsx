import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copy, ExternalLink } from 'lucide-react';

import { useEvents } from '@/entities/event';
import { coverBackground } from '@/shared/lib/visual';
import { Card, EmptyState, PageContainer, PageHeader, Skeleton, toast } from '@/shared/ui';
import { paths } from '@/shared/config/paths';

/** Cross-event list of published / deliverable galleries (design spec §5.11). */
export function OrgDeliveryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: events, isLoading } = useEvents();

  const galleries = (events ?? []).filter((e) => ['delivered', 'in-review', 'shooting'].includes(e.status));

  return (
    <PageContainer>
      <PageHeader title={t('orgDelivery.title')} description={t('orgDelivery.subtitle')} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={72} radius={14} />
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <EmptyState title={t('orgDelivery.noTitle')} description={t('orgDelivery.noDesc')} />
      ) : (
        <Card className="p-0">
          {galleries.map((e) => {
            const published = e.status === 'delivered';
            return (
              <div key={e.id} className="flex items-center gap-4 border-b border-hairline px-5 py-3.5 last:border-0">
                <span className="size-11 flex-none rounded-[10px]" style={{ background: coverBackground(e.coverSeed) }} />
                <div className="min-w-0 flex-1">
                  <button onClick={() => navigate(`${paths.event(e.id)}?tab=delivery`)} className="truncate text-[14px] font-medium hover:text-accent">
                    {e.name}
                  </button>
                  <div className="truncate font-mono text-[11.5px] text-text-muted">gallery.memolink.app/{e.id}</div>
                </div>
                <span
                  className="flex items-center gap-1.5 text-[12px] font-semibold"
                  style={{ color: published ? 'var(--color-approved)' : 'var(--color-text-muted)' }}
                >
                  <span className="size-1.5 rounded-full" style={{ background: published ? 'var(--color-approved)' : 'var(--color-text-muted)' }} />
                  {published ? t('orgDelivery.live') : t('orgDelivery.draft')}
                </span>
                <button aria-label={t('orgDelivery.copyLink')} onClick={() => toast.success(t('orgDelivery.linkCopied'))} className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text">
                  <Copy size={15} />
                </button>
                <button aria-label={t('orgDelivery.openGallery')} onClick={() => navigate(`${paths.event(e.id)}?tab=delivery`)} className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text">
                  <ExternalLink size={15} />
                </button>
              </div>
            );
          })}
        </Card>
      )}
    </PageContainer>
  );
}
