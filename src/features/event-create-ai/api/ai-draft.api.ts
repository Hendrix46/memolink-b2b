import { http } from '@/shared/api';
import type { AccessLevel } from '@/shared/config/status';

/** `LocationDetailsRequestContract`. */
export interface DraftLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

/** `EventDraftResponseContract` (changelog §4). Create-mappable fields + draft hints. */
export interface EventDraftResponse {
  title: string;
  description?: string | null;
  location: DraftLocation;
  accessLevel: AccessLevel;
  eventStartDate: string;
  eventEndDate: string;
  maxAttendees?: number | null;
  suggestedEventType?: string | null;
  agenda: string[];
  ticketTypes: string[];
  suggestedAccent?: string | null;
}

/** A structured agenda session for apply (changelog §4 step b). */
export interface SessionSuggestion {
  title: string;
  startTime: string;
  endTime: string;
  trackName?: string;
  speakerNames?: string[];
}

export interface TrackSuggestion {
  name: string;
}

export interface AgendaSuggestion {
  tracks: TrackSuggestion[];
  sessions: SessionSuggestion[];
}

/** `ApplyDraftSuggestionsRequestContract`. */
export interface ApplyDraftSuggestions {
  agenda?: AgendaSuggestion;
  accentColor?: string;
}

export const aiDraftApi = {
  /** Generate a non-persisted draft. Rate-limited 10/hour (429); feature-flagged (503). */
  generate(prompt: string, locale?: string): Promise<EventDraftResponse> {
    return http.post<EventDraftResponse>('/api/event/ai/draft', { prompt, locale });
  },
  /** Apply a structured agenda + accent into the live agenda/branding (atomic). */
  apply(eventId: string, body: ApplyDraftSuggestions): Promise<void> {
    return http.post<void>(`/api/event/${eventId}/ai/draft/apply`, body);
  },
};
