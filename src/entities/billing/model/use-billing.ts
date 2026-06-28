import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { billingApi, type OrgBilling, type SubscriptionTier } from '../api/billing.api';

export function useBilling(orgId: string | undefined) {
  return useQuery<OrgBilling>({
    queryKey: queryKeys.org.billing(orgId ?? ''),
    queryFn: () => billingApi.get(orgId as string),
    enabled: Boolean(orgId),
  });
}

export function useChangeTier(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tier: SubscriptionTier) => billingApi.changeTier(orgId, tier),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.billing(orgId) }),
  });
}
