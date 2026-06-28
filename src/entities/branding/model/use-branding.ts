import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import {
  brandingApi,
  type ApplyTemplateTarget,
  type BrandingAttributes,
  type BrandingResponse,
  type BrandingTemplate,
} from '../api/branding.api';

// --- Org default branding ---
export function useOrgBranding(orgId: string | undefined) {
  return useQuery<BrandingResponse>({
    queryKey: queryKeys.org.branding(orgId ?? ''),
    queryFn: () => brandingApi.getOrg(orgId as string),
    enabled: Boolean(orgId),
  });
}

export function useUpdateOrgBranding(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BrandingAttributes) => brandingApi.updateOrg(orgId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.branding(orgId) }),
  });
}

export function useUploadOrgLogo(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => brandingApi.uploadOrgLogo(orgId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.branding(orgId) }),
  });
}

// --- Templates ---
export function useOrgBrandingTemplates(orgId: string | undefined) {
  return useQuery<BrandingTemplate[]>({
    queryKey: queryKeys.org.brandingTemplates(orgId ?? ''),
    queryFn: () => brandingApi.listTemplates(orgId as string),
    enabled: Boolean(orgId),
  });
}

export function useCreateBrandingTemplate(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, attributes }: { name: string; attributes: BrandingAttributes }) =>
      brandingApi.createTemplate(orgId, name, attributes),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.org.brandingTemplates(orgId) }),
  });
}

export function useApplyBrandingTemplate(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      target,
      eventId,
    }: {
      templateId: number;
      target: ApplyTemplateTarget;
      eventId?: string;
    }) => brandingApi.applyTemplate(orgId, templateId, target, eventId),
    onSuccess: (_data, { target, eventId }) => {
      if (target === 'ORG') qc.invalidateQueries({ queryKey: queryKeys.org.branding(orgId) });
      if (target === 'EVENT' && eventId)
        qc.invalidateQueries({ queryKey: queryKeys.events.branding(eventId) });
    },
  });
}

// --- Event branding (resolved override) ---
export function useEventBranding(eventId: string | undefined) {
  return useQuery<BrandingResponse>({
    queryKey: queryKeys.events.branding(eventId ?? ''),
    queryFn: () => brandingApi.getEvent(eventId as string),
    enabled: Boolean(eventId),
  });
}

export function useUpdateEventBranding(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BrandingAttributes) => brandingApi.updateEvent(eventId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.branding(eventId) }),
  });
}
