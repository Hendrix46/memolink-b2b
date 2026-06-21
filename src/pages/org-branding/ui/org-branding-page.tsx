import { useTranslation } from 'react-i18next';
import { ImagePlus, Plus } from 'lucide-react';

import { coverGradient } from '@/shared/lib/visual';
import { Button, Card, Field, PageContainer, PageHeader, SectionHeader, toast } from '@/shared/ui';

const PALETTE = ['#6D5EF6', '#3DD68C', '#4AA8FF', '#E0A33E', '#F0556E', '#9d7bff', '#F5F5F7', '#0B0B0F'];
const THEMES = ['default', 'midnight', 'sunset', 'forest', 'ocean'];

/** Org default brand kit + reusable gallery themes new events inherit (§5.11). */
export function OrgBrandingPage() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <PageHeader
        title={t('orgBranding.title')}
        description={t('orgBranding.subtitle')}
        actions={
          <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={() => toast.info(t('orgBranding.newThemeToast'))}>
            {t('orgBranding.newTheme')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.4fr]">
        <Card className="space-y-5">
          <SectionHeader title={t('orgBranding.brandKit')} />
          <Field label={t('orgBranding.orgLogo')}>
            <button className="flex items-center gap-3 rounded-[10px] border border-dashed border-border-strong px-4 py-3 text-left text-[13px] text-text-secondary hover:border-accent">
              <ImagePlus size={18} className="text-accent-soft" />
              {t('orgBranding.uploadLogo')}
            </button>
          </Field>
          <Field label={t('orgBranding.brandPalette')}>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <span key={c} className="size-8 rounded-lg border border-border" style={{ background: c }} title={c} />
              ))}
            </div>
          </Field>
          <Field label={t('orgBranding.displayFont')}>
            <div className="rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px]">Geist</div>
          </Field>
        </Card>

        <Card>
          <SectionHeader title={t('orgBranding.galleryThemes')} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {THEMES.map((theme, i) => (
              <button key={theme} className="group overflow-hidden rounded-[12px] border border-border text-left transition hover:border-accent">
                <span className="block h-20" style={{ background: coverGradient(theme) }} />
                <span className="flex items-center justify-between px-3 py-2.5 text-[12.5px] font-medium capitalize">
                  {theme}
                  {i === 0 && <span className="rounded bg-[rgba(109,94,246,0.16)] px-1.5 py-0.5 text-[10px] font-semibold text-accent-soft">{t('orgBranding.default')}</span>}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
