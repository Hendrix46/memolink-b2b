import { ApiError, resolve } from '@/shared/api/mock-client';
import type { EventStatus } from '@/shared/config/status';
import type { EventDetail, EventSummary } from '../model/types';
import { buildDetail, EVENTS } from './event.mock';

export interface EventListFilters {
  status?: EventStatus | 'all';
  search?: string;
}

export const eventApi = {
  list(filters: EventListFilters = {}): Promise<EventSummary[]> {
    return resolve(() => {
      let rows = EVENTS;
      if (filters.status && filters.status !== 'all') {
        rows = rows.filter((e) => e.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        rows = rows.filter(
          (e) => e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q),
        );
      }
      return rows;
    });
  },

  detail(eventId: string): Promise<EventDetail> {
    return resolve(() => {
      const summary = EVENTS.find((e) => e.id === eventId);
      if (!summary) throw new ApiError('Event not found', 404);
      return buildDetail(summary);
    });
  },
};
