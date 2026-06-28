import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, ImageOff } from 'lucide-react';

import { MediaTile, useBulkCuration, useCurationPhotos, useUpdateCuration } from '@/entities/media';
import type { CurationPhoto } from '@/entities/media';
import { BulkActionBar, useLightboxStore, useSelectionStore } from '@/features/media-curation';
import type { CurationState } from '@/shared/config/status';
import {
  Button,
  EmptyState,
  ErrorState,
  FilterChip,
  Modal,
  Skeleton,
  Textarea,
  toast,
} from '@/shared/ui';

type CurationFilter = 'all' | CurationState;

const FILTERS: { key: CurationFilter; i18n: string; dotColor?: string }[] = [
  { key: 'all', i18n: 'eventDetail.media.filterAll' },
  { key: 'PENDING', i18n: 'curationState.PENDING', dotColor: 'var(--color-pending)' },
  { key: 'APPROVED', i18n: 'curationState.APPROVED', dotColor: 'var(--color-approved)' },
  { key: 'FEATURED', i18n: 'curationState.FEATURED', dotColor: 'var(--color-featured)' },
  { key: 'REJECTED', i18n: 'curationState.REJECTED', dotColor: 'var(--color-rejected)' },
];

/** Event detail → Media curation (review list: approve / feature / reject with reason). */
export function MediaTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<CurationFilter>('all');
  /** Photo ids awaiting a rejection reason (single or bulk). */
  const [rejectIds, setRejectIds] = useState<string[] | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading, isError, refetch } = useCurationPhotos(eventId);
  const update = useUpdateCuration(eventId);
  const bulk = useBulkCuration(eventId);

  const { selected, selectMany, selectRange, clear, toggle } = useSelectionStore();
  const openLightbox = useLightboxStore((s) => s.openAt);

  // Reset selection whenever the active filter changes.
  useEffect(() => clear, [filter, clear]);

  const photos = useMemo<CurationPhoto[]>(() => data?.items ?? [], [data]);
  const visible = useMemo(
    () => (filter === 'all' ? photos : photos.filter((p) => p.editorialState === filter)),
    [photos, filter],
  );

  const countFor = (key: CurationFilter): number | undefined => {
    if (!data) return undefined;
    return key === 'all' ? photos.length : photos.filter((p) => p.editorialState === key).length;
  };

  const orderedIds = visible.map((p) => p.id);
  const onToggle = (id: string, range: boolean) => (range ? selectRange(id, orderedIds) : toggle(id));
  const selectAllVisible = () => visible.length && selectMany(orderedIds);

  const setState = (photoId: string, state: CurationState) => {
    update.mutate(
      { photoId, state },
      { onSuccess: () => toast.success(t('eventDetail.media.stateUpdated')) },
    );
  };

  const bulkAction = (ids: string[], action: 'APPROVE' | 'FEATURE') => {
    bulk.mutate(
      { photoIds: ids, action },
      {
        onSuccess: () => {
          clear();
          toast.success(t('eventDetail.media.bulkDone', { count: ids.length }));
        },
      },
    );
  };

  const submitReject = () => {
    const ids = rejectIds;
    if (!ids || !reason.trim()) return;
    const done = () => {
      clear();
      setRejectIds(null);
      setReason('');
      toast.success(t('eventDetail.media.rejected', { count: ids.length }));
    };
    if (ids.length === 1) {
      update.mutate({ photoId: ids[0], state: 'REJECTED', reason: reason.trim() }, { onSuccess: done });
    } else {
      bulk.mutate({ photoIds: ids, action: 'REJECT', reason: reason.trim() }, { onSuccess: done });
    }
  };

  return (
    <>
      {/* Curation info banner */}
      <div className="mb-3.5 flex items-start gap-2.5 rounded-[11px] border border-[rgba(61,214,140,0.22)] bg-[rgba(61,214,140,0.06)] px-3.5 py-2.5 text-[12.5px] text-text-secondary">
        <Eye size={16} className="mt-0.5 flex-none text-approved" />
        <span>{t('eventDetail.media.curationInfo')}</span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex flex-1 flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              label={t(f.i18n)}
              count={countFor(f.key)}
              dotColor={f.dotColor}
              active={filter === f.key}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </div>
        <Button size="sm" variant="secondary" onClick={selectAllVisible} disabled={!visible.length}>
          {t('common.selectAll')}
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" radius={11} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<ImageOff size={24} />}
          title={t('eventDetail.media.noMediaTitle')}
          description={t('eventDetail.media.noMediaDesc')}
        />
      ) : (
        <>
          <p className="mb-3 text-[12px] text-text-muted">{t('mediaLibrary.selectHint')}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
            {visible.map((photo) => (
              <MediaTile
                key={photo.id}
                asset={photo}
                selectable
                selected={selected.has(photo.id)}
                onToggleSelect={onToggle}
                onOpen={() =>
                  openLightbox(visible, photo.id, {
                    onDelete: (id) => setRejectIds([id]),
                    onFeature: (id, on) => setState(id, on ? 'FEATURED' : 'APPROVED'),
                  })
                }
                onFeature={(id, next) => setState(id, next ? 'FEATURED' : 'APPROVED')}
                onRemove={(id) => setRejectIds([id])}
              />
            ))}
          </div>
        </>
      )}

      <BulkActionBar
        onApprove={(ids) => bulkAction(ids, 'APPROVE')}
        onFeature={(ids) => bulkAction(ids, 'FEATURE')}
        onReject={(ids) => setRejectIds(ids)}
      />

      <Modal
        open={rejectIds !== null}
        onClose={() => {
          setRejectIds(null);
          setReason('');
        }}
        title={t('eventDetail.media.rejectTitle')}
        description={t('eventDetail.media.rejectDesc')}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectIds(null);
                setReason('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" disabled={!reason.trim()} onClick={submitReject}>
              {t('eventDetail.bulk.reject')}
            </Button>
          </>
        }
      >
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('eventDetail.media.rejectReasonPh')}
          rows={3}
        />
      </Modal>
    </>
  );
}
