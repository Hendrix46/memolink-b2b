import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Images } from 'lucide-react';

import { useEvents } from '@/entities/event';
import { MediaTile, type MediaAsset } from '@/entities/media';
import { photographerApi, type PhotographerPhoto } from '@/entities/photographer';
import { queryKeys } from '@/shared/config/query-keys';
import { EmptyState, ErrorState, PageContainer, PageHeader, Skeleton } from '@/shared/ui';

interface EventGroup {
  eventId: string;
  eventName: string;
  assets: MediaAsset[];
}

/** Map a photographer's own photo onto the gallery's `MediaAsset` shape. */
function toAsset(p: PhotographerPhoto, eventId: string): MediaAsset {
  return {
    id: p.eventPhotoId,
    eventId,
    type: 'image',
    coverSeed: p.fileId,
    thumbnailUrl: p.thumbnailUrl ?? p.fileUrl ?? null,
    capturedAt: p.dateCreated,
    uploadedBy: '—',
    processing: p.processingStatus !== 'READY',
    meta: { device: '—', codec: '—', quality: '—', size: '—' },
  };
}

/**
 * Photographer: My Uploads — own contributed media grouped by event.
 *
 * Own uploads come from `GET /api/event/{eventId}/photographer/photos` fanned
 * out across the photographer's assigned events (the org's event list).
 */
export function MyUploadsPage() {
  const { t } = useTranslation();

  const { data: events, isLoading: eventsLoading, isError: eventsError, refetch: refetchEvents } = useEvents();
  const eventList = events ?? [];

  // One query per event keeps hook order stable for a dynamic list.
  const photoQueries = useQueries({
    queries: eventList.map((e) => ({
      queryKey: queryKeys.photographer.uploads(e.eventId),
      queryFn: () => photographerApi.myPhotos(e.eventId),
    })),
  });

  const photosLoading = photoQueries.some((q) => q.isLoading);
  const isLoading = eventsLoading || (Boolean(eventList.length) && photosLoading);
  const isError = eventsError || photoQueries.some((q) => q.isError);

  const groups = useMemo<EventGroup[]>(() => {
    return eventList
      .map((ev, i) => ({
        eventId: ev.eventId,
        eventName: ev.title,
        assets: (photoQueries[i]?.data ?? []).map((p) => toAsset(p, ev.eventId)),
      }))
      .filter((g) => g.assets.length > 0);
    // photoQueries identity changes each render; depend on data freshness instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, photoQueries.map((q) => q.dataUpdatedAt).join(',')]);

  const retry = () => {
    refetchEvents();
    photoQueries.forEach((q) => q.refetch());
  };

  return (
    <PageContainer>
      <PageHeader title={t('myUploads.title')} description={t('myUploads.subtitle')} />

      {isError ? (
        <ErrorState onRetry={retry} />
      ) : isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} height={200} radius={12} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Images size={24} />}
          title={t('myUploads.emptyTitle')}
          description={t('myUploads.emptyDesc')}
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.eventId}>
              <h2 className="mb-3 text-sm font-semibold text-text-secondary">{group.eventName}</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
                {group.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="overflow-hidden rounded-[12px] border border-border bg-surface"
                  >
                    <MediaTile asset={asset} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
