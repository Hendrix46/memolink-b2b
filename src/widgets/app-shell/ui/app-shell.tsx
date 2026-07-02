import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useHasActiveOrg } from '@/entities/session';
import { CommandPalette } from '@/features/command-palette';
import { Lightbox } from '@/features/media-curation';
import { OrgOnboarding } from '@/features/org-create';
import { useSyncWorkspaces } from '@/features/workspace-switch';
import { ErrorState } from '@/shared/ui';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';

/**
 * Application shell: top bar + role-gated sidebar + scrollable content.
 * Mounts the global overlays (command palette, lightbox) once at the root.
 *
 * The workspace list is synced from `GET /api/org/mine` on mount. The
 * create-organization onboarding is shown ONLY once that call has confirmed the
 * account has zero organizations — while it loads we hold a spinner (no flash),
 * and if it errors we show a retry rather than wrongly pushing the user to
 * create a duplicate org. An account with ≥1 org gets the shell.
 */
export function AppShell() {
  const { t } = useTranslation();
  const hasOrg = useHasActiveOrg();
  const orgsSync = useSyncWorkspaces();

  const confirmedNoOrg = !hasOrg && orgsSync.isSuccess && (orgsSync.data?.length ?? 0) === 0;
  const loadError = !hasOrg && orgsSync.isError;

  let body: ReactNode;
  if (hasOrg) {
    body = (
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-base">
          <Outlet />
        </main>
      </div>
    );
  } else if (loadError) {
    body = (
      <main className="flex min-w-0 flex-1 items-center justify-center bg-base px-6">
        <ErrorState
          title={t('appShell.orgsError')}
          description={t('appShell.orgsErrorDesc')}
          onRetry={() => orgsSync.refetch()}
        />
      </main>
    );
  } else if (confirmedNoOrg) {
    body = (
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-base">
        <OrgOnboarding />
      </main>
    );
  } else {
    // Loading the org list (or applying a non-empty result) — hold, don't flash onboarding.
    body = (
      <main className="flex min-w-0 flex-1 items-center justify-center bg-base">
        <Loader2 size={22} className="animate-spin text-text-muted" />
      </main>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-base">
      <Topbar />
      {body}
      <CommandPalette />
      <Lightbox />
    </div>
  );
}
