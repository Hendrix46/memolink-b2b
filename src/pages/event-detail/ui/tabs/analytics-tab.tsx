import { useTranslation } from 'react-i18next';

import { useEventAnalytics } from '@/entities/analytics';
import { useUserDirectoryMap, useUserDirectorySeed } from '@/entities/user';
import { avatarGradient } from '@/shared/lib/visual';
import { formatCompact, formatNumber } from '@/shared/lib/format';
import {
  Avatar,
  Card,
  DonutChart,
  EmptyState,
  ErrorState,
  SectionHeader,
  Skeleton,
  type DonutSegment,
} from '@/shared/ui';

const RSVP_COLORS = [
  'var(--color-approved)',
  'var(--color-processing)',
  'var(--color-pending)',
  'var(--color-accent)',
  'var(--color-rejected)',
];

export function AnalyticsTab({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useEventAnalytics(eventId);
  useUserDirectorySeed();
  const directory = useUserDirectoryMap();

  if (isError) {
    return <ErrorState title={t('eventDetail.analytics.loadError')} onRetry={() => refetch()} />;
  }

  const kpis = [
    { label: t('eventDetail.analytics.galleryViews'), value: data ? formatCompact(data.views) : '—' },
    { label: t('eventDetail.analytics.uniqueVisitors'), value: data ? formatCompact(data.uniqueVisitors) : '—' },
    { label: t('eventDetail.analytics.downloads'), value: data ? formatCompact(data.downloads) : '—' },
    { label: t('eventDetail.analytics.checkedIn'), value: data ? formatNumber(data.attendance.checkedIn) : '—' },
  ];

  const rsvp = Object.entries(data?.attendance.rsvpBreakdown ?? {});
  const segments: DonutSegment[] = rsvp.map(([label, value], i) => ({
    value,
    color: RSVP_COLORS[i % RSVP_COLORS.length],
    label,
  }));
  const rsvpTotal = segments.reduce((sum, s) => sum + s.value, 0);
  const photographers = data?.photographers ?? [];

  return (
    <div className="space-y-[18px]">
      <h2 className="text-base font-semibold">{t('eventDetail.analytics.performance')}</h2>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} compact>
            <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">{k.label}</div>
            {isLoading ? (
              <Skeleton height={28} width={64} className="mt-2.5" />
            ) : (
              <div className="mt-2.5 font-mono text-[24px] font-semibold tracking-[-0.02em]">{k.value}</div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <SectionHeader title={t('eventDetail.analytics.rsvpBreakdown')} />
          {isLoading ? (
            <Skeleton height={150} radius={12} />
          ) : segments.length > 0 ? (
            <div className="flex items-center gap-5">
              <DonutChart
                segments={segments}
                center={
                  <div>
                    <div className="font-mono text-[18px] font-semibold leading-none">{formatCompact(rsvpTotal)}</div>
                    <div className="text-[10px] uppercase text-text-muted">{t('eventDetail.analytics.rsvps')}</div>
                  </div>
                }
              />
              <div className="flex flex-col gap-2.5">
                {segments.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-[13px]">
                    <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                    <span className="flex-1">{s.label}</span>
                    <span className="font-mono text-text-secondary">{formatNumber(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title={t('eventDetail.analytics.noData')} />
          )}
        </Card>

        <Card>
          <SectionHeader title={t('eventDetail.analytics.photographerContributions')} />
          {isLoading ? (
            <Skeleton height={150} radius={12} />
          ) : photographers.length > 0 ? (
            <div className="flex flex-col">
              {photographers.map((p, i) => (
                <div key={p.userId} className="flex items-center gap-3 border-t border-hairline py-3 first:border-0">
                  <span className="w-4 font-mono text-[13px] text-text-muted">{i + 1}</span>
                  <Avatar name={directory[p.userId]?.name ?? p.userId} size={32} background={avatarGradient(p.userId)} />
                  <span className="flex-1 truncate text-[12.5px] text-text-secondary">
                    {directory[p.userId]?.name ?? t('common.unknownUser')}
                  </span>
                  <span className="font-mono text-[12.5px] text-text-secondary">
                    {t('eventDetail.analytics.deliveredCount', { count: p.delivered })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t('eventDetail.analytics.noPhotographers')} />
          )}
        </Card>
      </div>
    </div>
  );
}
