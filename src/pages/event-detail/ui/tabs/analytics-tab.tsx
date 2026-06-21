import { useTranslation } from 'react-i18next';
import { Download, TrendingUp } from 'lucide-react';

import { TEAM_MEMBERS } from '@/shared/api/people';
import { avatarGradient } from '@/shared/lib/visual';
import { AreaChart, Avatar, Button, Card, DonutChart, SectionHeader, type DonutSegment } from '@/shared/ui';

const VIEWS = [12, 18, 15, 24, 30, 28, 42, 38, 51, 47, 62, 70];

export function AnalyticsTab() {
  const { t } = useTranslation();
  const kpis = [
    { label: t('eventDetail.analytics.galleryViews'), value: '24.8k' },
    { label: t('eventDetail.analytics.uniqueVisitors'), value: '9,312' },
    { label: t('eventDetail.analytics.downloads'), value: '3,440' },
    { label: t('eventDetail.analytics.avgTime'), value: '4m 12s' },
  ];

  const segments: DonutSegment[] = [
    { value: 80, color: 'var(--color-accent)', label: t('media.type.image') },
    { value: 14, color: 'var(--color-processing)', label: t('media.type.video') },
    { value: 6, color: 'var(--color-pending)', label: t('media.type.audio') },
  ];

  const contributors = TEAM_MEMBERS.slice(0, 4);

  return (
    <div className="space-y-[18px]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t('eventDetail.analytics.performance')}</h2>
        <Button variant="secondary" leadingIcon={<Download size={15} />}>
          {t('eventDetail.analytics.exportCsv')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} compact>
            <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">{k.label}</div>
            <div className="mt-2.5 font-mono text-[24px] font-semibold tracking-[-0.02em]">{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <SectionHeader
            title={t('eventDetail.analytics.viewsOverTime')}
            action={<span className="text-xs text-text-muted">{t('eventDetail.analytics.last12days')}</span>}
          />
          <AreaChart data={VIEWS} height={140} />
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[rgba(61,214,140,0.1)] px-2.5 py-1 text-[12px] font-semibold text-approved">
            <TrendingUp size={13} />
            {t('eventDetail.analytics.vsAverage', { pct: '18%' })}
          </div>
        </Card>

        <Card>
          <SectionHeader title={t('eventDetail.analytics.mediaMix')} />
          <div className="flex items-center gap-5">
            <DonutChart
              segments={segments}
              center={
                <div>
                  <div className="font-mono text-[18px] font-semibold leading-none">5.7k</div>
                  <div className="text-[10px] uppercase text-text-muted">{t('eventDetail.overview.kpiTotalMedia')}</div>
                </div>
              }
            />
            <div className="flex flex-col gap-2.5">
              {segments.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-[13px]">
                  <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                  <span className="flex-1">{s.label}</span>
                  <span className="font-mono text-text-secondary">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title={t('eventDetail.analytics.topContributors')} />
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {contributors.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 border-t border-hairline py-3 first:border-0 sm:[&:nth-child(2)]:border-0">
              <span className="w-4 font-mono text-[13px] text-text-muted">{i + 1}</span>
              <Avatar name={p.name} size={32} background={avatarGradient(p.name)} />
              <span className="flex-1 text-[13.5px] font-medium">{p.name}</span>
              <span className="font-mono text-[12.5px] text-text-secondary">
                {t('eventDetail.analytics.assets', { count: [642, 418, 295, 180][i] ?? 120 })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
