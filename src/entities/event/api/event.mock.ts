import type { Attendee, EventDetail, EventSummary } from '../model/types';

export const EVENTS: EventSummary[] = [
  {
    id: 'evt_summit',
    name: 'JetBrains Summit 2026',
    date: 'Jun 18–20, 2026',
    location: 'Munich, DE',
    status: 'shooting',
    coverSeed: 'summit',
    assetCount: 1842,
    host: 'JetBrains',
  },
  {
    id: 'evt_kotlinconf',
    name: 'KotlinConf Berlin',
    date: 'May 22, 2026',
    location: 'Berlin, DE',
    status: 'in-review',
    coverSeed: 'kotlin',
    assetCount: 968,
    host: 'JetBrains',
  },
  {
    id: 'evt_devday',
    name: 'Developer Day APAC',
    date: 'Jul 04, 2026',
    location: 'Singapore, SG',
    status: 'scheduled',
    coverSeed: 'devday',
    assetCount: 0,
    host: 'JetBrains',
  },
  {
    id: 'evt_launch',
    name: 'Fleet Launch Party',
    date: 'Apr 30, 2026',
    location: 'Amsterdam, NL',
    status: 'delivered',
    coverSeed: 'launch',
    assetCount: 2310,
    host: 'JetBrains',
  },
  {
    id: 'evt_hack',
    name: 'Internal Hack Week',
    date: 'Mar 10–14, 2026',
    location: 'Prague, CZ',
    status: 'archived',
    coverSeed: 'hack',
    assetCount: 540,
    host: 'JetBrains',
  },
  {
    id: 'evt_meetup',
    name: 'IntelliJ Community Meetup',
    date: 'Aug 12, 2026',
    location: 'London, UK',
    status: 'draft',
    coverSeed: 'meetup',
    assetCount: 0,
    host: 'JetBrains',
  },
];

const TRACK_COLORS = {
  keynote: 'var(--color-accent)',
  workshop: 'var(--color-processing)',
  talk: 'var(--color-approved)',
  social: 'var(--color-pending)',
};

const ATTENDEES: Attendee[] = [
  { id: 'a1', name: 'Helena Ford', email: 'helena@acme.io', company: 'Acme Corp', ticket: 'VIP', checkedIn: true },
  { id: 'a2', name: 'Raj Patel', email: 'raj@northwind.dev', company: 'Northwind', ticket: 'Speaker', checkedIn: true },
  { id: 'a3', name: 'Mei Lin', email: 'mei@orbit.co', company: 'Orbit', ticket: 'Standard', checkedIn: false },
  { id: 'a4', name: 'Tom Becker', email: 'tom@flux.systems', company: 'Flux Systems', ticket: 'Standard', checkedIn: true },
  { id: 'a5', name: 'Sofia Rossi', email: 'sofia@lumen.app', company: 'Lumen', ticket: 'VIP', checkedIn: false },
  { id: 'a6', name: 'David Cohen', email: 'david@vertex.io', company: 'Vertex', ticket: 'Staff', checkedIn: true },
  { id: 'a7', name: 'Yuki Tanaka', email: 'yuki@nimbus.jp', company: 'Nimbus', ticket: 'Standard', checkedIn: true },
  { id: 'a8', name: 'Clara Dubois', email: 'clara@atelier.fr', company: 'Atelier', ticket: 'Speaker', checkedIn: false },
];

/** Build a full detail record on demand from a summary. */
export function buildDetail(summary: EventSummary): EventDetail {
  return {
    ...summary,
    kpis: [
      { label: 'Total media', value: summary.assetCount.toLocaleString() },
      { label: 'Images', value: Math.round(summary.assetCount * 0.8).toLocaleString() },
      { label: 'Videos', value: Math.round(summary.assetCount * 0.14).toLocaleString() },
      { label: 'Audio', value: Math.round(summary.assetCount * 0.06).toLocaleString() },
      { label: 'Registered', value: '1,204' },
    ],
    agenda: [
      { id: 's1', time: '09:00', title: 'Opening keynote: The road ahead', speaker: 'Max Sadovsky', room: 'Hall A', track: 'Keynote', color: TRACK_COLORS.keynote },
      { id: 's2', time: '10:30', title: 'Deep dive: Kotlin 2.2 compiler', speaker: 'Lena Vogt', room: 'Room 3', track: 'Talk', color: TRACK_COLORS.talk },
      { id: 's3', time: '12:00', title: 'Lunch & networking', room: 'Atrium', track: 'Social', color: TRACK_COLORS.social },
      { id: 's4', time: '13:30', title: 'Hands-on: Building with Fleet', speaker: 'Marco Bellini', room: 'Lab 1', track: 'Workshop', color: TRACK_COLORS.workshop },
      { id: 's5', time: '15:00', title: 'Scaling teams with YouTrack', speaker: 'Priya Raman', room: 'Room 3', track: 'Talk', color: TRACK_COLORS.talk },
      { id: 's6', time: '16:30', title: 'Panel: Future of dev tools', speaker: 'Various', room: 'Hall A', track: 'Keynote', color: TRACK_COLORS.keynote },
      { id: 's7', time: '19:00', title: 'Evening reception', room: 'Rooftop', track: 'Social', color: TRACK_COLORS.social },
    ],
    attendees: ATTENDEES,
    registration: { total: 1204, capacity: 1500, checkedIn: 842, noShow: 61 },
  };
}
