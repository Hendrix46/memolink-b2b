import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ImagePlus, Plus } from 'lucide-react';

import {
  useApplyBrandingTemplate,
  useCreateBrandingTemplate,
  useOrgBranding,
  useOrgBrandingTemplates,
  useUpdateOrgBranding,
  useUploadOrgLogo,
  type BrandingAttributes,
  type WatermarkPosition,
  type WatermarkType,
} from '@/entities/branding';
import { useActiveOrgId } from '@/entities/session';
import { ApiError } from '@/shared/api';
import { cn } from '@/shared/lib/cn';
import {
  Button,
  Card,
  ErrorState,
  Field,
  Input,
  PageContainer,
  PageHeader,
  SectionHeader,
  Select,
  Skeleton,
  toast,
} from '@/shared/ui';

const PALETTE = ['#6D5EF6', '#3DD68C', '#4AA8FF', '#E0A33E', '#F0556E', '#9d7bff', '#F5F5F7', '#0B0B0F'];
const WATERMARK_TYPES: WatermarkType[] = ['NONE', 'TEXT', 'IMAGE'];
const WATERMARK_POSITIONS: WatermarkPosition[] = [
  'CENTER',
  'TOP_LEFT',
  'TOP_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_RIGHT',
];

const HEX = /^#([0-9a-fA-F]{6})$/;

function emptyForm(): BrandingAttributes {
  return {
    primaryColor: '#6D5EF6',
    accentColor: '#9d7bff',
    fontFamily: '',
    watermarkType: 'NONE',
    watermarkText: '',
    watermarkOpacity: 50,
    watermarkPosition: 'BOTTOM_RIGHT',
  };
}

/** Org default brand kit + reusable templates new events inherit (changelog §6). */
export function OrgBrandingPage() {
  const { t } = useTranslation();
  const orgId = useActiveOrgId() ?? '';

  const branding = useOrgBranding(orgId);
  const templates = useOrgBrandingTemplates(orgId);
  const update = useUpdateOrgBranding(orgId);
  const uploadLogo = useUploadOrgLogo(orgId);
  const createTemplate = useCreateBrandingTemplate(orgId);
  const applyTemplate = useApplyBrandingTemplate(orgId);

  const [form, setForm] = useState<BrandingAttributes>(emptyForm());
  const [templateName, setTemplateName] = useState('');
  const logoInput = useRef<HTMLInputElement>(null);

  // Hydrate the form once branding loads.
  useEffect(() => {
    if (branding.data) setForm({ ...emptyForm(), ...branding.data });
  }, [branding.data]);

  const patch = (p: Partial<BrandingAttributes>) => setForm((f) => ({ ...f, ...p }));

  const save = () => {
    update.mutate(form, {
      onSuccess: () => toast.success(t('orgBranding.saved')),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t('orgBranding.saveFailed')),
    });
  };

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadLogo.mutate(file, {
      onSuccess: () => toast.success(t('orgBranding.logoUploaded')),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t('orgBranding.saveFailed')),
    });
  };

  const create = () => {
    const name = templateName.trim();
    if (!name) return;
    createTemplate.mutate(
      { name, attributes: form },
      {
        onSuccess: () => {
          setTemplateName('');
          toast.success(t('orgBranding.templateCreated'));
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t('orgBranding.saveFailed')),
      },
    );
  };

  const apply = (templateId: number) => {
    applyTemplate.mutate(
      { templateId, target: 'ORG' },
      {
        onSuccess: () => toast.success(t('orgBranding.templateApplied')),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t('orgBranding.saveFailed')),
      },
    );
  };

  if (branding.isError) {
    return (
      <PageContainer>
        <PageHeader title={t('orgBranding.title')} description={t('orgBranding.subtitle')} />
        <ErrorState title={t('orgBranding.loadError')} onRetry={() => branding.refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={t('orgBranding.title')} description={t('orgBranding.subtitle')} />

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.4fr]">
        <Card className="space-y-5">
          <SectionHeader title={t('orgBranding.brandKit')} />

          {branding.isLoading ? (
            <Skeleton height={220} radius={12} />
          ) : (
            <>
              <Field label={t('orgBranding.orgLogo')}>
                <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
                <button
                  onClick={() => logoInput.current?.click()}
                  disabled={uploadLogo.isPending}
                  className="flex items-center gap-3 rounded-[10px] border border-dashed border-border-strong px-4 py-3 text-left text-[13px] text-text-secondary hover:border-accent disabled:opacity-60"
                >
                  {branding.data?.logoUrl ? (
                    <img src={branding.data.logoUrl} alt="" className="size-9 rounded object-cover" />
                  ) : (
                    <ImagePlus size={18} className="text-accent-soft" />
                  )}
                  {uploadLogo.isPending ? t('common.loading') : t('orgBranding.uploadLogo')}
                </button>
              </Field>

              <ColorField
                label={t('orgBranding.primaryColor')}
                value={form.primaryColor ?? ''}
                onChange={(v) => patch({ primaryColor: v })}
              />
              <ColorField
                label={t('orgBranding.accentColorLabel')}
                value={form.accentColor ?? ''}
                onChange={(v) => patch({ accentColor: v })}
              />

              <Field label={t('orgBranding.displayFont')}>
                <Input
                  value={form.fontFamily ?? ''}
                  onChange={(e) => patch({ fontFamily: e.target.value })}
                  placeholder="Geist, Inter, …"
                />
              </Field>

              <Field label={t('orgBranding.watermarkType')}>
                <Select
                  value={form.watermarkType ?? 'NONE'}
                  onChange={(e) => patch({ watermarkType: e.target.value as WatermarkType })}
                  options={WATERMARK_TYPES.map((w) => ({ value: w, label: t(`orgBranding.watermark.${w}`) }))}
                />
              </Field>

              {form.watermarkType === 'TEXT' && (
                <Field label={t('orgBranding.watermarkText')}>
                  <Input
                    value={form.watermarkText ?? ''}
                    onChange={(e) => patch({ watermarkText: e.target.value })}
                    maxLength={120}
                  />
                </Field>
              )}

              {form.watermarkType !== 'NONE' && (
                <>
                  <Field label={t('orgBranding.watermarkOpacity')}>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={String(form.watermarkOpacity ?? 50)}
                      onChange={(e) =>
                        patch({ watermarkOpacity: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
                      }
                    />
                  </Field>
                  <Field label={t('orgBranding.watermarkPosition')}>
                    <Select
                      value={form.watermarkPosition ?? 'BOTTOM_RIGHT'}
                      onChange={(e) => patch({ watermarkPosition: e.target.value as WatermarkPosition })}
                      options={WATERMARK_POSITIONS.map((p) => ({
                        value: p,
                        label: t(`orgBranding.position.${p}`),
                      }))}
                    />
                  </Field>
                </>
              )}

              <Button variant="primary" fullWidth onClick={save} disabled={update.isPending}>
                {update.isPending ? t('common.loading') : t('orgBranding.save')}
              </Button>
            </>
          )}
        </Card>

        <Card className="space-y-4">
          <SectionHeader title={t('orgBranding.templates')} />

          <div className="flex gap-2">
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={t('orgBranding.templateNamePh')}
              maxLength={120}
            />
            <Button
              variant="secondary"
              leadingIcon={<Plus size={15} />}
              onClick={create}
              disabled={!templateName.trim() || createTemplate.isPending}
            >
              {t('orgBranding.createTemplate')}
            </Button>
          </div>

          {templates.isLoading ? (
            <Skeleton height={120} radius={12} />
          ) : templates.data && templates.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {templates.data.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => apply(tpl.id)}
                  disabled={applyTemplate.isPending}
                  className="group overflow-hidden rounded-[12px] border border-border text-left transition hover:border-accent disabled:opacity-60"
                >
                  <span
                    className="block h-20"
                    style={{
                      background: `linear-gradient(140deg, ${tpl.attributes.primaryColor || '#6D5EF6'}, ${tpl.attributes.accentColor || '#9d7bff'})`,
                    }}
                  />
                  <span className="flex items-center justify-between px-3 py-2.5 text-[12.5px] font-medium">
                    <span className="truncate">{tpl.name}</span>
                    <Check size={13} className="text-accent-soft opacity-0 transition group-hover:opacity-100" />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-[13px] text-text-muted">{t('orgBranding.noTemplates')}</p>
          )}
        </Card>
      </div>
    </PageContainer>
  );

  function ColorField({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) {
    return (
      <Field label={label} error={value && !HEX.test(value) ? t('orgBranding.invalidHex') : undefined}>
        <div className="flex flex-wrap items-center gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-label={c}
              className={cn(
                'size-8 rounded-lg border border-border transition',
                value.toLowerCase() === c.toLowerCase() && 'ring-2 ring-white/70 ring-offset-2 ring-offset-surface',
              )}
              style={{ background: c }}
            />
          ))}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#RRGGBB"
            className="h-8 w-[96px] rounded-lg border border-border bg-surface px-2 font-mono text-[12px] text-text outline-none focus:border-accent"
          />
        </div>
      </Field>
    );
  }
}
