import { useTranslation } from 'react-i18next';
import { Download, Trash2 } from 'lucide-react';

import { Button } from '@/shared/ui';
import { useSelectionStore } from '../model/selection-store';

interface BulkActionBarProps {
  onDelete: (ids: string[]) => void;
  onDownload: (ids: string[]) => void;
}

/**
 * Sticky bulk-action bar — appears on selection (design spec §5.5).
 * Media has no review workflow, so the only destructive action is delete
 * (offered with undo by the caller) alongside download.
 */
export function BulkActionBar({ onDelete, onDownload }: BulkActionBarProps) {
  const { t } = useTranslation();
  const selected = useSelectionStore((s) => s.selected);
  const clear = useSelectionStore((s) => s.clear);
  const count = selected.size;

  if (count === 0) return null;

  const ids = () => [...selected];

  return (
    <div className="animate-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-[14px] border border-border bg-surface-raised p-2 pl-4 shadow-[var(--shadow-pop)]">
      <span className="font-mono text-[13px] font-semibold">{t('eventDetail.bulk.selected', { count })}</span>
      <span className="mx-1 h-6 w-px bg-border" />
      <Button size="sm" variant="ghost" leadingIcon={<Download size={15} />} onClick={() => onDownload(ids())}>
        {t('eventDetail.bulk.download')}
      </Button>
      <Button size="sm" variant="destructive" leadingIcon={<Trash2 size={15} />} onClick={() => onDelete(ids())}>
        {t('eventDetail.bulk.delete')}
      </Button>
      <span className="mx-1 h-6 w-px bg-border" />
      <Button size="sm" variant="ghost" aria-label={t('eventDetail.bulk.cancel')} onClick={clear}>
        {t('eventDetail.bulk.cancel')}
      </Button>
    </div>
  );
}
