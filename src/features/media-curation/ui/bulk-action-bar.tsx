import { useTranslation } from 'react-i18next';
import { Check, Download, Star, Trash2, X } from 'lucide-react';

import { Button } from '@/shared/ui';
import { useSelectionStore } from '../model/selection-store';

interface BulkActionBarProps {
  /** Curation: approve the selected photos (editorial APPROVED). */
  onApprove?: (ids: string[]) => void;
  /** Curation: reject the selected photos — caller must collect a reason. */
  onReject?: (ids: string[]) => void;
  /** Curation: feature the selected photos (pin to the top of the gallery). */
  onFeature?: (ids: string[]) => void;
  onDownload?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
}

/**
 * Floating bulk-action bar — appears on selection. Renders only the actions the
 * caller wires up (curation approve/reject/feature, download, remove).
 */
export function BulkActionBar({ onApprove, onReject, onFeature, onDownload, onDelete }: BulkActionBarProps) {
  const { t } = useTranslation();
  const selected = useSelectionStore((s) => s.selected);
  const clear = useSelectionStore((s) => s.clear);
  const count = selected.size;

  if (count === 0) return null;

  const ids = () => [...selected];

  return (
    <div className="animate-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-[14px] border border-border-strong bg-surface-raised p-2.5 pl-4 shadow-[var(--shadow-pop)]">
      <span className="font-mono text-[13px] font-semibold text-accent">{t('eventDetail.bulk.selected', { count })}</span>
      <span className="mx-1 h-6 w-px bg-border" />
      {onApprove && (
        <Button
          size="sm"
          variant="ghost"
          className="text-approved hover:bg-[rgba(61,214,140,0.12)]"
          leadingIcon={<Check size={15} />}
          onClick={() => onApprove(ids())}
        >
          {t('eventDetail.bulk.approve')}
        </Button>
      )}
      {onFeature && (
        <Button
          size="sm"
          variant="ghost"
          className="text-accent-soft hover:bg-[#1d1b2e]"
          leadingIcon={<Star size={15} />}
          onClick={() => onFeature(ids())}
        >
          {t('eventDetail.bulk.feature')}
        </Button>
      )}
      {onDownload && (
        <Button size="sm" variant="ghost" leadingIcon={<Download size={15} />} onClick={() => onDownload(ids())}>
          {t('eventDetail.bulk.download')}
        </Button>
      )}
      {onReject && (
        <Button size="sm" variant="destructive" leadingIcon={<X size={15} />} onClick={() => onReject(ids())}>
          {t('eventDetail.bulk.reject')}
        </Button>
      )}
      {onDelete && (
        <Button size="sm" variant="destructive" leadingIcon={<Trash2 size={15} />} onClick={() => onDelete(ids())}>
          {t('eventDetail.bulk.remove')}
        </Button>
      )}
      <span className="mx-1 h-6 w-px bg-border" />
      <Button size="sm" variant="ghost" aria-label={t('eventDetail.bulk.clear')} onClick={clear}>
        <X size={15} />
      </Button>
    </div>
  );
}
