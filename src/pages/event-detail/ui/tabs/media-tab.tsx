import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCheck, ImageOff } from 'lucide-react';

import {
  MediaTile,
  useDeleteMedia,
  useEventMedia,
  useEventMediaCounts,
  useRestoreMedia,
  type MediaAsset,
  type MediaType,
} from '@/entities/media';
import {
  BulkActionBar,
  useLightboxStore,
  useSelectionStore,
} from '@/features/media-curation';
import { UploadMediaButton } from '@/features/media-upload';
import { Button, EmptyState, ErrorState, FilterChip, Skeleton, toast } from '@/shared/ui';

const TYPE_FILTERS: { key: MediaType | 'all'; i18n: string; countKey: 'all' | MediaType }[] = [
  { key: 'all', i18n: 'eventDetail.media.filterAll', countKey: 'all' },
  { key: 'image', i18n: 'media.type.image', countKey: 'image' },
  { key: 'video', i18n: 'media.type.video', countKey: 'video' },
  { key: 'audio', i18n: 'media.type.audio', countKey: 'audio' },
];

/** Event detail → Media library (upload, browse, multi-select, delete). */
export function MediaTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const [type, setType] = useState<MediaType | 'all'>('all');

  const { data: assets, isLoading, isError, refetch } = useEventMedia(eventId, { type });
  const { data: counts } = useEventMediaCounts(eventId);

  const { selected, selectMany, selectRange, clear, toggle } = useSelectionStore();
  const openLightbox = useLightboxStore((s) => s.openAt);
  const deleteMedia = useDeleteMedia(eventId);
  const restoreMedia = useRestoreMedia(eventId);

  // Reset selection whenever the type filter changes.
  useEffect(() => clear, [type, clear]);

  const orderedIds = assets?.map((a) => a.id) ?? [];

  const onToggle = (id: string, range: boolean) => (range ? selectRange(id, orderedIds) : toggle(id));

  const selectAllVisible = () => assets && selectMany(orderedIds);

  /** Delete with undo — assets are restored if the user hits Undo. */
  const handleDelete = (ids: string[]) => {
    const removed: MediaAsset[] = (assets ?? []).filter((a) => ids.includes(a.id));
    deleteMedia.mutate(ids, {
      onSuccess: () => {
        clear();
        toast.success(t('mediaLibrary.deleted', { count: ids.length }), {
          action: {
            label: t('common.undo'),
            onClick: () => restoreMedia.mutate(removed),
          },
        });
      },
    });
  };

  const handleDownload = (ids: string[]) => {
    toast.success(t('mediaLibrary.downloadQueued', { count: ids.length }));
    clear();
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex flex-1 flex-wrap gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              label={t(f.i18n)}
              count={counts?.[f.countKey]}
              active={type === f.key}
              onClick={() => setType(f.key)}
            />
          ))}
        </div>
        <Button
          size="sm"
          variant="secondary"
          leadingIcon={<CheckCheck size={15} />}
          onClick={selectAllVisible}
          disabled={!assets?.length}
        >
          {t('common.selectAll')}
        </Button>
        <UploadMediaButton eventId={eventId} />
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !assets ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" radius={11} />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<ImageOff size={24} />}
          title={t('eventDetail.media.noMediaTitle')}
          description={t('eventDetail.media.noMediaDesc')}
          action={<UploadMediaButton eventId={eventId} />}
        />
      ) : (
        <>
          <p className="mb-3 text-[12px] text-text-muted">{t('mediaLibrary.selectHint')}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
            {assets.map((asset) => (
              <MediaTile
                key={asset.id}
                asset={asset}
                selectable
                selected={selected.has(asset.id)}
                onToggleSelect={onToggle}
                onOpen={() => openLightbox(assets, asset.id, { onDelete: (id) => handleDelete([id]) })}
              />
            ))}
          </div>
        </>
      )}

      <BulkActionBar onDelete={handleDelete} onDownload={handleDownload} />
    </>
  );
}
