import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import { coverBackground } from '@/shared/lib/visual';
import { cn } from '@/shared/lib/cn';
import { Button, Card, Field, Input, toast } from '@/shared/ui';

const ACCENTS = ['#6D5EF6', '#3DD68C', '#4AA8FF', '#E0A33E', '#F0556E', '#9d7bff'];
const LAYOUTS = ['grid', 'masonry', 'film'] as const;

/** Split: controls left, live gallery preview right (design spec §5.7). */
export function BrandingTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  const [accent, setAccent] = useState('#6D5EF6');
  const [layout, setLayout] = useState<(typeof LAYOUTS)[number]>('masonry');
  const [watermark, setWatermark] = useState(true);
  const [welcome, setWelcome] = useState(t('eventDetail.branding.welcomeTo', { name: event.name }));

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[360px_1fr]">
      <Card className="space-y-5">
        <Field label={t('eventDetail.branding.galleryLogo')}>
          <button className="flex items-center gap-3 rounded-[10px] border border-dashed border-border-strong px-4 py-3 text-left text-[13px] text-text-secondary hover:border-accent">
            <ImagePlus size={18} className="text-accent-soft" />
            {t('eventDetail.branding.uploadLogo')}
          </button>
        </Field>

        <Field label={t('eventDetail.branding.accentColor')}>
          <div className="flex gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                aria-label={c}
                className={cn('size-8 rounded-lg transition', accent === c && 'ring-2 ring-white/70 ring-offset-2 ring-offset-surface')}
                style={{ background: c }}
              />
            ))}
          </div>
        </Field>

        <Field label={t('eventDetail.branding.galleryLayout')}>
          <div className="grid grid-cols-3 gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                className={cn(
                  'rounded-[10px] border py-2.5 text-[12.5px] font-medium transition-colors',
                  layout === l ? 'border-accent bg-[rgba(109,94,246,0.14)] text-text' : 'border-border text-text-secondary hover:border-border-strong',
                )}
              >
                {t(`builder.brandingStep.${l}`)}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t('eventDetail.branding.welcomeMessage')}>
          <Input value={welcome} onChange={(e) => setWelcome(e.target.value)} />
        </Field>

        <label className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-text-secondary">{t('eventDetail.branding.watermarkDownloads')}</span>
          <button
            onClick={() => setWatermark((v) => !v)}
            className={cn('relative h-6 w-11 rounded-full transition-colors', watermark ? 'bg-accent' : 'bg-border')}
            aria-pressed={watermark}
          >
            <span className={cn('absolute top-0.5 size-5 rounded-full bg-white transition-all', watermark ? 'left-[22px]' : 'left-0.5')} />
          </button>
        </label>

        <Button variant="primary" fullWidth onClick={() => toast.success(t('eventDetail.branding.saved'))}>
          {t('eventDetail.branding.saveBranding')}
        </Button>
      </Card>

      {/* Live preview */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-[13px] font-semibold">{t('eventDetail.branding.livePreview')}</span>
          <span className="font-mono text-[11px] text-text-muted">{t(`builder.brandingStep.${layout}`)} · {accent}</span>
        </div>
        <div className="p-5" style={{ background: 'var(--color-base)' }}>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="size-7 rounded-lg" style={{ background: accent }} />
            <span className="text-sm font-semibold">{welcome}</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-[10px]"
                style={{ background: coverBackground(`${event.id}-brand-${i}`) }}
              >
                {watermark && (
                  <span className="absolute bottom-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wider text-white/70">
                    {event.host}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
