import { Outlet } from 'react-router-dom';

import { useHasActiveOrg } from '@/entities/session';
import { CommandPalette } from '@/features/command-palette';
import { Lightbox } from '@/features/media-curation';
import { OrgOnboarding } from '@/features/org-create';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';

/**
 * Application shell: top bar + role-gated sidebar + scrollable content.
 * Mounts the global overlays (command palette, lightbox) once at the root.
 *
 * Until the account has an organization, the sidebar + routed content are
 * replaced by the create-organization onboarding (the top bar — with sign-out —
 * stays available).
 */
export function AppShell() {
  const hasOrg = useHasActiveOrg();
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-base">
      <Topbar />
      {hasOrg ? (
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-base">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-base">
          <OrgOnboarding />
        </main>
      )}

      <CommandPalette />
      <Lightbox />
    </div>
  );
}
