import { http } from '@/shared/api';

/** Subscription tiers (changelog §10). */
export type SubscriptionTier = 'DEFAULT' | 'FREE' | 'PRO' | 'ENTERPRISE';

/** A `null` limit field means *unlimited* for that dimension (changelog §10). */
export interface BillingLimits {
  storageBytes: number | null;
  maxEvents: number | null;
  maxPhotographers: number | null;
  maxGalleries: number | null;
}

export interface BillingUsage {
  storageBytesUsed: number;
  eventsCount: number;
  photographersCount: number;
  galleriesCount: number;
}

/** A `null` remaining field means *unlimited* for that dimension. */
export interface BillingRemaining {
  storageBytes: number | null;
  events: number | null;
  photographers: number | null;
  galleries: number | null;
}

/** `OrgBillingResponseContract`. */
export interface OrgBilling {
  tier: SubscriptionTier;
  limits: BillingLimits;
  usage: BillingUsage;
  remaining: BillingRemaining;
}

const base = (orgId: string) => `/api/org/${orgId}/billing`;

export const billingApi = {
  get(orgId: string): Promise<OrgBilling> {
    return http.get<OrgBilling>(base(orgId));
  },
  changeTier(orgId: string, tier: SubscriptionTier): Promise<OrgBilling> {
    return http.post<OrgBilling>(`${base(orgId)}/subscription`, { tier });
  },
};
