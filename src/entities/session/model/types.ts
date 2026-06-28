/** Org-level role. Gates organizer surfaces (design spec §5.12). */
export type OrgRole = 'admin' | 'coordinator' | 'photographer';

/**
 * Active perspective. One shell, two lenses (spec §2): a multi-role user switches
 * lens and the shell re-gates navigation accordingly. Organizers run events and
 * curate media; photographers upload from the field and track their shoots.
 */
export type Lens = 'organizer' | 'photographer';

export interface Workspace {
  id: string;
  name: string;
  /** Two-letter mark shown in the workspace switcher avatar tile. */
  mark: string;
  /** Short descriptor under the name (e.g. "Event organizer", "12 events"). */
  kind: string;
  /** CSS gradient for the workspace avatar tile. */
  gradient: string;
}

export interface Viewer {
  id: string;
  name: string;
  email: string;
  /** Phone number is the primary login identifier (Memolink auth). */
  phoneNumber: string;
  orgRole: OrgRole;
  /**
   * Active workspace (organization). `null` when the account has no organization
   * yet — the shell then shows the create-organization onboarding. Mirrors the
   * entry selected in the workspace switcher.
   */
  workspace: Workspace | null;
}

/**
 * Token bundle returned by the Memolink auth service (`/api/auth/login`,
 * `/api/auth/refresh`). The access + refresh tokens are persisted so a page
 * reload keeps the user signed in and refresh continues to work.
 */
export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  refreshToken: string;
  tokenType: string;
  sessionState: string;
  scope: string;
}
