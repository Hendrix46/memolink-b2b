import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { conferenceApi } from '../api/conference.api';
import type { SessionInput, TrackInput } from './types';

export function useAgenda(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events.agenda(eventId ?? ''),
    queryFn: () => conferenceApi.getAgenda(eventId as string),
    enabled: Boolean(eventId),
  });
}

export function useCreateTrack(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TrackInput) => conferenceApi.createTrack(eventId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.agenda(eventId) }),
  });
}

export function useDeleteTrack(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trackId: string) => conferenceApi.deleteTrack(eventId, trackId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.agenda(eventId) }),
  });
}

export function useCreateSession(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SessionInput) => conferenceApi.createSession(eventId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.agenda(eventId) }),
  });
}

export function useUpdateSession(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, body }: { sessionId: string; body: SessionInput }) =>
      conferenceApi.updateSession(eventId, sessionId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.agenda(eventId) }),
  });
}

export function useDeleteSession(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => conferenceApi.deleteSession(eventId, sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.agenda(eventId) }),
  });
}
