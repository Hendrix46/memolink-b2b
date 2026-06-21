import { useTranslation } from 'react-i18next';
import { Calendar, Image as ImageIcon } from 'lucide-react';

import { coverBackground } from '@/shared/lib/visual';
import type { EventSummary } from '../model/types';
import { EventStatusChip } from './event-status-chip';

interface EventCardProps {
  event: EventSummary;
  onOpen: (id: string) => void;
}

/** Media-led event card (design spec §5.2). */
export function EventCard({ event, onOpen }: EventCardProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => onOpen(event.id)}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface text-left transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-border-strong"
    >
      <div className="relative h-[166px]" style={{ background: coverBackground(event.coverSeed) }}>
        <span className="absolute left-3 top-3">
          <EventStatusChip status={event.status} surface />
        </span>
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <div className="truncate text-[15px] font-semibold tracking-[-0.01em]">{event.name}</div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-text-secondary">
          <Calendar size={13} className="text-text-muted" />
          {event.date}
          <span className="text-border-strong">·</span>
          {event.location}
        </div>

        <div className="mt-3.5 flex items-center gap-1.5 border-t border-hairline pt-3 font-mono text-xs text-text-muted">
          <ImageIcon size={13} />
          {t('events.assets', { count: event.assetCount })}
        </div>
      </div>
    </button>
  );
}
