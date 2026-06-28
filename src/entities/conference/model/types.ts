/** `SpeakerSummaryContract`. */
export interface SpeakerSummary {
  userId: string;
  headline?: string | null;
}

/** `TrackResponseContract`. */
export interface Track {
  trackId: string;
  name: string;
  color?: string | null;
  sortOrder: number;
}

/** `SessionResponseContract`. */
export interface Session {
  sessionId: string;
  trackId?: string | null;
  roomId?: string | null;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  sortOrder: number;
  speakers: SpeakerSummary[];
}

/** `AgendaResponseContract` — full resolved agenda. */
export interface Agenda {
  tracks: Track[];
  sessions: Session[];
}

/** `TrackRequestContract`. */
export interface TrackInput {
  name: string;
  color?: string;
  sortOrder?: number;
}

/** `SessionRequestContract`. */
export interface SessionInput {
  title: string;
  description?: string;
  trackId?: string;
  roomId?: string;
  startTime: string;
  endTime: string;
  sortOrder?: number;
}
