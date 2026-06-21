import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Viewer } from './types';

/** Seed viewer — an org admin (Dana, from the spec personas). */
const VIEWER: Viewer = {
  id: 'u_dana',
  name: 'Dana Whitfield',
  email: 'dana@jetbrains.com',
  orgRole: 'admin',
  workspace: { id: 'ws_jb', name: 'JetBrains', mark: 'JB' },
};

interface SessionState {
  /** Whether a session is established. Gates every protected route. */
  isAuthenticated: boolean;
  viewer: Viewer;
  /** Establish a session for the given viewer (called by the auth feature). */
  signIn: (viewer: Viewer) => void;
  signOut: () => void;
}

/**
 * Client session state — auth only. `isAuthenticated` gates the protected shell
 * and is persisted to localStorage so a refresh keeps the user signed in.
 *
 * This is an organizer-facing B2B product: the photographer's own workspace lives
 * elsewhere (mobile/PWA). The organizer still manages photographers as a resource
 * (directory, assignment, monitoring) — that lives in the photographer entity.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      viewer: VIEWER,
      signIn: (viewer) => set({ isAuthenticated: true, viewer }),
      signOut: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'memolink.session',
      partialize: (s) => ({ isAuthenticated: s.isAuthenticated, viewer: s.viewer }),
    },
  ),
);

/** Selector hooks — keep components subscribed to the narrowest slice. */
export const useViewer = () => useSessionStore((s) => s.viewer);
export const useIsAuthenticated = () => useSessionStore((s) => s.isAuthenticated);
