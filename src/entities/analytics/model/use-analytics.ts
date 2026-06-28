import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import {
  analyticsApi,
  type EventAnalytics,
  type LeaderboardEntry,
  type LeaderboardParams,
  type OrgAnalytics,
} from '../api/analytics.api';

export function useEventAnalytics(eventId: string | undefined) {
  return useQuery<EventAnalytics>({
    queryKey: queryKeys.events.analytics(eventId ?? ''),
    queryFn: () => analyticsApi.event(eventId as string),
    enabled: Boolean(eventId),
  });
}

export function useOrgAnalytics(orgId: string | undefined) {
  return useQuery<OrgAnalytics>({
    queryKey: queryKeys.org.analytics(orgId ?? ''),
    queryFn: () => analyticsApi.org(orgId as string),
    enabled: Boolean(orgId),
  });
}

export function useLeaderboard(orgId: string | undefined, params: LeaderboardParams) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: queryKeys.org.leaderboard(orgId ?? '', params),
    queryFn: () => analyticsApi.leaderboard(orgId as string, params),
    enabled: Boolean(orgId),
  });
}
