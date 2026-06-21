import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Plus, Rows3, Rows4 } from 'lucide-react';

import {
  EventCard,
  EventRow,
  EventTableHeader,
  useEvents,
  type EventListFilters,
} from '@/entities/event';
import type { EventStatus } from '@/shared/config/status';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  FilterChip,
  PageContainer,
  PageHeader,
  SegmentedControl,
  Skeleton,
} from '@/shared/ui';
import { useUiPrefs } from '@/widgets/app-shell';
import { paths } from '@/shared/config/paths';

type StatusFilter = EventStatus | 'all';

const FILTER_KEYS: { key: StatusFilter; i18n: string }[] = [
  { key: 'all', i18n: 'all' },
  { key: 'shooting', i18n: 'shooting' },
  { key: 'in-review', i18n: 'inReview' },
  { key: 'scheduled', i18n: 'scheduled' },
  { key: 'delivered', i18n: 'delivered' },
  { key: 'draft', i18n: 'draft' },
  { key: 'archived', i18n: 'archived' },
];

export function EventsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Saved view + filter + density persist across sessions.
  const { eventsStatus: status, eventsView: view, eventsDensity: density, setEventsStatus, setEventsView, setEventsDensity } =
    useUiPrefs();

  const filters: EventListFilters = { status };
  const { data: events, isLoading, isError, refetch } = useEvents(filters);

  const open = (id: string) => navigate(paths.event(id));

  return (
    <PageContainer>
      <PageHeader
        title={t('events.title')}
        description={events ? t('events.count', { count: events.length }) : t('common.loading')}
        actions={
          <Button variant="primary" size="lg" leadingIcon={<Plus size={17} strokeWidth={2.4} />} onClick={() => navigate(paths.eventNew)}>
            {t('events.newEvent')}
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="flex flex-1 flex-wrap gap-1.5">
          {FILTER_KEYS.map((f) => (
            <FilterChip key={f.key} label={t(`events.filters.${f.i18n}`)} active={status === f.key} onClick={() => setEventsStatus(f.key)} />
          ))}
        </div>
        {view === 'table' && (
          <SegmentedControl
            value={density}
            onChange={setEventsDensity}
            options={[
              { value: 'comfortable', content: <Rows3 size={15} />, 'aria-label': t('events.comfortable') },
              { value: 'compact', content: <Rows4 size={15} />, 'aria-label': t('events.compact') },
            ]}
          />
        )}
        <SegmentedControl
          value={view}
          onChange={setEventsView}
          options={[
            { value: 'cards', content: <LayoutGrid size={15} />, 'aria-label': t('events.cardView') },
            { value: 'table', content: <List size={15} />, 'aria-label': t('events.tableView') },
          ]}
        />
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !events ? (
        <EventsSkeleton view={view} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Plus size={24} />}
          title={t('events.noMatch')}
          description={t('events.noMatchDesc')}
          action={
            <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={() => navigate(paths.eventNew)}>
              {t('events.newEvent')}
            </Button>
          }
        />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(312px,1fr))] gap-[18px]">
          {events.map((e) => (
            <EventCard key={e.id} event={e} onOpen={open} />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <EventTableHeader />
          {events.map((e) => (
            <EventRow key={e.id} event={e} onOpen={open} dense={density === 'compact'} />
          ))}
        </Card>
      )}
    </PageContainer>
  );
}

function EventsSkeleton({ view }: { view: 'cards' | 'table' }) {
  if (view === 'table') {
    return (
      <Card className="p-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-b border-hairline px-[18px] py-4 last:border-0">
            <Skeleton height={20} />
          </div>
        ))}
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(312px,1fr))] gap-[18px]">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={260} radius={16} />
      ))}
    </div>
  );
}
