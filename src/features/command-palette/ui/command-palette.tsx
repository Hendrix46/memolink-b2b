import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, CalendarDays, CalendarPlus, LayoutDashboard, Search, Settings, UserPlus } from 'lucide-react';

import { useEvents } from '@/entities/event';
import { useEventCoverBackground } from '@/shared/api';
import { paths } from '@/shared/config/paths';
import { useCommandPalette } from '../model/store';

/** Global command palette (design spec §8.6): jump to events + quick actions. */
export function CommandPalette() {
  const { t } = useTranslation();
  const { open, setOpen } = useCommandPalette();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { data: events = [] } = useEvents();

  // Global ⌘K / Ctrl+K binding.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const matches = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return events.slice(0, 5);
    return events.filter((e) => e.title.toLowerCase().includes(q)).slice(0, 6);
  }, [events, query]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center bg-black/60 p-4 pt-[14vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="animate-pop w-full max-w-[560px] overflow-hidden rounded-[14px] border border-border bg-surface-raised shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={17} className="text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('command.placeholder')}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-text-secondary">
            esc
          </kbd>
        </div>

        <div className="max-h-[340px] overflow-y-auto p-1.5">
          <Group label={t('command.quickActions')}>
            <Row icon={<CalendarPlus size={16} />} title={t('command.createEvent')} onClick={() => go(paths.eventNew)} />
            <Row icon={<UserPlus size={16} />} title={t('command.invitePhotographer')} onClick={() => go(paths.photographers)} />
            <Row icon={<LayoutDashboard size={16} />} title={t('command.goDashboard')} onClick={() => go(paths.dashboard)} />
          </Group>

          <Group label={t('command.navigate')}>
            <Row icon={<CalendarDays size={16} />} title={t('nav.events')} onClick={() => go(paths.events)} />
            <Row icon={<BarChart3 size={16} />} title={t('nav.analytics')} onClick={() => go(paths.analytics)} />
            <Row icon={<Settings size={16} />} title={t('nav.settings')} onClick={() => go(paths.settings)} />
          </Group>

          <Group label={t('command.events')}>
            {matches.map((e) => (
              <Row
                key={e.eventId}
                icon={<EventCoverIcon eventId={e.eventId} posterFileId={e.posterFileId} />}
                title={e.title}
                meta={e.locationName ?? undefined}
                onClick={() => go(paths.event(e.eventId))}
              />
            ))}
            {matches.length === 0 && (
              <p className="px-3 py-6 text-center text-[13px] text-text-muted">{t('command.noMatch', { query })}</p>
            )}
          </Group>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-text-muted">{label}</div>
      {children}
    </div>
  );
}

function Row({
  icon,
  title,
  meta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-border"
    >
      <span className="flex size-6 items-center justify-center text-text-secondary">{icon}</span>
      <span className="flex-1 text-[13.5px] font-medium">{title}</span>
      {meta && <span className="text-xs text-text-muted">{meta}</span>}
    </button>
  );
}

/** Tiny presigned event-cover swatch for palette rows (gradient while loading). */
function EventCoverIcon({ eventId, posterFileId }: { eventId: string; posterFileId?: string | null }) {
  const cover = useEventCoverBackground(eventId, posterFileId);
  return <span className="size-6 rounded-md" style={{ background: cover }} />;
}
