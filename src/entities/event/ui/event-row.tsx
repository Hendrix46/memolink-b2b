import { useTranslation } from 'react-i18next';

import { coverBackground } from '@/shared/lib/visual';
import { eventStatusMeta } from '@/shared/config/status';
import type { EventSummary } from '../model/types';

interface EventRowProps {
  event: EventSummary;
  onOpen: (id: string) => void;
  /** Compact density reduces vertical padding. */
  dense?: boolean;
}

const GRID = 'grid grid-cols-[2.6fr_1fr_1.4fr_1fr] items-center gap-3';

/** Data-dense table row (design spec §5.2 table view). */
export function EventRow({ event, onOpen, dense }: EventRowProps) {
  const { t } = useTranslation();
  const status = eventStatusMeta(event.status);
  return (
    <button
      type="button"
      onClick={() => onOpen(event.id)}
      className={`${GRID} w-full border-b border-hairline px-[18px] text-left transition-colors last:border-0 hover:bg-surface-hover ${dense ? 'py-2' : 'py-3.5'}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`${dense ? 'size-8' : 'size-10'} flex-none rounded-lg`}
          style={{ background: coverBackground(event.coverSeed) }}
        />
        <span className="truncate text-sm font-medium">{event.name}</span>
      </div>
      <span className="flex items-center gap-1.5 text-[12.5px] font-medium">
        <span className="size-1.5 rounded-full" style={{ background: status.color }} />
        {t(`eventStatus.${event.status}`)}
      </span>
      <span className="font-mono text-[13px] text-text-secondary">{event.date}</span>
      <span className="text-right font-mono text-[13px]">{event.assetCount.toLocaleString()}</span>
    </button>
  );
}

export function EventTableHeader() {
  const { t } = useTranslation();
  return (
    <div
      className={`${GRID} border-b border-border px-[18px] py-3 text-[11.5px] font-medium uppercase tracking-[0.05em] text-text-muted`}
    >
      <span>{t('events.colEvent')}</span>
      <span>{t('events.colStatus')}</span>
      <span>{t('events.colDate')}</span>
      <span className="text-right">{t('events.colAssets')}</span>
    </div>
  );
}
