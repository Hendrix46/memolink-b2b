import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Loader2, Play, RotateCw, UploadCloud, X } from 'lucide-react';

import { useEvent } from '@/entities/event';
import {
  abortResumable,
  photographerApi,
  runResumableUpload,
} from '@/entities/photographer';
import { ApiError } from '@/shared/api';
import type { PhotoAccessLevel } from '@/shared/config/status';
import { paths } from '@/shared/config/paths';
import { coverBackground } from '@/shared/lib/visual';
import { Button, PageContainer, ProgressBar, Select, toast } from '@/shared/ui';

type UploadState = 'uploading' | 'done' | 'failed';

interface UploadItem {
  id: string;
  file: File;
  isVideo: boolean;
  uploadedBytes: number;
  totalSize: number;
  state: UploadState;
  sessionId?: string;
  partSize?: number;
  error?: string;
}

let seq = 0;

function fmtBytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} KB`;
  return `${n} B`;
}

/** Photographer: Upload — real resumable dropzone + live queue (changelog §11). */
export function UploadPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event } = useEvent(eventId);

  const [items, setItems] = useState<UploadItem[]>([]);
  const [accessLevel, setAccessLevel] = useState<PhotoAccessLevel>('EVENT_ATTENDEES_ONLY');
  const controllers = useRef<Map<string, AbortController>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patch = useCallback((id: string, next: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  const startUpload = useCallback(
    (item: UploadItem) => {
      if (!eventId) return;
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      patch(item.id, { state: 'uploading', error: undefined });

      runResumableUpload({
        eventId,
        file: item.file,
        accessLevel,
        sessionId: item.sessionId,
        partSize: item.partSize,
        signal: controller.signal,
        onSession: (sessionId, partSize) => patch(item.id, { sessionId, partSize }),
        onProgress: (p) => patch(item.id, { uploadedBytes: p.uploadedBytes, totalSize: p.totalSize }),
      })
        .then(() => {
          patch(item.id, { state: 'done', uploadedBytes: item.file.size });
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          let message = t('upload.failedGeneric');
          if (err instanceof ApiError) {
            // Surface quota / access errors (403/409) verbatim.
            if (err.status === 409 || err.status === 403) message = err.message;
            else message = err.message || message;
          }
          patch(item.id, { state: 'failed', error: message });
          toast.error(message);
        })
        .finally(() => controllers.current.delete(item.id));
    },
    [eventId, accessLevel, patch, t],
  );

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const maxBytes = event?.uploadMaxBytes ?? null;
    const newItems: UploadItem[] = Array.from(fileList).map((file) => {
      seq += 1;
      // Reject oversize files up front rather than starting an upload the server will 403.
      const tooLarge = maxBytes != null && file.size > maxBytes;
      return {
        id: `up_${seq}`,
        file,
        isVideo: file.type.startsWith('video/'),
        uploadedBytes: 0,
        totalSize: file.size,
        state: tooLarge ? ('failed' as const) : ('uploading' as const),
        error: tooLarge ? t('upload.tooLarge', { max: fmtBytes(maxBytes) }) : undefined,
      };
    });
    setItems((prev) => [...newItems, ...prev]);
    newItems.filter((it) => it.state === 'uploading').forEach(startUpload);
  };

  const retry = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) startUpload(item);
  };

  const retryAll = () => items.filter((i) => i.state === 'failed').forEach((i) => startUpload(i));

  const cancel = (id: string) => {
    const controller = controllers.current.get(id);
    controller?.abort();
    controllers.current.delete(id);
    const item = items.find((i) => i.id === id);
    if (eventId && item?.sessionId) void abortResumable(eventId, item.sessionId).catch(() => {});
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCompleted = () => setItems((prev) => prev.filter((i) => i.state !== 'done'));

  const deliver = () => {
    if (!eventId) return;
    photographerApi
      .deliver(eventId)
      .then(() => toast.success(t('upload.delivered')))
      .catch(() => toast.error(t('upload.deliverFailed')));
  };

  const stats = useMemo(() => {
    const done = items.filter((i) => i.state === 'done').length;
    const failed = items.filter((i) => i.state === 'failed').length;
    const active = items.some((i) => i.state === 'uploading');
    return { done, failed, active, total: items.length };
  }, [items]);

  const name = event?.title;

  return (
    <PageContainer width="narrow">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(paths.assignments)}
            className="mb-2 inline-flex items-center gap-1 text-[12.5px] text-text-secondary transition-colors hover:text-text"
          >
            <ChevronLeft size={15} />
            {t('assignments.title')}
          </button>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            {name ? t('upload.titleTo', { name }) : t('upload.title')}
          </h1>
        </div>

        <div className="min-w-[220px]">
          <label className="mb-1.5 block text-xs text-text-muted">{t('upload.accessLevel')}</label>
          <Select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as PhotoAccessLevel)}
            options={[
              { value: 'PRIVATE_TO_ME', label: t('upload.access.PRIVATE_TO_ME') },
              { value: 'EVENT_ATTENDEES_ONLY', label: t('upload.access.EVENT_ATTENDEES_ONLY') },
              { value: 'PUBLIC', label: t('upload.access.PUBLIC') },
            ]}
          />
        </div>
      </div>

      {/* Dropzone */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="group flex w-full flex-col items-center gap-3.5 rounded-[18px] border-[1.5px] border-dashed border-border-strong bg-[linear-gradient(180deg,rgba(102,112,255,0.05),transparent)] px-5 py-[46px] text-center transition-colors hover:border-accent hover:bg-[rgba(102,112,255,0.08)]"
      >
        <span className="flex size-[62px] items-center justify-center rounded-2xl bg-[rgba(102,112,255,0.14)] text-accent-soft">
          <UploadCloud size={28} />
        </span>
        <span>
          <span className="block text-base font-semibold">{t('upload.dropTitle')}</span>
          <span className="mt-1 block text-[13px] text-text-muted">{t('upload.dropSubtitle')}</span>
        </span>
        <span className="mt-1 inline-flex h-10 items-center rounded-[10px] bg-accent px-5 text-sm font-semibold text-white shadow-[var(--shadow-accent)]">
          {t('upload.selectFiles')}
        </span>
      </button>

      {event?.uploadMaxBytes != null && (
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[12px] text-text-muted">
          <span>{t('upload.limitHint', { max: fmtBytes(event.uploadMaxBytes) })}</span>
          {event.resumableUploadAllowed && (
            <span className="rounded-full border border-[rgba(179,252,106,0.28)] bg-[rgba(179,252,106,0.12)] px-2 py-0.5 text-[11px] font-medium text-[#b3fc6a]">
              {t('upload.resumable')}
            </span>
          )}
        </p>
      )}

      {/* Upload queue */}
      {items.length > 0 && (
        <section className="mt-6">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
              {t('upload.uploading')}
              <span className="font-mono text-[12.5px] font-normal text-text-muted">
                {t('upload.doneCount', { done: stats.done, total: stats.total })}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              {stats.failed > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  leadingIcon={<RotateCw size={14} />}
                  onClick={retryAll}
                >
                  {t('upload.retryFailed', { count: stats.failed })}
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={clearCompleted}
                disabled={stats.done === 0}
              >
                {t('upload.clearCompleted')}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {items.map((it) => (
              <UploadRow
                key={it.id}
                item={it}
                onRetry={() => retry(it.id)}
                onCancel={() => cancel(it.id)}
              />
            ))}
          </div>

          {stats.done > 0 && (
            <Button variant="primary" className="mt-[18px] mr-2.5" onClick={deliver}>
              {t('upload.deliver')}
            </Button>
          )}
          <Button variant="secondary" className="mt-[18px]" onClick={() => navigate(paths.myUploads)}>
            {t('upload.viewMyUploads')}
          </Button>
        </section>
      )}
    </PageContainer>
  );
}

function UploadRow({
  item,
  onRetry,
  onCancel,
}: {
  item: UploadItem;
  onRetry: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  const ratio = item.totalSize > 0 ? item.uploadedBytes / item.totalSize : 0;
  const barColor =
    item.state === 'done'
      ? 'var(--color-approved)'
      : item.state === 'failed'
        ? 'var(--color-rejected)'
        : 'var(--color-accent)';
  const barValue = item.state === 'done' ? 1 : ratio;

  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface px-3.5 py-[11px]">
      <div
        className="relative size-[46px] flex-none rounded-[9px]"
        style={{ background: coverBackground(item.id) }}
      >
        {item.isVideo && (
          <span className="absolute inset-0 flex items-center justify-center text-white">
            <Play size={16} fill="currentColor" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2.5">
          <span className="truncate font-mono text-[13.5px] font-medium">{item.file.name}</span>
          <span className="flex-none font-mono text-xs text-text-muted">
            {fmtBytes(item.uploadedBytes)} / {fmtBytes(item.totalSize)}
          </span>
        </div>

        <ProgressBar value={barValue} color={barColor} aria-label={item.file.name} />

        {item.state === 'uploading' && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
            <Loader2 size={12} className="animate-[ml-spin_0.8s_linear_infinite]" />
            {t('upload.uploadingState', { pct: Math.round(ratio * 100) })}
          </div>
        )}
        {item.state === 'done' && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-approved">
            <span className="size-1.5 rounded-full bg-approved" />
            {t('upload.uploaded')}
          </div>
        )}
        {item.state === 'failed' && item.error && (
          <div className="mt-1.5 truncate text-xs text-rejected">{item.error}</div>
        )}
      </div>

      {item.state === 'failed' && (
        <Button
          size="sm"
          variant="destructive"
          className="flex-none"
          leadingIcon={<RotateCw size={14} />}
          onClick={onRetry}
        >
          {t('common.retry')}
        </Button>
      )}
      {item.state === 'uploading' && (
        <button
          type="button"
          aria-label={t('common.cancel')}
          onClick={onCancel}
          className="flex size-7 flex-none items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
