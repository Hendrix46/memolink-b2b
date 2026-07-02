import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, MapPin, Pencil, Send, Share2 } from 'lucide-react';

import { EventStatusChip, useEvent } from '@/entities/event';
import { EditEventModal } from './edit-event-modal';
import { useEventCoverBackground } from '@/shared/api';
import { formatEventDate } from '@/shared/lib/format';
import { Button, ErrorState, Skeleton, Tabs, type TabItem } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { OverviewTab } from './tabs/overview-tab';
import { HostsTab } from './tabs/hosts-tab';
import { MediaTab } from './tabs/media-tab';
import { PhotographersTab } from './tabs/photographers-tab';
import { VenueTab } from './tabs/venue-tab';
import { AgendaTab } from './tabs/agenda-tab';
import { RegistrationsTab } from './tabs/registrations-tab';
import { BrandingTab } from './tabs/branding-tab';
import { DeliveryTab } from './tabs/delivery-tab';
import { AnalyticsTab } from './tabs/analytics-tab';
import { SettingsTab } from './tabs/settings-tab';

/** Command center for one event (design spec §5.4). Tab state lives in the URL. */
export function EventDetailPage() {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const tab = search.get('tab') ?? 'overview';
  const [editOpen, setEditOpen] = useState(false);

  const { data: event, isLoading, isError, refetch } = useEvent(eventId);
  // Presigned poster background (called before the early returns — hooks order).
  const cover = useEventCoverBackground(eventId ?? '', event?.posterFileId);

  const setTab = (next: string) => setSearch({ tab: next }, { replace: true });

  if (isError) {
    return (
      <div className="mx-auto max-w-[1500px] px-[34px] pt-10">
        <ErrorState title={t('eventDetail.notFound')} description={t('eventDetail.notFoundDesc')} onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading || !event) {
    return (
      <div>
        <Skeleton height={208} radius={0} />
        <div className="mx-auto max-w-[1500px] px-[34px] pt-7">
          <Skeleton height={40} className="mb-6" width={420} />
          <div className="grid grid-cols-5 gap-3.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={84} radius={14} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs: TabItem[] = [
    { value: 'overview', label: t('eventDetail.tabs.overview') },
    { value: 'hosts', label: t('eventDetail.tabs.hosts') },
    { value: 'venue', label: t('eventDetail.tabs.venue') },
    { value: 'agenda', label: t('eventDetail.tabs.agenda') },
    { value: 'registrations', label: t('eventDetail.tabs.registrations') },
    { value: 'media', label: t('eventDetail.tabs.media') },
    { value: 'photographers', label: t('eventDetail.tabs.photographers'), badge: event.photographerTeam.length || undefined },
    { value: 'branding', label: t('eventDetail.tabs.branding') },
    { value: 'delivery', label: t('eventDetail.tabs.delivery') },
    { value: 'analytics', label: t('eventDetail.tabs.analytics') },
    { value: 'settings', label: t('eventDetail.tabs.settings') },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative flex h-[208px] items-end" style={{ background: cover }}>
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,11,15,0.92)_0%,rgba(11,11,15,0.4)_45%,rgba(11,11,15,0.15)_100%)]" />
        <div className="relative mx-auto w-full max-w-[1500px] px-[34px] pb-5.5" style={{ paddingBottom: 22 }}>
          <button
            onClick={() => navigate(paths.events)}
            className="mb-3 flex items-center gap-1.5 text-[12.5px] text-text-secondary transition-colors hover:text-text"
          >
            <ChevronLeft size={14} />
            {t('nav.events')}
            <span className="text-border-strong">/</span>
            <span className="text-text-muted">{event.title}</span>
          </button>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-2">
                <EventStatusChip status={event.eventStatus} surface />
              </div>
              <h1 className="text-[30px] font-semibold tracking-[-0.025em]">{event.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-[13.5px] text-text-secondary">
                <Calendar size={14} />
                {formatEventDate(event.eventStartDate, event.eventEndDate)}
                {event.locationName && (
                  <>
                    <span className="text-border-strong">·</span>
                    <MapPin size={14} />
                    {event.locationName}
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2.5">
              <Button variant="secondary" leadingIcon={<Pencil size={15} />} onClick={() => setEditOpen(true)}>
                {t('eventDetail.edit')}
              </Button>
              <Button variant="secondary" leadingIcon={<Share2 size={15} />}>
                {t('eventDetail.share')}
              </Button>
              <Button variant="primary" leadingIcon={<Send size={15} />} onClick={() => setTab('delivery')}>
                {t('eventDetail.deliver')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-base">
        <div className="mx-auto max-w-[1500px] px-[34px]">
          <Tabs items={tabs} value={tab} onChange={setTab} />
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-[1500px] px-[34px] pb-16 pt-6">
        {tab === 'overview' && <OverviewTab event={event} onGoTab={setTab} />}
        {tab === 'hosts' && <HostsTab event={event} />}
        {tab === 'venue' && <VenueTab event={event} />}
        {tab === 'agenda' && <AgendaTab event={event} />}
        {tab === 'registrations' && <RegistrationsTab event={event} />}
        {tab === 'media' && <MediaTab eventId={event.eventId} />}
        {tab === 'photographers' && <PhotographersTab event={event} />}
        {tab === 'branding' && <BrandingTab event={event} />}
        {tab === 'delivery' && <DeliveryTab event={event} />}
        {tab === 'analytics' && <AnalyticsTab eventId={event.eventId} />}
        {tab === 'settings' && <SettingsTab event={event} />}
      </div>

      {editOpen && <EditEventModal open event={event} onClose={() => setEditOpen(false)} />}
    </div>
  );
}
