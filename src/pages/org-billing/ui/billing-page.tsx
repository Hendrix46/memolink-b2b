import { useTranslation } from 'react-i18next';
import { Check, Download } from 'lucide-react';

import { Button, Card, PageContainer, PageHeader, ProgressBar, SectionHeader, toast } from '@/shared/ui';

const INVOICES = [
  { id: 'INV-2026-06', date: 'Jun 1, 2026', amount: '$499.00' },
  { id: 'INV-2026-05', date: 'May 1, 2026', amount: '$499.00' },
  { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: '$499.00' },
];

const FEATURE_KEYS = ['events', 'storage', 'photographers', 'branding', 'support'];

export function BillingPage() {
  const { t } = useTranslation();
  const usedTb = 0.41;
  const limitTb = 2;

  return (
    <PageContainer>
      <PageHeader title={t('billing.title')} description={t('billing.subtitle')} />

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.3fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-[rgba(109,94,246,0.16)] px-2.5 py-1 text-[12px] font-semibold text-accent-soft">
              {t('billing.business')}
            </span>
            <span className="font-mono text-text-secondary">{t('billing.perMonth')}</span>
          </div>
          <ul className="space-y-2">
            {FEATURE_KEYS.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[13.5px]">
                <Check size={15} className="text-approved" strokeWidth={2.5} />
                {t(`billing.features.${f}`)}
              </li>
            ))}
          </ul>
          <Button variant="primary" fullWidth onClick={() => toast.info(t('billing.upgradeToast'))}>
            {t('billing.upgrade')}
          </Button>
        </Card>

        <div className="space-y-[18px]">
          <Card>
            <SectionHeader title={t('billing.storageUsage')} action={<span className="font-mono text-[13px] text-text-secondary">{usedTb} / {limitTb} TB</span>} />
            <ProgressBar value={usedTb / limitTb} height={9} />
            <p className="mt-2 text-xs text-text-muted">{t('billing.storageNote', { percent: Math.round((usedTb / limitTb) * 100) })}</p>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-[13px] font-semibold">{t('billing.invoices')}</span>
            </div>
            {INVOICES.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 border-t border-hairline px-5 py-3.5">
                <div className="flex-1">
                  <div className="font-mono text-[13px]">{inv.id}</div>
                  <div className="text-xs text-text-muted">{inv.date}</div>
                </div>
                <span className="font-mono text-[13px]">{inv.amount}</span>
                <span className="rounded-md bg-[rgba(61,214,140,0.12)] px-2 py-0.5 text-[11.5px] font-semibold text-approved">
                  {t('billing.paid')}
                </span>
                <button aria-label="Download" className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text">
                  <Download size={15} />
                </button>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
