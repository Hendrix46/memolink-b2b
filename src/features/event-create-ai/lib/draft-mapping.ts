import type { AgendaDraftItem, EventDraft } from '@/features/event-builder';
import type { CreateEventPayload } from '@/entities/event';
import type { AccessLevel } from '@/shared/config/status';
import type {
  ApplyDraftSuggestions,
  DraftLocation,
  EventDraftResponse,
  SessionSuggestion,
} from '../api/ai-draft.api';

const HEX = /^#([0-9a-fA-F]{6})$/;
const AGENDA_LINE = /^\s*(\d{1,2}:\d{2})\s+(.*)$/;

let seq = 0;
const nextId = (p: string) => `${p}_ai_${(seq += 1)}`;

/** Hex #RRGGBB or undefined. */
export function normalizeAccent(value?: string | null): string | undefined {
  return value && HEX.test(value) ? value : undefined;
}

/** Trim, and drop the literal "null"/"undefined" the LLM sometimes emits. */
function cleanStr(value?: string | null): string {
  const s = (value ?? '').trim();
  return s === 'null' || s === 'undefined' ? '' : s;
}

/** "YYYY-MM-DDTHH:mm[:ss]" → ["YYYY-MM-DD", "HH:mm"]. */
function splitLocalDateTime(iso?: string | null): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const [date = '', rest = ''] = iso.split('T');
  return { date, time: rest.slice(0, 5) };
}

/** Pad an `HH:mm`; falls back to `09:00` when malformed. */
function normalizeTime(time: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return '09:00';
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

/** Guess a draft track from a session title. */
function guessTrack(title: string): AgendaDraftItem['track'] {
  const t = title.toLowerCase();
  if (t.includes('keynote')) return 'Keynote';
  if (t.includes('workshop')) return 'Workshop';
  if (t.includes('party') || t.includes('social') || t.includes('networking') || t.includes('break'))
    return 'Social';
  return 'Talk';
}

/** Parse the AI's `agenda: string[]` ("09:00 Registration") into draft sessions. */
function parseAgenda(lines: string[]): AgendaDraftItem[] {
  return lines.slice(0, 50).map((line) => {
    const m = AGENDA_LINE.exec(line);
    const time = m ? normalizeTime(m[1]) : '09:00';
    const title = (m ? m[2] : line).trim();
    return { id: nextId('ses'), time, title, speaker: '', room: '', track: guessTrack(title) };
  });
}

const accessToVisibility = (a: AccessLevel): EventDraft['visibility'] =>
  a === 'PUBLIC' ? 'public' : 'private';

/** Map an `EventDraftResponse` into a draft-store patch the compose UI edits. */
export function draftResponseToStore(res: EventDraftResponse): Partial<EventDraft> {
  const start = splitLocalDateTime(res.eventStartDate);
  const end = splitLocalDateTime(res.eventEndDate);
  return {
    name: cleanStr(res.title),
    description: cleanStr(res.description),
    category: res.suggestedEventType || 'Conference',
    startDate: start.date,
    endDate: end.date || start.date,
    startTime: start.time || '09:00',
    endTime: end.time || '18:00',
    venue: cleanStr(res.location?.name),
    address: cleanStr(res.location?.address),
    // Precise coordinates from the AI draft, reused on create.
    latitude: res.location?.latitude,
    longitude: res.location?.longitude,
    capacity: res.maxAttendees ?? 0,
    visibility: accessToVisibility(res.accessLevel),
    accent: normalizeAccent(res.suggestedAccent) ?? '#6670FF',
    agenda: parseAgenda(res.agenda ?? []),
  };
}

/** "YYYY-MM-DD" + "HH:mm" → "YYYY-MM-DDTHH:mm:00". */
function localDateTime(date: string, time: string): string {
  return `${date}T${normalizeTime(time)}:00`;
}

/** Add whole hours to a naive `LocalDateTime` string, preserving wall-clock. */
function shiftHours(iso: string, hours: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setHours(d.getHours() + hours);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

const todayISO = (): string => {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/**
 * Build the `POST /api/event` payload from the (edited) draft. `aiLocation`
 * supplies precise lat/long the manual fields can't capture.
 */
export function buildCreatePayload(
  draft: EventDraft,
  orgId: string | undefined,
  aiLocation?: DraftLocation,
): CreateEventPayload {
  const startDate = draft.startDate || todayISO();
  const endDate = draft.endDate || startDate;
  // lat/long are optional in the contract; send the picked coordinates (map or
  // AI draft) — a manual event with no geocoding omits them rather than send 0,0.
  const lat = draft.latitude ?? aiLocation?.latitude;
  const lng = draft.longitude ?? aiLocation?.longitude;
  const venue = cleanStr(draft.venue);
  const address = cleanStr(draft.address);
  const location: CreateEventPayload['location'] = {
    name: venue || cleanStr(aiLocation?.name) || draft.name.trim(),
    address: address || cleanStr(aiLocation?.address) || venue,
  };
  if (lat != null && lng != null) {
    location.latitude = lat;
    location.longitude = lng;
  }
  return {
    title: draft.name.trim(),
    description: draft.description.trim() || undefined,
    location,
    accessLevel: draft.visibility === 'public' ? 'PUBLIC' : 'PRIVATE',
    eventStartDate: localDateTime(startDate, draft.startTime || '09:00'),
    eventEndDate: localDateTime(endDate, draft.endTime || '18:00'),
    maxAttendees: draft.capacity > 0 ? draft.capacity : undefined,
    allowJoinRequests: draft.requireApproval || undefined,
    orgId: orgId || undefined,
  };
}

/**
 * Convert the draft's agenda + accent into the structured apply body. Returns
 * `null` when there is nothing to apply (no sessions and no valid accent).
 */
export function buildApplyBody(draft: EventDraft): ApplyDraftSuggestions | null {
  const accentColor = normalizeAccent(draft.accent);
  const startDate = draft.startDate || todayISO();

  const sessions: SessionSuggestion[] = draft.agenda
    .filter((s) => s.title.trim().length > 0)
    .map((s) => {
      const startTime = localDateTime(startDate, s.time);
      return {
        title: s.title.trim(),
        startTime,
        endTime: shiftHours(startTime, 1),
        trackName: s.track,
        speakerNames: s.speaker.trim() ? [s.speaker.trim()] : undefined,
      };
    });

  const trackNames = Array.from(new Set(sessions.map((s) => s.trackName).filter(Boolean) as string[]));

  const body: ApplyDraftSuggestions = {};
  if (sessions.length > 0) {
    body.agenda = { tracks: trackNames.map((name) => ({ name })), sessions };
  }
  if (accentColor) body.accentColor = accentColor;

  return body.agenda || body.accentColor ? body : null;
}
