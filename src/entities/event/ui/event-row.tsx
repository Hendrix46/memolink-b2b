import { useTranslation } from 'react-i18next';

import { useEventCoverBackground } from '@/shared/api';
import { eventStatusMeta } from '@/shared/config/status';
import { formatEventDate, formatPercent } from '@/shared/lib/format';
import type { EventSummary } from '../model/types';

interface EventRowProps {
  event: EventSummary;
  onOpen: (id: string) => void;
  /** Compact density reduces vertical padding. */
  dense?: boolean;
}

const GRID = 'grid grid-cols-[2.4fr_1fr_1.2fr_1.4fr_1fr] items-center gap-3';

/** Data-dense table row (spec §1 table view). */
export function EventRow({ event, onOpen, dense }: EventRowProps) {
  const { t } = useTranslation();
  const cover = useEventCoverBackground(event.eventId, event.posterFileId);
  const status = eventStatusMeta(event.eventStatus);
  const cap = event.maxAttendees ?? 0;
  const ratio = cap > 0 ? Math.min(1, event.currentAttendeeCount / cap) : 0;
  return (
    <button
      type="button"
      onClick={() => onOpen(event.eventId)}
      className={`${GRID} w-full border-b border-hairline px-[18px] text-left transition-colors last:border-0 hover:bg-surface-hover ${dense ? 'py-2' : 'py-3.5'}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`${dense ? 'size-8' : 'size-10'} flex-none rounded-lg`}
          style={{ background: cover }}
        />
        <span className="truncate text-sm font-medium">{event.title}</span>
      </div>
      <span className="flex items-center gap-1.5 text-[12.5px] font-medium">
        <span className="size-1.5 rounded-full" style={{ background: status.color }} />
        {t(`eventStatus.${event.eventStatus}`)}
      </span>
      <span className="font-mono text-[13px] text-text-secondary">
        {formatEventDate(event.eventStartDate, event.eventEndDate)}
      </span>
      <span className="flex items-center gap-2.5">
        <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-border">
          <span
            className="block h-full rounded-full"
            style={{ width: `${Math.round(ratio * 100)}%`, background: 'var(--color-accent)' }}
          />
        </span>
        <span className="flex-none font-mono text-[11.5px] text-text-muted">{formatPercent(ratio)}</span>
      </span>
      <span className="text-right font-mono text-[13px]">{event.currentAttendeeCount.toLocaleString()}</span>
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
      <span>{t('events.colCapacity')}</span>
      <span className="text-right">{t('events.colAttendees')}</span>
    </div>
  );
}
