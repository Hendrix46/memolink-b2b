import { Outlet } from 'react-router-dom';

import { CommandPalette } from '@/features/command-palette';
import { Lightbox } from '@/features/media-curation';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';

/**
 * Application shell: top bar + role-gated sidebar + scrollable content.
 * Mounts the global overlays (command palette, lightbox) once at the root.
 */
export function AppShell() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-base">
      <Topbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-base">
          <Outlet />
        </main>
      </div>

      <CommandPalette />
      <Lightbox />
    </div>
  );
}
