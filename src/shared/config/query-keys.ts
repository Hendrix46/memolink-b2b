/**
 * Centralized React Query key factory. Keeping every key in one typed object
 * prevents cache-key drift and makes invalidation explicit and greppable.
 */
export const queryKeys = {
  dashboard: (scope = 'org') => ['dashboard', scope] as const,

  events: {
    all: ['events'] as const,
    list: (filters?: object) => ['events', 'list', filters ?? {}] as const,
    detail: (eventId: string) => ['events', 'detail', eventId] as const,
    media: (eventId: string, filters?: object) =>
      ['events', 'media', eventId, filters ?? {}] as const,
    photographers: (eventId: string, includeRemoved = false) =>
      ['events', 'photographers', eventId, includeRemoved] as const,
    analytics: (eventId: string) => ['events', 'analytics', eventId] as const,
    branding: (eventId: string) => ['events', 'branding', eventId] as const,
    galleries: (eventId: string) => ['events', 'galleries', eventId] as const,
    agenda: (eventId: string) => ['events', 'agenda', eventId] as const,
    venues: (eventId: string) => ['events', 'venues', eventId] as const,
  },

  users: {
    search: (query: string) => ['users', 'search', query] as const,
    directorySeed: ['users', 'directory', 'seed'] as const,
  },

  /** Short-lived presigned media URLs (variant/poster) — see shared/api/media-url. */
  mediaUrl: {
    variant: (eventId: string, fileId: string, size: string) =>
      ['media-url', 'variant', eventId, fileId, size] as const,
    poster: (eventId: string) => ['media-url', 'poster', eventId] as const,
  },

  photographer: {
    assignments: ['photographer', 'assignments'] as const,
    uploads: (eventId?: string) => ['photographer', 'uploads', eventId ?? 'all'] as const,
    profile: ['photographer', 'profile'] as const,
    availability: ['photographer', 'availability'] as const,
  },

  notifications: {
    list: (unreadOnly = false) => ['notifications', 'list', unreadOnly] as const,
    stats: ['notifications', 'stats'] as const,
  },

  gallery: {
    detail: (galleryId: string) => ['gallery', 'detail', galleryId] as const,
    invites: (galleryId: string) => ['gallery', 'invites', galleryId] as const,
  },

  org: {
    mine: ['org', 'mine'] as const,
    photographers: (orgId: string) => ['org', 'photographers', orgId] as const,
    team: ['org', 'team'] as const,
    members: (orgId: string) => ['org', 'members', orgId] as const,
    invites: (orgId: string) => ['org', 'invites', orgId] as const,
    billing: (orgId: string) => ['org', 'billing', orgId] as const,
    branding: (orgId: string) => ['org', 'branding', orgId] as const,
    brandingTemplates: (orgId: string) => ['org', 'branding', 'templates', orgId] as const,
    analytics: (orgId: string) => ['org', 'analytics', orgId] as const,
    leaderboard: (orgId: string, params?: object) =>
      ['org', 'analytics', 'leaderboard', orgId, params ?? {}] as const,
  },
} as const;
