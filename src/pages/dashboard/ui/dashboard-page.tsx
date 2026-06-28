import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

import { useEvents } from '@/entities/event';
import { KpiCard, KpiCardSkeleton } from '@/entities/kpi';
import { useViewer } from '@/entities/session';
import { Button, ErrorState, PageContainer, PageHeader } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { useDashboard } from '../api/dashboard.api';
import { EventPipeline } from './parts/event-pipeline';
import { UpcomingEvents } from './parts/upcoming-events';
import { TasksPanel } from './parts/tasks-panel';
import { GalleryAnalytics } from './parts/gallery-analytics';
import { RecentMediaStrip } from './parts/recent-media-strip';
import { Onboarding } from './parts/onboarding';

/** Organizer home — self-serve dashboard (design spec §5.1, spec 01 §3). */
export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const viewer = useViewer();
  const { data, isLoading, isError, refetch } = useDashboard();
  const { data: events = [], isLoading: loadingEvents } = useEvents();

  // First-run: an empty workspace gets the guided onboarding hero.
  if (!loadingEvents && events.length === 0) {
    return <Onboarding />;
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('dashboard.greeting', { name: viewer.name.split(' ')[0] })}
        description={t('dashboard.subtitle')}
        actions={
          <Button
            variant="primary"
            leadingIcon={<Sparkles size={16} />}
            onClick={() => navigate(paths.eventNew)}
          >
            {t('dashboard.createWithAi')}
          </Button>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          {data && <EventPipeline stages={data.pipeline} />}
          {data && <UpcomingEvents events={data.upcoming} />}

          <div className="mb-6 grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
            {isLoading || !data
              ? Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
              : data.kpis.map((kpi) => (
                  <KpiCard key={kpi.id} kpi={{ ...kpi, label: t(`dashboard.kpi.${kpi.id}`) }} />
                ))}
          </div>

          {data && (
            <div className="mb-6 grid grid-cols-1 gap-[18px] lg:grid-cols-[1.55fr_1fr]">
              <TasksPanel tasks={data.tasks} />
              <GalleryAnalytics data={data.gallery} />
            </div>
          )}

          <RecentMediaStrip />
        </>
      )}
    </PageContainer>
  );
}
