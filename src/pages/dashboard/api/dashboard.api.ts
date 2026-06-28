import { useQuery } from '@tanstack/react-query';

import type { Kpi } from '@/entities/kpi';
import { eventApi } from '@/entities/event';
import type { EventSummary } from '@/entities/event';
import { EVENT_STATUS, type EventStatus } from '@/shared/config/status';
import { daysUntil } from '@/shared/lib/format';
import { queryKeys } from '@/shared/config/query-keys';

/** A stage in the event-pipeline funnel strip, keyed by backend status. */
export interface PipelineStage {
  id: EventStatus;
  color: string;
  count: number;
}

/** An upcoming-event card on the dashboard, derived from a summary. */
export interface UpcomingEvent {
  eventId: string;
  title: string;
  eventStartDate: string;
  eventEndDate: string;
  coverPhotoUrl?: string | null;
  eventStatus: EventStatus;
  /** RSVP / capacity progress. */
  going: number;
  cap: number;
  /** Days until the event (0 = today). Drives the countdown chip. */
  countdownDays: number;
}

/** A task surfaced on the dashboard. `type` drives the icon, color and copy. */
export type DashTaskType = 'review' | 'publish' | 'branding' | 'invite';
export interface DashTask {
  id: string;
  type: DashTaskType;
  eventId: string;
  eventName: string;
  count?: number;
}

export interface TopGallery {
  id: string;
  name: string;
  views: number;
  pct: number;
}

export interface GalleryAnalytics {
  views: number;
  downloads: number;
  top: TopGallery[];
}

export interface DashboardData {
  kpis: Kpi[];
  pipeline: PipelineStage[];
  upcoming: UpcomingEvent[];
  tasks: DashTask[];
  gallery: GalleryAnalytics;
}

const STATUSES: EventStatus[] = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

function buildDashboard(events: EventSummary[]): DashboardData {
  const by = (s: EventStatus) => events.filter((e) => e.eventStatus === s);
  const active = by('UPCOMING').length + by('ONGOING').length;
  const attendees = events.reduce((sum, e) => sum + (e.currentAttendeeCount ?? 0), 0);

  const kpis: Kpi[] = [
    { id: 'activeEvents', label: 'activeEvents', value: active.toLocaleString() },
    { id: 'upcoming', label: 'upcoming', value: by('UPCOMING').length.toLocaleString() },
    { id: 'completed', label: 'completed', value: by('COMPLETED').length.toLocaleString() },
    { id: 'attendees', label: 'attendees', value: attendees.toLocaleString() },
    { id: 'cancelled', label: 'cancelled', value: by('CANCELLED').length.toLocaleString() },
  ];

  const pipeline: PipelineStage[] = STATUSES.map((s) => ({
    id: s,
    color: EVENT_STATUS[s].color,
    count: by(s).length,
  }));

  const upcoming: UpcomingEvent[] = events
    .filter((e) => e.eventStatus === 'UPCOMING' || e.eventStatus === 'ONGOING')
    .sort((a, b) => a.eventStartDate.localeCompare(b.eventStartDate))
    .slice(0, 3)
    .map((e) => ({
      eventId: e.eventId,
      title: e.title,
      eventStartDate: e.eventStartDate,
      eventEndDate: e.eventEndDate,
      coverPhotoUrl: e.coverPhotoUrl,
      eventStatus: e.eventStatus,
      going: e.currentAttendeeCount,
      cap: e.maxAttendees ?? 0,
      countdownDays: Math.max(0, daysUntil(e.eventStartDate)),
    }));

  return {
    kpis,
    pipeline,
    upcoming,
    tasks: [],
    gallery: { views: 0, downloads: 0, top: [] },
  };
}

/** Dashboard model derived from the live event list (counts by status, KPIs). */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: async () => buildDashboard((await eventApi.list({ size: 100 })).content),
  });
}
