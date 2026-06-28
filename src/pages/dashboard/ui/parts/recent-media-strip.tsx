import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useEvents } from '@/entities/event';
import { MediaTile, useRecentMedia } from '@/entities/media';
import { useLightboxStore } from '@/features/media-curation';
import { Card, SectionHeader, Skeleton } from '@/shared/ui';
import { paths } from '@/shared/config/paths';

/** "From your galleries" — a live strip of recent gallery media. */
export function RecentMediaStrip() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: events, isLoading: eventsLoading } = useEvents();
  // Source the strip from the organizer's most recent event. The hook stays
  // unconditionally called (it is `enabled` only when an id is present).
  const firstEventId = events?.[0]?.eventId;
  const { data: recent = [], isLoading: mediaLoading } = useRecentMedia(firstEventId, 12);
  const openLightbox = useLightboxStore((s) => s.openAt);

  const isLoading = eventsLoading || (Boolean(firstEventId) && mediaLoading);

  // No events yet → nothing to show.
  if (!eventsLoading && !firstEventId) return null;

  return (
    <Card>
      <SectionHeader
        title={t('dashboard.recent.title')}
        description={t('dashboard.recent.subtitle')}
        action={
          <button
            onClick={() => navigate(paths.delivery)}
            className="text-[13px] font-medium text-accent transition-colors hover:text-accent-soft"
          >
            {t('dashboard.recent.viewGalleries')}
          </button>
        }
      />
      <div className="flex gap-3 overflow-x-auto pb-1.5">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} width={148} height={148} radius={11} className="flex-none" />
            ))
          : recent.map((m) => (
              <div key={m.id} className="w-[148px] flex-none">
                <MediaTile asset={m} onOpen={() => openLightbox(recent, m.id)} />
              </div>
            ))}
      </div>
    </Card>
  );
}
