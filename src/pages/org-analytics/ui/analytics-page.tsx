import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';

import { useEvents } from '@/entities/event';
import { avatarGradient } from '@/shared/lib/visual';
import { AreaChart, Avatar, Button, Card, PageContainer, PageHeader, SectionHeader } from '@/shared/ui';

const MEDIA_TREND = [120, 160, 140, 220, 280, 260, 340, 300, 420, 460, 520, 600];

const LEADERS = [
  { name: 'Lena Vogt', assets: 1280 },
  { name: 'Priya Raman', assets: 964 },
  { name: 'Chen Wei', assets: 820 },
  { name: 'Marco Bellini', assets: 612 },
];

export function OrgAnalyticsPage() {
  const { t } = useTranslation();
  const { data: events = [] } = useEvents();
  const topEvents = [...events].sort((a, b) => b.assetCount - a.assetCount).slice(0, 4);

  const kpis = [
    { label: t('orgAnalytics.totalMedia'), value: '6.4k' },
    { label: t('orgAnalytics.storageUsed'), value: '412 GB' },
    { label: t('orgAnalytics.galleriesDelivered'), value: '11' },
    { label: t('orgAnalytics.avgCuration'), value: '2.4h' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('orgAnalytics.title')}
        description={t('orgAnalytics.subtitle')}
        actions={
          <Button variant="secondary" leadingIcon={<Download size={15} />}>
            {t('orgAnalytics.exportCsv')}
          </Button>
        }
      />

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} compact>
            <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">{k.label}</div>
            <div className="mt-2.5 font-mono text-[24px] font-semibold tracking-[-0.02em]">{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <SectionHeader title={t('orgAnalytics.mediaOverTime')} action={<span className="text-xs text-text-muted">{t('orgAnalytics.last12weeks')}</span>} />
          <AreaChart data={MEDIA_TREND} height={150} />
        </Card>

        <Card>
          <SectionHeader title={t('orgAnalytics.leaderboard')} />
          <div className="flex flex-col">
            {LEADERS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 border-t border-hairline py-3 first:border-0">
                <span className="w-4 font-mono text-[13px] text-text-muted">{i + 1}</span>
                <Avatar name={p.name} size={32} background={avatarGradient(p.name)} />
                <span className="flex-1 text-[13.5px] font-medium">{p.name}</span>
                <span className="font-mono text-[12.5px] text-text-secondary">{p.assets.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-[18px] p-0">
        <div className="px-5 py-3 text-[13px] font-semibold">{t('orgAnalytics.topEventsByMedia')}</div>
        {topEvents.map((e) => (
          <div key={e.id} className="flex items-center gap-3 border-t border-hairline px-5 py-3">
            <span className="flex-1 text-[13.5px] font-medium">{e.name}</span>
            <span className="h-[5px] w-40 overflow-hidden rounded-full bg-border">
              <span className="block h-full rounded-full bg-accent" style={{ width: `${(e.assetCount / 2400) * 100}%` }} />
            </span>
            <span className="w-16 text-right font-mono text-[12.5px] text-text-secondary">{e.assetCount.toLocaleString()}</span>
          </div>
        ))}
      </Card>
    </PageContainer>
  );
}
