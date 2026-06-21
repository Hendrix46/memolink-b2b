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
  branding: '/branding',
  delivery: '/delivery',
  analytics: '/analytics',
  team: '/team',
  billing: '/billing',
  settings: '/settings',
} as const;
