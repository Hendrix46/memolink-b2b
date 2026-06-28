import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { orgApi } from '../api/org.api';
import type { InviteOrgMemberInput, OrgMemberRole } from './types';

// --- Members ---
export function useOrgMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.org.members(orgId ?? ''),
    queryFn: () => orgApi.listMembers(orgId as string),
    enabled: Boolean(orgId),
  });
}

export function useChangeMemberRole(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: OrgMemberRole }) =>
      orgApi.changeMemberRole(orgId, userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.members(orgId) }),
  });
}

export function useRemoveMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => orgApi.removeMember(orgId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.members(orgId) }),
  });
}

// --- Invites ---
export function useOrgInvites(orgId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.org.invites(orgId ?? ''),
    queryFn: () => orgApi.listInvites(orgId as string),
    enabled: Boolean(orgId),
  });
}

export function useInviteMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteOrgMemberInput) => orgApi.invite(orgId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.invites(orgId) }),
  });
}

export function useRevokeInvite(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => orgApi.revokeInvite(orgId, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.invites(orgId) }),
  });
}

// --- Photographers directory ---
export function useOrgPhotographers(orgId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.org.photographers(orgId ?? ''),
    queryFn: () => orgApi.listPhotographers(orgId as string),
    enabled: Boolean(orgId),
  });
}
