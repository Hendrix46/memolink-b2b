/** Org-level role. Gates organizer surfaces (design spec §5.12). */
export type OrgRole = 'admin' | 'coordinator' | 'photographer';

export interface Viewer {
  id: string;
  name: string;
  email: string;
  orgRole: OrgRole;
  workspace: {
    id: string;
    name: string;
    /** Two-letter mark shown in the workspace switcher. */
    mark: string;
  };
}
