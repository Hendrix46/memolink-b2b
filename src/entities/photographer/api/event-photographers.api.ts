import { http } from '@/shared/api';

/** `PhotographerAssignmentResponseContract` (changelog §11). */
export interface PhotographerAssignment {
  eventId: string;
  photographerId: string;
  orgId?: string | null;
  shootQuota?: number | null;
  accessWindowStart?: string | null;
  accessWindowEnd?: string | null;
  status: 'ACTIVE' | 'REMOVED';
  assignedAt?: string | null;
  assignedByUserId?: string | null;
  dateCreated: string;
}

/** `AssignPhotographerRequestContract`. */
export interface AssignPhotographerInput {
  photographerId: string;
  shootQuota?: number;
  accessWindowStart?: string;
  accessWindowEnd?: string;
}

const base = (eventId: string) => `/api/event/${eventId}/photographers`;

export const eventPhotographersApi = {
  list(eventId: string, includeRemoved = false): Promise<PhotographerAssignment[]> {
    return http.get<PhotographerAssignment[]>(base(eventId), { query: { includeRemoved } });
  },
  assign(eventId: string, body: AssignPhotographerInput): Promise<PhotographerAssignment> {
    return http.post<PhotographerAssignment>(base(eventId), body);
  },
  unassign(eventId: string, userId: string): Promise<void> {
    return http.delete<void>(`${base(eventId)}/${userId}`);
  },
};
