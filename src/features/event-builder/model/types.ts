/** Optional capabilities a client can switch on/off per event (drives the wizard). */
export type ModuleKey =
  | 'agenda'
  | 'registrations'
  | 'mediaGallery'
  | 'qrCheckIn'
  | 'delivery'
  | 'networking'
  | 'livestream';

export type LocationType = 'in-person' | 'virtual' | 'hybrid';
export type Visibility = 'public' | 'private' | 'invite';
export type GalleryLayout = 'grid' | 'masonry' | 'film';

export type CustomFieldType = 'text' | 'email' | 'number' | 'select' | 'checkbox';

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  /** For `select` fields. */
  options: string[];
}

export interface AgendaDraftItem {
  id: string;
  time: string;
  title: string;
  speaker: string;
  room: string;
  track: 'Keynote' | 'Talk' | 'Workshop' | 'Social';
}

export interface EventDraft {
  // Basics
  name: string;
  description: string;
  category: string;
  tags: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  locationType: LocationType;
  venue: string;
  address: string;
  /** Precise coordinates from the map picker / AI draft (optional). */
  latitude?: number;
  longitude?: number;
  virtualUrl: string;

  // Branding
  coverSeed: string;
  /** Selected cover image (uploaded as the event poster after create). */
  coverFile?: File | null;
  /** Object URL for previewing the selected cover before upload. */
  coverPreview?: string | null;
  accent: string;
  layout: GalleryLayout;
  welcomeMessage: string;
  watermark: boolean;

  // Modules (dynamic toggles)
  modules: Record<ModuleKey, boolean>;

  // Access & capacity
  visibility: Visibility;
  capacity: number;
  requireApproval: boolean;

  // Dynamic collections
  customFields: CustomField[];
  agenda: AgendaDraftItem[];
}

export const MODULE_META: Record<ModuleKey, { label: string; description: string; icon: string }> = {
  agenda: { label: 'Agenda & Sessions', description: 'Schedule talks, speakers and tracks', icon: 'calendar' },
  registrations: { label: 'Registrations', description: 'Collect attendee sign-ups', icon: 'users' },
  mediaGallery: { label: 'Media Gallery', description: 'Upload & curate image, video and audio', icon: 'image' },
  qrCheckIn: { label: 'QR Check-in', description: 'Scan attendees in at the door', icon: 'qr' },
  delivery: { label: 'Gallery Delivery', description: 'Share the finished gallery', icon: 'send' },
  networking: { label: 'Networking', description: 'Attendee matchmaking & messaging', icon: 'network' },
  livestream: { label: 'Livestream', description: 'Broadcast sessions online', icon: 'video' },
};

export const CATEGORIES = ['Conference', 'Summit', 'Workshop', 'Launch', 'Meetup', 'Party', 'Webinar', 'Other'];

export const TIMEZONES = [
  'Asia/Tashkent',
  'Europe/Berlin',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const ACCENT_PRESETS = ['#6D5EF6', '#3DD68C', '#4AA8FF', '#E0A33E', '#F0556E', '#9d7bff'];
