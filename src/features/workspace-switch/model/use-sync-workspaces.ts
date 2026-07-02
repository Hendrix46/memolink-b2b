import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orgApi, type MyOrg, type OrgMemberRole } from '@/entities/org';
import { useIsAuthenticated, useSessionStore, type OrgRole, type Workspace } from '@/entities/session';
import { queryKeys } from '@/shared/config/query-keys';
import { avatarGradient } from '@/shared/lib/visual';

/** Two-letter avatar mark from the org name (initials, else first chars). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const mark = parts.slice(0, 2).map((w) => w[0]).join('');
  return (mark || name.trim().slice(0, 2) || 'OR').toUpperCase();
}

/** Map the backend org-member role onto the viewer's `orgRole` (no `staff` lens). */
function toOrgRole(role: OrgMemberRole): OrgRole {
  switch (role) {
    case 'ADMIN':
      return 'admin';
    case 'PHOTOGRAPHER':
      return 'photographer';
    default:
      return 'coordinator';
  }
}

function toWorkspace(org: MyOrg, kind: string): Workspace {
  return { id: org.orgId, name: org.name, mark: initials(org.name), kind, gradient: avatarGradient(org.orgId) };
}

/**
 * Keep the workspace list in sync with `GET /api/org/mine`. Runs whenever the
 * shell mounts (sign-in lands here; reload re-mounts it), so existing-org users
 * land in their real workspace instead of the create-org onboarding. Persisted
 * workspaces cover the moment before the refetch resolves. Returns the query so
 * the shell can hold the onboarding until the first load settles.
 */
export function useSyncWorkspaces() {
  const { t } = useTranslation();
  const isAuthed = useIsAuthenticated();
  const setWorkspaces = useSessionStore((s) => s.setWorkspaces);

  const query = useQuery({
    queryKey: queryKeys.org.mine,
    queryFn: () => orgApi.mine(),
    enabled: isAuthed,
    staleTime: 5 * 60_000,
  });

  const orgs = query.data;
  useEffect(() => {
    if (!orgs) return;
    const workspaces = orgs.map((o) => toWorkspace(o, t(`workspaces.kind.${o.role}`)));
    const roleById = Object.fromEntries(orgs.map((o) => [o.orgId, toOrgRole(o.role)] as const));
    setWorkspaces(workspaces, roleById);
  }, [orgs, setWorkspaces, t]);

  return query;
}
