import { http } from '@/shared/api';
import type { Agenda, Session, SessionInput, Track, TrackInput } from '../model/types';

const agendaBase = (eventId: string) => `/api/event/${eventId}/agenda`;

export const conferenceApi = {
  /** Public resolved agenda (tracks + sessions). */
  getAgenda(eventId: string): Promise<Agenda> {
    return http.get<Agenda>(agendaBase(eventId));
  },

  // --- Tracks ---
  createTrack(eventId: string, body: TrackInput): Promise<Track> {
    return http.post<Track>(`${agendaBase(eventId)}/tracks`, body);
  },
  updateTrack(eventId: string, trackId: string, body: TrackInput): Promise<Track> {
    return http.put<Track>(`${agendaBase(eventId)}/tracks/${trackId}`, body);
  },
  deleteTrack(eventId: string, trackId: string): Promise<void> {
    return http.delete<void>(`${agendaBase(eventId)}/tracks/${trackId}`);
  },

  // --- Sessions ---
  createSession(eventId: string, body: SessionInput): Promise<Session> {
    return http.post<Session>(`${agendaBase(eventId)}/sessions`, body);
  },
  updateSession(eventId: string, sessionId: string, body: SessionInput): Promise<Session> {
    return http.put<Session>(`${agendaBase(eventId)}/sessions/${sessionId}`, body);
  },
  deleteSession(eventId: string, sessionId: string): Promise<void> {
    return http.delete<void>(`${agendaBase(eventId)}/sessions/${sessionId}`);
  },

  // --- Speaker assignment ---
  assignSpeaker(eventId: string, sessionId: string, userId: string): Promise<void> {
    return http.post<void>(`${agendaBase(eventId)}/sessions/${sessionId}/speakers/${userId}`);
  },
  unassignSpeaker(eventId: string, sessionId: string, userId: string): Promise<void> {
    return http.delete<void>(`${agendaBase(eventId)}/sessions/${sessionId}/speakers/${userId}`);
  },
};
