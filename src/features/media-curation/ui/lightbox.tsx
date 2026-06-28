import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Download, Eye, Music2, Play, Star, Trash2, X } from 'lucide-react';

import { Avatar, IconButton, toast } from '@/shared/ui';
import { formatDuration } from '@/shared/lib/format';
import { coverBackground } from '@/shared/lib/visual';
import { useLightboxStore } from '../model/lightbox-store';

/**
 * Full-screen media viewer with a side meta panel and keyboard navigation
 * (design spec §04.2): ← → navigate, Esc close, F feature, ⌫/Delete remove.
 * Feature / delete controls appear when their handlers are supplied at open time.
 */
export function Lightbox() {
  const { t } = useTranslation();
  const { open, assets, index, close, next, prev, onDelete, onFeature } = useLightboxStore();
  const asset = assets[index];

  // Optimistic feature overrides — the assets array is a snapshot taken at open
  // time, so we track per-asset toggles locally for instant visual feedback.
  const [featuredOverrides, setFeaturedOverrides] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (open) setFeaturedOverrides({});
  }, [open]);

  const isFeatured = asset ? featuredOverrides[asset.id] ?? Boolean(asset.featured) : false;

  const handleDelete = () => {
    if (!asset) return;
    onDelete?.(asset.id);
    if (index >= assets.length - 1) close();
    else next();
  };

  const handleFeature = () => {
    if (!asset) return;
    const nextOn = !isFeatured;
    setFeaturedOverrides((prev) => ({ ...prev, [asset.id]: nextOn }));
    onFeature?.(asset.id, nextOn);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (onFeature && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleFeature();
      } else if (onDelete && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        handleDelete();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close, next, prev, onFeature, onDelete, index, isFeatured, asset]);

  if (!open || !asset) return null;

  return createPortal(
    <div className="animate-pop fixed inset-0 z-[140] flex bg-black/88 backdrop-blur-md">
      {/* Stage */}
      <div className="relative flex flex-1 items-center justify-center p-10">
        <IconButton aria-label="Close viewer" className="absolute right-5 top-5 border-white/15 bg-white/10" onClick={close}>
          <X size={18} />
        </IconButton>

        {index > 0 && (
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-5 flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div
          className="relative flex aspect-[3/2] w-full max-w-[820px] items-center justify-center overflow-hidden rounded-[14px]"
          style={{ background: coverBackground(asset.coverSeed) }}
        >
          {asset.type !== 'audio' && asset.previewUrl && (
            <img
              key={asset.id}
              src={asset.previewUrl}
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="absolute inset-0 size-full object-contain"
            />
          )}
          {asset.type === 'video' && (
            <span className="flex size-16 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur">
              <Play size={26} fill="currentColor" />
            </span>
          )}
          {asset.type === 'audio' && (
            <div className="flex flex-col items-center gap-4 text-white">
              <span className="flex size-16 items-center justify-center rounded-full bg-black/55 backdrop-blur">
                <Music2 size={26} />
              </span>
              <div className="flex h-12 items-end gap-[3px]">
                {[10, 22, 14, 30, 18, 38, 16, 28, 12, 34, 20, 26, 15, 32, 19].map((h, i) => (
                  <span key={i} className="w-[3px] rounded-full bg-white/70" style={{ height: h }} />
                ))}
              </div>
            </div>
          )}
          {asset.type !== 'image' && asset.durationSec !== undefined && (
            <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 font-mono text-xs text-white">
              {formatDuration(asset.durationSec)}
            </span>
          )}
        </div>

        {index < assets.length - 1 && (
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-5 flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Meta panel */}
      <aside className="flex w-[320px] flex-none flex-col border-l border-border bg-surface">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-surface-raised px-2 py-0.5 text-[11.5px] font-semibold text-text-secondary">
              {t(`media.type.${asset.type}`)}
            </span>
            <span className="font-mono text-xs text-text-muted">
              {index + 1} / {assets.length}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={asset.uploadedBy} size={36} />
            <div>
              <div className="text-[13.5px] font-medium">{asset.uploadedBy}</div>
              <div className="font-mono text-xs text-text-muted">{t('eventDetail.lightbox.captured', { time: asset.capturedAt })}</div>
            </div>
          </div>
        </div>

        <dl className="space-y-3 overflow-y-auto p-5 text-[13px]">
          <Meta label={t('eventDetail.lightbox.device')} value={asset.meta.device} />
          <Meta label={t('eventDetail.lightbox.codec')} value={asset.meta.codec} />
          <Meta label={t('eventDetail.lightbox.quality')} value={asset.meta.quality} />
          <Meta label={t('eventDetail.lightbox.fileSize')} value={asset.meta.size} />
        </dl>

        {(onFeature || onDelete) && (
          <div className="mx-5 mb-1 flex items-start gap-2.5 rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-[12px] text-text-secondary">
            <Eye size={15} className="mt-0.5 flex-none text-approved" />
            <span>{t('eventDetail.lightbox.featureNote')}</span>
          </div>
        )}

        <div className="mt-auto space-y-2 border-t border-border p-4">
          {onFeature && (
            <button
              onClick={handleFeature}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[rgba(109,94,246,0.14)] py-2.5 text-[13px] font-medium text-accent-soft transition-colors hover:bg-[rgba(109,94,246,0.22)]"
            >
              <Star size={15} fill={isFeatured ? 'currentColor' : 'none'} />
              {isFeatured ? t('eventDetail.lightbox.featured') : t('eventDetail.lightbox.feature')}
              <kbd className="ml-1 font-mono text-[11px] opacity-60">F</kbd>
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => toast.success(t('eventDetail.lightbox.downloadStarted'))}
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface-raised py-2.5 text-[13px] font-medium transition-colors hover:border-border-strong"
            >
              <Download size={15} /> {t('eventDetail.bulk.download')}
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[rgba(240,85,110,0.12)] py-2.5 text-[13px] font-medium text-rejected transition-colors hover:bg-[rgba(240,85,110,0.2)]"
              >
                <Trash2 size={15} /> {t('eventDetail.bulk.remove')}
                <kbd className="ml-1 font-mono text-[11px] opacity-60">⌫</kbd>
              </button>
            )}
          </div>
        </div>
        <p className="px-4 pb-4 text-center font-mono text-[11px] text-text-muted">
          {t('eventDetail.lightbox.shortcuts')}
        </p>
      </aside>
    </div>,
    document.body,
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
