import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { authToken } from '@/shared/api';
import type { AuthTokens, Lens, Viewer, Workspace } from './types';

/**
 * Workspaces (organizations) the viewer belongs to.
 *
 * The backend exposes no "list my organizations" endpoint (see BACKEND-ISSUES E1),
 * so the dashboard cannot enumerate orgs at login. Instead, an org becomes known
 * when the user creates one (`POST /api/org`, which auto-admits them as ADMIN) —
 * we persist that entry and use its `orgId` for all org-scoped calls. Until then
 * the list is empty and the shell shows the create-organization onboarding.
 */
const EMPTY_WORKSPACES: Workspace[] = [];

/** Placeholder viewer used before a session is established. Identity fields are
 *  overwritten from `/api/user/me` on sign-in; the workspace machinery persists. */
const VIEWER: Viewer = {
  id: '',
  name: '',
  email: '',
  phoneNumber: '',
  orgRole: 'admin',
  workspace: null,
};

interface SessionState {
  /** Whether a session is established. Gates every protected route. */
  isAuthenticated: boolean;
  viewer: Viewer;
  /** Persisted bearer + refresh tokens (mirrors `authToken`). */
  accessToken: string | null;
  refreshToken: string | null;
  /** Active perspective; re-gates the sidebar navigation (spec §2). */
  lens: Lens;
  /** Workspaces the viewer can switch between. */
  workspaces: Workspace[];
  /** Establish a session from auth tokens + the resolved viewer identity. */
  setSession: (payload: { tokens: AuthTokens; viewer: Viewer }) => void;
  /** Tear the session down (sign out / unauthorized). */
  clearSession: () => void;
  setLens: (lens: Lens) => void;
  setWorkspace: (id: string) => void;
  /** Upsert a workspace (e.g. a newly created org) and make it the active one. */
  setWorkspaceEntry: (workspace: Workspace) => void;
}

/**
 * Client session state. The viewer, active lens and the auth tokens are
 * persisted to localStorage so a refresh keeps the user signed in. On rehydrate
 * the access token is re-pushed into `authToken` so the HTTP client (and its
 * 401-refresh path) keeps working without a fresh login. The workspace list is
 * persisted too — it holds real organizations the user has created (the backend
 * has no my-orgs endpoint to re-derive them from).
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      viewer: VIEWER,
      accessToken: null,
      refreshToken: null,
      lens: 'organizer',
      workspaces: EMPTY_WORKSPACES,
      setSession: ({ tokens, viewer }) => {
        authToken.set(tokens.accessToken);
        set({
          isAuthenticated: true,
          viewer,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      },
      clearSession: () => {
        authToken.set(null);
        set({
          isAuthenticated: false,
          viewer: VIEWER,
          accessToken: null,
          refreshToken: null,
          workspaces: EMPTY_WORKSPACES,
        });
      },
      setLens: (lens) => set({ lens }),
      setWorkspace: (id) =>
        set((s) => {
          const ws = s.workspaces.find((w) => w.id === id);
          return ws ? { viewer: { ...s.viewer, workspace: ws } } : {};
        }),
      setWorkspaceEntry: (workspace) =>
        set((s) => {
          const others = s.workspaces.filter((w) => w.id !== workspace.id);
          return {
            workspaces: [...others, workspace],
            viewer: { ...s.viewer, workspace },
          };
        }),
    }),
    {
      name: 'memolink.session',
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        viewer: s.viewer,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        lens: s.lens,
        workspaces: s.workspaces,
      }),
      // Re-push the persisted token into the HTTP layer and re-derive auth.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        authToken.set(state.accessToken);
        state.isAuthenticated = Boolean(state.accessToken && state.viewer.id);
      },
    },
  ),
);

/** Selector hooks — keep components subscribed to the narrowest slice. */
export const useViewer = () => useSessionStore((s) => s.viewer);
export const useIsAuthenticated = () => useSessionStore((s) => s.isAuthenticated);
export const useLens = () => useSessionStore((s) => s.lens);
export const useWorkspaces = () => useSessionStore((s) => s.workspaces);
/** Active workspace (organization), or `null` when none exists yet. */
export const useActiveWorkspace = () => useSessionStore((s) => s.viewer.workspace);
/** Active organization id for org-scoped API calls; `undefined` when no org. */
export const useActiveOrgId = () => useSessionStore((s) => s.viewer.workspace?.id);
/** Whether the account has an organization (gates the create-org onboarding). */
export const useHasActiveOrg = () => useSessionStore((s) => Boolean(s.viewer.workspace));
