import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CalendarPlus, ChevronRight, Plus, Send, Upload } from 'lucide-react';

import { ActivityRow } from '@/entities/activity';
import { EventStatusChip, useEvents } from '@/entities/event';
import { KpiCard, KpiCardSkeleton } from '@/entities/kpi';
import { useRecentMedia, MediaTile } from '@/entities/media';
import { useViewer } from '@/entities/session';
import { useLightboxStore } from '@/features/media-curation';
import { coverBackground } from '@/shared/lib/visual';
import { Button, Card, ErrorState, PageContainer, PageHeader, SectionHeader, Skeleton } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { useDashboard } from '../api/dashboard.api';

const KPI_KEY: Record<string, string> = {
  active: 'activeEvents',
  media: 'totalMedia',
  shooting: 'shootingToday',
  storage: 'storageUsed',
  delivered: 'delivered',
};

/** Organizer home — at-a-glance health of all events (design spec §5.1). */
export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const viewer = useViewer();
  const { data, isLoading, isError, refetch } = useDashboard();
  const { data: events = [], isLoading: loadingEvents } = useEvents();
  const { data: recent = [] } = useRecentMedia('evt_summit', 12);
  const openLightbox = useLightboxStore((s) => s.openAt);

  // Events that still need setting up (no media yet / not live).
  const needsSetup = events.filter((e) => e.status === 'draft' || e.status === 'scheduled').slice(0, 3);

  // First-run: an empty workspace gets a guided onboarding hero.
  if (!loadingEvents && events.length === 0) {
    return <OnboardingHero onCreate={() => navigate(paths.eventNew)} />;
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('dashboard.greeting', { name: viewer.name.split(' ')[0] })}
        description={t('dashboard.subtitle')}
        actions={
          <Button variant="primary" size="lg" leadingIcon={<Plus size={17} strokeWidth={2.4} />} onClick={() => navigate(paths.eventNew)}>
            {t('dashboard.newEvent')}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
        {isError ? (
          <div className="col-span-full">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : isLoading || !data ? (
          Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          data.kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={{ ...kpi, label: t(`dashboard.kpi.${KPI_KEY[kpi.id] ?? kpi.id}`) }} />
          ))
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 lg:grid-cols-[1.55fr_1fr]" style={{ gap: 18 }}>
        <Card>
          <SectionHeader
            indicator={
              <span className="animate-pulse-dot size-[7px] rounded-full bg-approved shadow-[0_0_0_4px_rgba(61,214,140,0.16)]" />
            }
            title={t('dashboard.liveActivity')}
            action={<span className="text-xs text-text-muted">{t('common.lastHour')}</span>}
          />
          <div className="flex flex-col">
            {isLoading || !data
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3.5 py-3">
                    <Skeleton width={36} height={36} radius={999} />
                    <Skeleton height={14} className="flex-1" />
                  </div>
                ))
              : data.activity.map((item) => <ActivityRow key={item.id} item={item} />)}
          </div>
        </Card>

        <Card>
          <SectionHeader title={t('dashboard.needsAttention')} />
          <div className="flex flex-col">
            {needsSetup.length === 0 && (
              <p className="py-6 text-center text-[13px] text-text-muted">{t('dashboard.allCaught')}</p>
            )}
            {needsSetup.map((e) => (
              <button
                key={e.id}
                onClick={() => navigate(paths.event(e.id))}
                className="flex items-center gap-3.5 border-t border-hairline py-3.5 text-left transition-opacity first:border-0 hover:opacity-80"
              >
                <span className="size-[46px] flex-none rounded-[9px]" style={{ background: coverBackground(e.coverSeed) }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium">{e.name}</div>
                  <div className="mt-1.5">
                    <EventStatusChip status={e.status} />
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[12px] font-semibold text-accent">
                  {t('dashboard.setUp')} <ChevronRight size={15} />
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader
          title={t('dashboard.recentMedia')}
          action={
            <button onClick={() => navigate(paths.events)} className="text-[13px] font-medium text-accent hover:text-accent-soft">
              {t('dashboard.viewAllEvents')}
            </button>
          }
        />
        <div className="flex gap-3 overflow-x-auto pb-1.5">
          {recent.map((m) => (
            <div key={m.id} className="w-[148px] flex-none">
              <MediaTile asset={m} onOpen={() => openLightbox(recent, m.id)} />
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}

/** First-run guided hero for an empty workspace (activation). */
function OnboardingHero({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  const steps = [
    { icon: CalendarPlus, key: 'step1' },
    { icon: Upload, key: 'step2' },
    { icon: Send, key: 'step3' },
  ];
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="animate-in w-full max-w-2xl text-center">
        <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#6D5EF6,#9d7bff)] text-2xl shadow-[0_8px_30px_rgba(109,94,246,0.4)]">
          ✨
        </span>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{t('onboarding.title')}</h1>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-text-secondary">{t('onboarding.subtitle')}</p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {steps.map(({ icon: Icon, key }, i) => (
            <Card key={key} className="text-left">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[rgba(109,94,246,0.14)] text-accent-soft">
                  <Icon size={18} />
                </span>
                <span className="font-mono text-xs text-text-muted">0{i + 1}</span>
              </div>
              <div className="text-[13.5px] font-semibold">{t(`onboarding.${key}`)}</div>
              <div className="mt-1 text-xs text-text-muted">{t(`onboarding.${key}desc`)}</div>
            </Card>
          ))}
        </div>

        <Button className="mx-auto mt-8" variant="primary" size="lg" trailingIcon={<ArrowRight size={17} />} onClick={onCreate}>
          {t('onboarding.cta')}
        </Button>
      </div>
    </div>
  );
}
