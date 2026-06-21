import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Ticket, Users } from 'lucide-react';

import { coverGradient } from '@/shared/lib/visual';
import { formatLocalDate } from '@/shared/lib/datetime';
import { type ModuleKey } from '../model/types';
import { useEventDraftStore } from '../model/event-draft-store';

/**
 * Live preview of the event the client is building. Updates on every keystroke
 * and toggle so customization is immediately visible.
 */
export function EventPreview() {
  const { t, i18n } = useTranslation();
  const d = useEventDraftStore((s) => s.draft);

  const enabledModules = (Object.keys(d.modules) as ModuleKey[]).filter((k) => d.modules[k]);
  const start = formatLocalDate(d.startDate, i18n.language);
  const end = formatLocalDate(d.endDate, i18n.language);
  const dateLabel = start ? (end && end !== start ? `${start} → ${end}` : start) : t('builder.preview.dateTbd');
  const locationLabel =
    d.locationType === 'virtual'
      ? t('builder.preview.virtualEvent')
      : d.venue || (d.locationType === 'hybrid' ? t('builder.preview.hybrid') : t('builder.preview.locationTbd'));

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">{t('builder.preview.livePreview')}</span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
          <span className="size-1.5 rounded-full" style={{ background: d.accent }} />
          {t('builder.preview.draft')}
        </span>
      </div>

      <div className="relative h-32" style={{ background: `${coverGradient(d.coverSeed)}, ${d.accent}` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(11,11,15,0.85), transparent 70%)` }} />
        <span
          className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm"
          style={{ background: `color-mix(in srgb, ${d.accent} 70%, black)` }}
        >
          {t(`builder.categories.${d.category}`)}
        </span>
      </div>

      <div className="p-4">
        <div className="truncate text-[16px] font-semibold tracking-[-0.01em]">
          {d.name || t('builder.preview.untitled')}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-text-muted" />
            {dateLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-text-muted" />
            {locationLabel}
          </span>
        </div>

        {d.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {d.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-surface-raised px-2 py-0.5 text-[11px] text-text-secondary">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {d.modules.mediaGallery && (
          <div className="mt-3.5 grid grid-cols-4 gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="aspect-square rounded-md"
                style={{ background: `${coverGradient(`${d.coverSeed}-${i}`)}, ${d.accent}` }}
              />
            ))}
          </div>
        )}

        <div className="mt-3.5 flex items-center gap-4 border-t border-hairline pt-3 text-[12px] text-text-secondary">
          {d.modules.registrations && (
            <span className="flex items-center gap-1.5">
              <Users size={13} style={{ color: d.accent }} />
              {t('builder.preview.cap', { count: d.capacity })}
            </span>
          )}
          {d.modules.tickets && (
            <span className="flex items-center gap-1.5">
              <Ticket size={13} style={{ color: d.accent }} />
              {t('builder.preview.tier', { count: d.ticketTiers.length })}
            </span>
          )}
          <span className="ml-auto font-mono text-[11px] capitalize text-text-muted">{d.visibility}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {enabledModules.map((k) => (
            <span
              key={k}
              className="rounded-full border px-2 py-0.5 text-[10.5px] font-medium"
              style={{ borderColor: `color-mix(in srgb, ${d.accent} 40%, transparent)`, color: d.accent }}
            >
              {t(`builder.modules.${k}`)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
