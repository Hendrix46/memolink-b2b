import type {
  PhotographerAvailability,
  PhotographerProfile,
} from '@/entities/photographer';

/** Backend org member role (`OrgRole`). */
export type OrgMemberRole = 'ADMIN' | 'COORDINATOR' | 'PHOTOGRAPHER' | 'STAFF';

/** `OrgMemberResponseContract` — newer backends enrich it with the identity (buglist E6). */
export interface OrgMember {
  userId: string;
  role: OrgMemberRole;
  dateCreated: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export type OrgInviteStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED';

/** `OrgInviteResponseContract`. */
export interface OrgInvite {
  token: string;
  inviteUrl?: string | null;
  targetEmail?: string | null;
  targetUserId?: string | null;
  role: OrgMemberRole;
  status: OrgInviteStatus;
  expiresAt?: string | null;
}

/** `InviteOrgMemberRequestContract`. */
export interface InviteOrgMemberInput {
  targetEmail?: string;
  targetUserId?: string;
  role: OrgMemberRole;
}

/** `OrgPhotographerSummaryResponseContract` — newer backends add the identity (buglist E6). */
export interface OrgPhotographer {
  userId: string;
  profile?: PhotographerProfile | null;
  availability: PhotographerAvailability[];
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

/** `OrgResponseContract`. */
export interface Org {
  orgId: string;
  name: string;
  ownerUserId: string;
  dateCreated: string;
}

/** `MyOrgResponseContract` — an org the caller belongs to (`GET /api/org/mine`). */
export interface MyOrg {
  orgId: string;
  name: string;
  role: OrgMemberRole;
  isAdmin: boolean;
  isPhotographer: boolean;
}

/** `CreateOrgRequestContract`. */
export interface CreateOrgInput {
  name: string;
}
