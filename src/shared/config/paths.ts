/** Centralized route paths. Single source of truth for links + navigation. */
export const paths = {
  // Auth (public)
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',

  // Organizer
  dashboard: '/',
  events: '/events',
  eventNew: '/events/new',
  event: (id = ':eventId') => `/events/${id}`,
  photographers: '/photographers',
  branding: '/branding',
  delivery: '/delivery',
  analytics: '/analytics',
  team: '/team',
  billing: '/billing',
  settings: '/settings',

  // Photographer lens (spec §4.2)
  assignments: '/assignments',
  upload: (id = ':eventId') => `/assignments/${id}/upload`,
  myUploads: '/my-uploads',
  profile: '/profile',
} as const;
