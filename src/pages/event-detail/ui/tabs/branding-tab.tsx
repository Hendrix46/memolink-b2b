import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { EventDetail } from '@/entities/event';
import {
  useEventBranding,
  useUpdateEventBranding,
  type BrandingAttributes,
  type WatermarkPosition,
  type WatermarkType,
} from '@/entities/branding';
import { ApiError } from '@/shared/api';
import { coverBackground } from '@/shared/lib/visual';
import { cn } from '@/shared/lib/cn';
import { Button, Card, ErrorState, Field, Input, Select, Skeleton, toast } from '@/shared/ui';

const PALETTE = ['#6D5EF6', '#3DD68C', '#4AA8FF', '#E0A33E', '#F0556E', '#9d7bff'];
const HEX = /^#([0-9a-fA-F]{6})$/;
const WATERMARK_TYPES: WatermarkType[] = ['NONE', 'TEXT', 'IMAGE'];
const WATERMARK_POSITIONS: WatermarkPosition[] = [
  'CENTER',
  'TOP_LEFT',
  'TOP_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_RIGHT',
];

function emptyForm(): BrandingAttributes {
  return { primaryColor: '#6D5EF6', accentColor: '#9d7bff', watermarkType: 'NONE', watermarkOpacity: 50, watermarkPosition: 'BOTTOM_RIGHT' };
}

/** Per-event branding override (resolved over org default). Changelog §6. */
export function BrandingTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  const branding = useEventBranding(event.eventId);
  const update = useUpdateEventBranding(event.eventId);
  const [form, setForm] = useState<BrandingAttributes>(emptyForm());

  useEffect(() => {
    if (branding.data) setForm({ ...emptyForm(), ...branding.data });
  }, [branding.data]);

  const patch = (p: Partial<BrandingAttributes>) => setForm((f) => ({ ...f, ...p }));
  const accent = form.accentColor || '#6D5EF6';
  const showWatermark = (form.watermarkType ?? 'NONE') !== 'NONE';

  const save = () => {
    update.mutate(form, {
      onSuccess: () => toast.success(t('eventDetail.branding.saved')),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t('orgBranding.saveFailed')),
    });
  };

  if (branding.isError) {
    return <ErrorState title={t('eventDetail.branding.loadError')} onRetry={() => branding.refetch()} />;
  }

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[360px_1fr]">
      <Card className="space-y-5">
        {branding.isLoading ? (
          <Skeleton height={320} radius={12} />
        ) : (
          <>
            <ColorField
              label={t('eventDetail.branding.primaryColor')}
              value={form.primaryColor ?? ''}
              onChange={(v) => patch({ primaryColor: v })}
            />
            <ColorField
              label={t('eventDetail.branding.accentColor')}
              value={form.accentColor ?? ''}
              onChange={(v) => patch({ accentColor: v })}
            />

            <Field label={t('eventDetail.branding.fontFamily')}>
              <Input value={form.fontFamily ?? ''} onChange={(e) => patch({ fontFamily: e.target.value })} placeholder="Geist, Inter, …" />
            </Field>

            <Field label={t('eventDetail.branding.watermarkType')}>
              <Select
                value={form.watermarkType ?? 'NONE'}
                onChange={(e) => patch({ watermarkType: e.target.value as WatermarkType })}
                options={WATERMARK_TYPES.map((w) => ({ value: w, label: t(`orgBranding.watermark.${w}`) }))}
              />
            </Field>

            {form.watermarkType === 'TEXT' && (
              <Field label={t('orgBranding.watermarkText')}>
                <Input value={form.watermarkText ?? ''} onChange={(e) => patch({ watermarkText: e.target.value })} maxLength={120} />
              </Field>
            )}

            {showWatermark && (
              <>
                <Field label={t('orgBranding.watermarkOpacity')}>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={String(form.watermarkOpacity ?? 50)}
                    onChange={(e) => patch({ watermarkOpacity: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                  />
                </Field>
                <Field label={t('orgBranding.watermarkPosition')}>
                  <Select
                    value={form.watermarkPosition ?? 'BOTTOM_RIGHT'}
                    onChange={(e) => patch({ watermarkPosition: e.target.value as WatermarkPosition })}
                    options={WATERMARK_POSITIONS.map((p) => ({ value: p, label: t(`orgBranding.position.${p}`) }))}
                  />
                </Field>
              </>
            )}

            <Button variant="primary" fullWidth onClick={save} disabled={update.isPending}>
              {update.isPending ? t('common.loading') : t('eventDetail.branding.saveBranding')}
            </Button>
          </>
        )}
      </Card>

      {/* Live preview */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-[13px] font-semibold">{t('eventDetail.branding.livePreview')}</span>
          <span className="font-mono text-[11px] text-text-muted">{accent}</span>
        </div>
        <div className="p-5" style={{ background: 'var(--color-base)' }}>
          <div className="mb-4 flex items-center gap-2.5">
            {branding.data?.logoUrl ? (
              <img src={branding.data.logoUrl} alt="" className="size-7 rounded-lg object-cover" />
            ) : (
              <span className="size-7 rounded-lg" style={{ background: accent }} />
            )}
            <span className="text-sm font-semibold">{event.title}</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-[10px]"
                style={{ background: coverBackground(`${event.eventId}-brand-${i}`) }}
              >
                {showWatermark && (
                  <span
                    className="absolute bottom-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wider text-white"
                    style={{ opacity: (form.watermarkOpacity ?? 50) / 100 }}
                  >
                    {form.watermarkText || event.hostName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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
