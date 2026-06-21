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
    photographers: (eventId: string) => ['events', 'photographers', eventId] as const,
  },

  photographer: {
    assignments: ['photographer', 'assignments'] as const,
    uploads: (eventId?: string) => ['photographer', 'uploads', eventId ?? 'all'] as const,
  },

  org: {
    photographers: ['org', 'photographers'] as const,
    team: ['org', 'team'] as const,
    billing: ['org', 'billing'] as const,
  },
} as const;
