import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orgApi, type Org } from '@/entities/org';
import { useSessionStore, type Workspace } from '@/entities/session';
import { avatarGradient } from '@/shared/lib/visual';

/** Two-letter avatar mark from the org name (initials, else first chars). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const mark = parts.slice(0, 2).map((w) => w[0]).join('');
  return (mark || name.trim().slice(0, 2) || 'OR').toUpperCase();
}

/** Build a switcher Workspace from a created org (`kind` is a localized label). */
export function workspaceFromOrg(org: Org, kind: string): Workspace {
  return {
    id: org.orgId,
    name: org.name,
    mark: initials(org.name),
    kind,
    gradient: avatarGradient(org.orgId),
  };
}

/**
 * Create an organization. `POST /api/org` auto-admits the caller as ADMIN and
 * returns the real `orgId`, which we store as the active workspace so every
 * org-scoped call stops 403-ing. All queries are invalidated to refetch with it.
 */
export function useCreateOrg() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const setWorkspaceEntry = useSessionStore((s) => s.setWorkspaceEntry);
  return useMutation({
    mutationFn: (name: string) => orgApi.create({ name: name.trim() }),
    onSuccess: (org) => {
      setWorkspaceEntry(workspaceFromOrg(org, t('orgCreate.adminKind')));
      qc.invalidateQueries();
    },
  });
}
