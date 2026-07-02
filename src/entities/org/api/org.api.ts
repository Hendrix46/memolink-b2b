import { http } from '@/shared/api';
import type {
  CreateOrgInput,
  InviteOrgMemberInput,
  MyOrg,
  Org,
  OrgInvite,
  OrgMember,
  OrgMemberRole,
  OrgPhotographer,
} from '../model/types';

const base = (orgId: string) => `/api/org/${orgId}`;

export const orgApi = {
  /** Create an organization; the backend auto-admits the caller as ADMIN. */
  create(body: CreateOrgInput): Promise<Org> {
    return http.post<Org>('/api/org', body);
  },

  /** Organizations the caller belongs to — drives the workspace list at sign-in. */
  mine(): Promise<MyOrg[]> {
    return http.get<MyOrg[]>('/api/org/mine');
  },

  get(orgId: string): Promise<Org> {
    return http.get<Org>(base(orgId));
  },

  // --- Members ---
  listMembers(orgId: string): Promise<OrgMember[]> {
    return http.get<OrgMember[]>(`${base(orgId)}/members`);
  },
  changeMemberRole(orgId: string, userId: string, role: OrgMemberRole): Promise<void> {
    return http.patch<void>(`${base(orgId)}/members/${userId}`, { role });
  },
  removeMember(orgId: string, userId: string): Promise<void> {
    return http.delete<void>(`${base(orgId)}/members/${userId}`);
  },

  // --- Invites ---
  listInvites(orgId: string): Promise<OrgInvite[]> {
    return http.get<OrgInvite[]>(`${base(orgId)}/invites`);
  },
  invite(orgId: string, body: InviteOrgMemberInput): Promise<OrgInvite> {
    return http.post<OrgInvite>(`${base(orgId)}/invites`, body);
  },
  revokeInvite(orgId: string, token: string): Promise<void> {
    return http.delete<void>(`${base(orgId)}/invites/${token}`);
  },
  acceptInvite(token: string): Promise<unknown> {
    return http.post<unknown>('/api/org/invites/accept', { token });
  },

  // --- Photographers directory (admin/coordinator) ---
  listPhotographers(orgId: string): Promise<OrgPhotographer[]> {
    return http.get<OrgPhotographer[]>(`${base(orgId)}/photographers`);
  },
};
