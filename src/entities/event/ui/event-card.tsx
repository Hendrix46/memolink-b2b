import { useTranslation } from 'react-i18next';
import { Calendar, Users } from 'lucide-react';

import { coverFrom } from '@/shared/lib/visual';
import { ProgressBar } from '@/shared/ui';
import { formatEventDate, formatPercent } from '@/shared/lib/format';
import type { EventSummary } from '../model/types';
import { EventStatusChip } from './event-status-chip';

interface EventCardProps {
  event: EventSummary;
  onOpen: (id: string) => void;
}

/** Media-led event card: cover, status, attendance + capacity progress. */
export function EventCard({ event, onOpen }: EventCardProps) {
  const { t } = useTranslation();
  const cap = event.maxAttendees ?? 0;
  const ratio = cap > 0 ? Math.min(1, event.currentAttendeeCount / cap) : 0;
  return (
    <button
      type="button"
      onClick={() => onOpen(event.eventId)}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface text-left transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-border-strong"
    >
      <div className="relative h-[166px]" style={{ background: coverFrom(event.coverPhotoUrl, event.eventId) }}>
        <span className="absolute left-3 top-3">
          <EventStatusChip status={event.eventStatus} surface />
        </span>
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-[rgba(11,11,15,0.7)] px-2 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-sm">
          <Users size={11} />
          {event.currentAttendeeCount.toLocaleString()}
        </span>
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <div className="truncate text-[15px] font-semibold tracking-[-0.01em]">{event.title}</div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-text-secondary">
          <Calendar size={13} className="text-text-muted" />
          {formatEventDate(event.eventStartDate, event.eventEndDate)}
          {event.locationName && (
            <>
              <span className="text-border-strong">·</span>
              <span className="truncate">{event.locationName}</span>
            </>
          )}
        </div>

        <div className="mt-3.5">
          <ProgressBar value={ratio} />
          <div className="mt-2 flex items-center justify-between font-mono text-xs text-text-muted">
            <span>{t('events.attendees', { count: event.currentAttendeeCount })}</span>
            <span>{cap > 0 ? t('events.full', { pct: formatPercent(ratio) }) : t('events.noCap')}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
