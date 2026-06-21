import type { EventStatus } from '@/shared/config/status';

export interface EventSummary {
  id: string;
  name: string;
  date: string;
  location: string;
  status: EventStatus;
  /** Seed for the deterministic cover gradient. */
  coverSeed: string;
  assetCount: number;
  host: string;
}

export interface EventKpi {
  label: string;
  value: string;
}

export interface AgendaSession {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  room: string;
  track: string;
  /** Track accent color. */
  color: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  company: string;
  ticket: 'VIP' | 'Speaker' | 'Standard' | 'Staff';
  checkedIn: boolean;
}

export interface EventDetail extends EventSummary {
  kpis: EventKpi[];
  agenda: AgendaSession[];
  attendees: Attendee[];
  registration: { total: number; capacity: number; checkedIn: number; noShow: number };
}
