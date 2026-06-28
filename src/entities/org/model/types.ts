import type {
  PhotographerAvailability,
  PhotographerProfile,
} from '@/entities/photographer';

/** Backend org member role (`OrgRole`). */
export type OrgMemberRole = 'ADMIN' | 'COORDINATOR' | 'PHOTOGRAPHER' | 'STAFF';

/** `OrgMemberResponseContract`. */
export interface OrgMember {
  userId: string;
  role: OrgMemberRole;
  dateCreated: string;
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

/** `OrgPhotographerSummaryResponseContract`. */
export interface OrgPhotographer {
  userId: string;
  profile?: PhotographerProfile | null;
  availability: PhotographerAvailability[];
}

/** `OrgResponseContract`. */
export interface Org {
  orgId: string;
  name: string;
  ownerUserId: string;
  dateCreated: string;
}

/** `CreateOrgRequestContract`. */
export interface CreateOrgInput {
  name: string;
}
