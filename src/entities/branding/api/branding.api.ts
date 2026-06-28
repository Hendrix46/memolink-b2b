import { http } from '@/shared/api';

/** Watermark rendering mode (changelog §6). */
export type WatermarkType = 'NONE' | 'TEXT' | 'IMAGE';

/** Where the watermark is anchored on the image (changelog §6). */
export type WatermarkPosition =
  | 'CENTER'
  | 'TOP_LEFT'
  | 'TOP_RIGHT'
  | 'BOTTOM_LEFT'
  | 'BOTTOM_RIGHT';

/** Shared `UpdateBrandingRequestContract` fields (changelog §6). All optional. */
export interface BrandingAttributes {
  primaryColor?: string | null;
  accentColor?: string | null;
  fontFamily?: string | null;
  logoFileId?: string | null;
  watermarkType?: WatermarkType | null;
  watermarkText?: string | null;
  watermarkImageFileId?: string | null;
  watermarkOpacity?: number | null;
  watermarkPosition?: WatermarkPosition | null;
}

/** `BrandingResponseContract` — attributes plus a resolved `logoUrl`. */
export interface BrandingResponse extends BrandingAttributes {
  logoUrl?: string | null;
}

/** `BrandingTemplateResponseContract`. */
export interface BrandingTemplate {
  id: number;
  name: string;
  attributes: BrandingResponse;
}

/** Apply-template target (org default vs. a single event override). */
export type ApplyTemplateTarget = 'ORG' | 'EVENT';

const orgBase = (orgId: string) => `/api/org/${orgId}/branding`;
const eventBase = (eventId: string) => `/api/event/${eventId}/branding`;

export const brandingApi = {
  // --- Org default branding ---
  getOrg(orgId: string): Promise<BrandingResponse> {
    return http.get<BrandingResponse>(orgBase(orgId));
  },
  updateOrg(orgId: string, body: BrandingAttributes): Promise<BrandingResponse> {
    return http.put<BrandingResponse>(orgBase(orgId), body);
  },
  uploadOrgLogo(orgId: string, file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<unknown>(`${orgBase(orgId)}/logo`, undefined, { formData });
  },
  uploadOrgWatermarkImage(orgId: string, file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<unknown>(`${orgBase(orgId)}/watermark-image`, undefined, { formData });
  },

  // --- Templates ---
  listTemplates(orgId: string): Promise<BrandingTemplate[]> {
    return http.get<BrandingTemplate[]>(`${orgBase(orgId)}/templates`);
  },
  createTemplate(orgId: string, name: string, attributes: BrandingAttributes): Promise<BrandingTemplate> {
    return http.post<BrandingTemplate>(`${orgBase(orgId)}/templates`, { name, attributes });
  },
  applyTemplate(
    orgId: string,
    templateId: number,
    target: ApplyTemplateTarget,
    eventId?: string,
  ): Promise<void> {
    return http.post<void>(`${orgBase(orgId)}/templates/${templateId}/apply`, { target, eventId });
  },

  // --- Event branding (resolved override) ---
  getEvent(eventId: string): Promise<BrandingResponse> {
    return http.get<BrandingResponse>(eventBase(eventId));
  },
  updateEvent(eventId: string, body: BrandingAttributes): Promise<BrandingResponse> {
    return http.put<BrandingResponse>(eventBase(eventId), body);
  },
};
