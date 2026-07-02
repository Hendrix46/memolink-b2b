import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';

import { EventStatusChip } from '@/entities/event';
import { useEventCoverBackground } from '@/shared/api';
import { ProgressBar } from '@/shared/ui';
import { formatEventDate, formatPercent } from '@/shared/lib/format';
import { paths } from '@/shared/config/paths';
import type { UpcomingEvent } from '../../api/dashboard.api';

/** Tone + label for the countdown chip, by urgency. */
function useCountdown() {
  const { t } = useTranslation();
  return (days: number): { label: string; color: string } => {
    if (days <= 0) return { label: t('dashboard.happeningNow'), color: 'var(--color-approved)' };
    if (days === 1) return { label: t('dashboard.tomorrow'), color: 'var(--color-pending)' };
    if (days <= 7) return { label: t('dashboard.inDays', { count: days }), color: 'var(--color-pending)' };
    return { label: t('dashboard.inDays', { count: days }), color: 'var(--color-processing)' };
  };
}

export function UpcomingEvents({ events }: { events: UpcomingEvent[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const countdown = useCountdown();

  return (
    <section className="mb-6">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">{t('dashboard.upcoming')}</h2>
        <button
          onClick={() => navigate(paths.events)}
          className="text-[13px] font-medium text-accent transition-colors hover:text-accent-soft"
        >
          {t('dashboard.viewAllEvents')}
        </button>
      </div>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {events.map((e) => (
          <UpcomingCard
            key={e.eventId}
            event={e}
            countdown={countdown(e.countdownDays)}
            onOpen={() => navigate(paths.event(e.eventId))}
          />
        ))}
      </div>
    </section>
  );
}

function UpcomingCard({
  event: e,
  countdown: cd,
  onOpen,
}: {
  event: UpcomingEvent;
  countdown: { label: string; color: string };
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const cover = useEventCoverBackground(e.eventId, e.posterFileId);
  const ratio = e.cap > 0 ? e.going / e.cap : 0;

  return (
    <button
      onClick={onOpen}
      className="flex flex-col overflow-hidden rounded-[16px] border border-border bg-surface text-left transition-colors hover:border-border-strong"
    >
      <div className="relative h-[118px]" style={{ background: cover }}>
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,11,15,0.55),transparent_60%)]" />
        <span
          className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-lg bg-[rgba(11,11,15,0.62)] px-2.5 py-1 text-[11.5px] font-semibold backdrop-blur-[4px]"
          style={{ color: cd.color }}
        >
          <span className="size-1.5 rounded-full" style={{ background: cd.color }} />
          {cd.label}
        </span>
        <span className="absolute right-2.5 top-2.5">
          <EventStatusChip status={e.eventStatus} surface />
        </span>
      </div>

      <div className="px-4 py-3.5">
        <div className="truncate text-[15px] font-semibold tracking-[-0.01em]">{e.title}</div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-text-secondary">
          <CalendarDays size={13} className="text-text-muted" />
          {formatEventDate(e.eventStartDate, e.eventEndDate)}
        </div>
        <ProgressBar value={ratio} height={6} className="mt-3" />
        <div className="mt-2 flex items-center justify-between text-[12px] text-text-muted">
          <span className="font-mono">
            {e.going} / {e.cap}
          </span>
          <span>{t('dashboard.rsvpPct', { pct: formatPercent(ratio) })}</span>
        </div>
      </div>
    </button>
  );
}
