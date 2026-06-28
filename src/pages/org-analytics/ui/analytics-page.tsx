import { useTranslation } from 'react-i18next';

import { useOrgAnalytics, useLeaderboard } from '@/entities/analytics';
import { useActiveOrgId } from '@/entities/session';
import { avatarGradient } from '@/shared/lib/visual';
import { formatCompact, formatNumber } from '@/shared/lib/format';
import { AreaChart, Avatar, Card, EmptyState, ErrorState, PageContainer, PageHeader, SectionHeader, Skeleton } from '@/shared/ui';

export function OrgAnalyticsPage() {
  const { t } = useTranslation();
  const orgId = useActiveOrgId() ?? '';

  const analytics = useOrgAnalytics(orgId);
  const leaderboard = useLeaderboard(orgId, { entity: 'PHOTOGRAPHERS', metric: 'DELIVERED', limit: 8 });

  const data = analytics.data;
  const perEvent = [...(data?.perEvent ?? [])].sort((a, b) => b.views - a.views).slice(0, 8);
  const topMax = Math.max(1, ...perEvent.map((e) => e.views));

  const kpis = [
    { label: t('orgAnalytics.totalViews'), value: data ? formatCompact(data.totalViews) : '—' },
    { label: t('orgAnalytics.totalDownloads'), value: data ? formatCompact(data.totalDownloads) : '—' },
    { label: t('orgAnalytics.uniqueVisitors'), value: data ? formatCompact(data.totalUniqueVisitors) : '—' },
    { label: t('orgAnalytics.totalEvents'), value: data ? formatNumber(data.totalEvents) : '—' },
  ];

  if (analytics.isError) {
    return (
      <PageContainer>
        <PageHeader title={t('orgAnalytics.title')} description={t('orgAnalytics.subtitle')} />
        <ErrorState title={t('orgAnalytics.loadError')} onRetry={() => analytics.refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={t('orgAnalytics.title')} description={t('orgAnalytics.subtitle')} />

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} compact>
            <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">{k.label}</div>
            {analytics.isLoading ? (
              <Skeleton height={28} width={64} className="mt-2.5" />
            ) : (
              <div className="mt-2.5 font-mono text-[24px] font-semibold tracking-[-0.02em]">{k.value}</div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <SectionHeader title={t('orgAnalytics.viewsPerEvent')} />
          {analytics.isLoading ? (
            <Skeleton height={150} radius={12} />
          ) : perEvent.length > 0 ? (
            <AreaChart data={perEvent.map((e) => e.views)} height={150} />
          ) : (
            <EmptyState title={t('orgAnalytics.noData')} />
          )}
        </Card>

        <Card>
          <SectionHeader title={t('orgAnalytics.leaderboard')} />
          {leaderboard.isLoading ? (
            <Skeleton height={150} radius={12} />
          ) : leaderboard.data && leaderboard.data.length > 0 ? (
            <div className="flex flex-col">
              {leaderboard.data.map((entry) => (
                <div key={entry.entityId} className="flex items-center gap-3 border-t border-hairline py-3 first:border-0">
                  <span className="w-4 font-mono text-[13px] text-text-muted">{entry.rank}</span>
                  <Avatar name={entry.entityLabel} size={32} background={avatarGradient(entry.entityLabel)} />
                  <span className="flex-1 truncate text-[13.5px] font-medium">{entry.entityLabel}</span>
                  <span className="font-mono text-[12.5px] text-text-secondary">{formatNumber(entry.metricValue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t('orgAnalytics.noData')} />
          )}
        </Card>
      </div>

      <Card className="mt-[18px] p-0">
        <div className="px-5 py-3 text-[13px] font-semibold">{t('orgAnalytics.topEventsByViews')}</div>
        {analytics.isLoading ? (
          <div className="px-5 pb-5">
            <Skeleton height={80} radius={10} />
          </div>
        ) : perEvent.length > 0 ? (
          perEvent.map((e) => (
            <div key={e.eventId} className="flex items-center gap-3 border-t border-hairline px-5 py-3">
              <span className="flex-1 truncate font-mono text-[12.5px] text-text-secondary">{e.eventId}</span>
              <span className="h-[5px] w-40 overflow-hidden rounded-full bg-border">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${(e.views / topMax) * 100}%` }} />
              </span>
              <span className="w-16 text-right font-mono text-[12.5px] text-text-secondary">{formatNumber(e.views)}</span>
            </div>
          ))
        ) : (
          <div className="px-5 pb-5 pt-1">
            <EmptyState title={t('orgAnalytics.noData')} />
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
