import { http } from '@/shared/api';

/** Per-photographer contribution row on an event (changelog §9). */
export interface PhotographerContribution {
  userId: string;
  uploads: number;
  delivered: number;
  featured: number;
}

/** Attendance rollup for an event (RSVP breakdown + checked-in count). */
export interface AttendanceBreakdown {
  rsvpBreakdown: Record<string, number>;
  checkedIn: number;
}

/** `EventAnalyticsResponseContract`. */
export interface EventAnalytics {
  eventId: string;
  views: number;
  downloads: number;
  uniqueVisitors: number;
  photographers: PhotographerContribution[];
  attendance: AttendanceBreakdown;
}

/** Per-event view breakdown row in the org rollup. */
export interface OrgEventViewBreakdown {
  eventId: string;
  views: number;
}

/** `OrgAnalyticsResponseContract`. */
export interface OrgAnalytics {
  orgId: string;
  totalViews: number;
  totalDownloads: number;
  totalUniqueVisitors: number;
  totalEvents: number;
  perEvent: OrgEventViewBreakdown[];
}

/** `LeaderboardEntryContract`. */
export interface LeaderboardEntry {
  rank: number;
  entityId: string;
  entityLabel: string;
  metricValue: number;
}

export type LeaderboardEntity = 'PHOTOGRAPHERS' | 'EVENTS';
export type LeaderboardMetric =
  | 'VIEWS'
  | 'UNIQUE_VISITORS'
  | 'DOWNLOADS'
  | 'ATTENDANCE'
  | 'DELIVERED'
  | 'FEATURED'
  | 'UPLOADS';

export interface LeaderboardParams {
  entity: LeaderboardEntity;
  metric: LeaderboardMetric;
  limit?: number;
}

export const analyticsApi = {
  event(eventId: string): Promise<EventAnalytics> {
    return http.get<EventAnalytics>(`/api/event/${eventId}/analytics`);
  },
  org(orgId: string): Promise<OrgAnalytics> {
    return http.get<OrgAnalytics>(`/api/org/${orgId}/analytics`);
  },
  leaderboard(orgId: string, params: LeaderboardParams): Promise<LeaderboardEntry[]> {
    return http.get<LeaderboardEntry[]>(`/api/org/${orgId}/analytics/leaderboard`, {
      query: { entity: params.entity, metric: params.metric, limit: params.limit },
    });
  },
};
