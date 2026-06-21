import { useTranslation } from 'react-i18next';
import { Image, Music2, Video } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import { MediaTile, useRecentMedia } from '@/entities/media';
import { useLightboxStore } from '@/features/media-curation';
import { Card, SectionHeader } from '@/shared/ui';

interface OverviewTabProps {
  event: EventDetail;
  onGoTab: (tab: string) => void;
}

/** KPI label key (matches the order built in event.mock buildDetail). */
const KPI_KEYS = ['kpiTotalMedia', 'kpiImages', 'kpiVideos', 'kpiAudio', 'kpiRegistered'];

const TYPE_ROWS = [
  { key: 'image', icon: Image, ratio: 0.8, color: 'var(--color-accent)' },
  { key: 'video', icon: Video, ratio: 0.14, color: 'var(--color-processing)' },
  { key: 'audio', icon: Music2, ratio: 0.06, color: 'var(--color-pending)' },
] as const;

export function OverviewTab({ event, onGoTab }: OverviewTabProps) {
  const { t } = useTranslation();
  const { data: recent = [] } = useRecentMedia(event.id, 8);
  const openLightbox = useLightboxStore((s) => s.openAt);

  return (
    <div className="space-y-[18px]">
      <div className="flex items-center gap-2 text-[13px] text-text-secondary">
        <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
          <span className="flex size-[18px] items-center justify-center rounded-[5px] bg-[linear-gradient(140deg,#6D5EF6,#4AA8FF)] text-[9px] font-bold text-white">
            JB
          </span>
          {t('eventDetail.overview.hostedBy')} <strong className="font-semibold text-text">{event.host}</strong>
        </span>
      </div>

      {/* Scoped KPIs */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
        {event.kpis.map((k, i) => (
          <Card key={k.label} compact>
            <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">
              {t(`eventDetail.overview.${KPI_KEYS[i] ?? 'kpiTotalMedia'}`)}
            </div>
            <div className="mt-2.5 font-mono text-[24px] font-semibold tracking-[-0.02em]">{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.6fr]">
        {/* Media library breakdown */}
        <Card>
          <SectionHeader
            title={t('eventDetail.overview.mediaLibrary')}
            action={
              <button onClick={() => onGoTab('media')} className="text-[12.5px] font-medium text-accent">
                {t('eventDetail.overview.openLibrary')}
              </button>
            }
          />
          <div className="flex flex-col">
            {TYPE_ROWS.map((row) => {
              const Icon = row.icon;
              const count = Math.round(event.assetCount * row.ratio);
              return (
                <div key={row.key} className="flex items-center gap-3 border-t border-hairline py-3 first:border-0">
                  <span
                    className="flex size-9 flex-none items-center justify-center rounded-lg"
                    style={{ background: `color-mix(in srgb, ${row.color} 16%, transparent)`, color: row.color }}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="flex-1 text-[13.5px] font-medium">{t(`media.type.${row.key}`)}</span>
                  <span className="font-mono text-[13px] text-text-secondary">{count.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent uploads */}
        <Card>
          <SectionHeader
            title={t('eventDetail.overview.recentUploads')}
            action={
              <button onClick={() => onGoTab('media')} className="text-[12.5px] font-medium text-accent">
                {t('eventDetail.overview.reviewAll')}
              </button>
            }
          />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2.5">
            {recent.map((m) => (
              <MediaTile key={m.id} asset={m} onOpen={() => openLightbox(recent, m.id)} />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader
          title={t('eventDetail.overview.agendaHighlights')}
          action={
            <button onClick={() => onGoTab('agenda')} className="text-[12.5px] font-medium text-accent">
              {t('eventDetail.overview.fullSchedule')}
            </button>
          }
        />
        <div className="flex flex-col">
          {event.agenda.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-center gap-4 border-t border-hairline py-3 first:border-0">
              <span className="w-12 flex-none font-mono text-[13px] text-text-secondary">{a.time}</span>
              <span className="h-8 w-[3px] flex-none rounded-full" style={{ background: a.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium">{a.title}</div>
                <div className="mt-0.5 text-xs text-text-muted">
                  {a.speaker ? `${a.speaker} · ${a.room}` : a.room}
                </div>
              </div>
              <span
                className="flex-none rounded-md px-2.5 py-1 text-[11px] font-semibold"
                style={{ color: a.color, background: 'rgba(255,255,255,0.04)' }}
              >
                {a.track}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
