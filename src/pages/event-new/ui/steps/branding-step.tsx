import { useTranslation } from 'react-i18next';

import { AccentPicker, CoverPicker, useEventDraftStore, type GalleryLayout } from '@/features/event-builder';
import { cn } from '@/shared/lib/cn';
import { Field, Switch, Textarea } from '@/shared/ui';

const LAYOUTS: GalleryLayout[] = ['grid', 'masonry', 'film'];

export function BrandingStep() {
  const { t } = useTranslation();
  const d = useEventDraftStore((s) => s.draft);
  const patch = useEventDraftStore((s) => s.patch);

  return (
    <div className="space-y-5">
      <Field label={t('builder.brandingStep.coverImage')}>
        <CoverPicker />
      </Field>

      <Field label={t('builder.brandingStep.accentColor')} hint={t('builder.brandingStep.accentHint')}>
        <AccentPicker />
      </Field>

      <Field label={t('builder.brandingStep.galleryLayout')}>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => patch({ layout: l })}
              className={cn(
                'rounded-[10px] border py-2.5 text-[12.5px] font-medium transition-colors',
                d.layout === l
                  ? 'border-accent bg-[rgba(109,94,246,0.14)] text-text'
                  : 'border-border text-text-secondary hover:border-border-strong',
              )}
            >
              {t(`builder.brandingStep.${l}`)}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t('builder.brandingStep.welcomeMessage')}>
        <Textarea
          rows={2}
          placeholder={t('builder.brandingStep.welcomePh')}
          value={d.welcomeMessage}
          onChange={(e) => patch({ welcomeMessage: e.target.value })}
        />
      </Field>

      <label className="flex items-center justify-between rounded-[10px] border border-border bg-surface px-4 py-3">
        <span>
          <span className="block text-[13.5px] font-medium">{t('builder.brandingStep.watermark')}</span>
          <span className="block text-xs text-text-muted">{t('builder.brandingStep.watermarkDesc')}</span>
        </span>
        <Switch checked={d.watermark} onChange={(v) => patch({ watermark: v })} aria-label={t('builder.brandingStep.watermark')} />
      </label>
    </div>
  );
}
