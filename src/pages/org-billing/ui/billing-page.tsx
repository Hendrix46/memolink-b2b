import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBilling, useChangeTier, type OrgBilling, type SubscriptionTier } from '@/entities/billing';
import { useActiveOrgId } from '@/entities/session';
import { ApiError } from '@/shared/api';
import { formatBytes, formatNumber } from '@/shared/lib/format';
import {
  Button,
  Card,
  ErrorState,
  PageContainer,
  PageHeader,
  ProgressBar,
  SectionHeader,
  Select,
  Skeleton,
  toast,
} from '@/shared/ui';

const TIERS: SubscriptionTier[] = ['DEFAULT', 'FREE', 'PRO', 'ENTERPRISE'];

interface Meter {
  key: string;
  label: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  format: (n: number) => string;
}

function buildMeters(b: OrgBilling, t: (k: string) => string): Meter[] {
  return [
    {
      key: 'storage',
      label: t('billing.meters.storage'),
      used: b.usage.storageBytesUsed,
      limit: b.limits.storageBytes,
      remaining: b.remaining.storageBytes,
      format: (n) => formatBytes(n),
    },
    {
      key: 'events',
      label: t('billing.meters.events'),
      used: b.usage.eventsCount,
      limit: b.limits.maxEvents,
      remaining: b.remaining.events,
      format: formatNumber,
    },
    {
      key: 'photographers',
      label: t('billing.meters.photographers'),
      used: b.usage.photographersCount,
      limit: b.limits.maxPhotographers,
      remaining: b.remaining.photographers,
      format: formatNumber,
    },
    {
      key: 'galleries',
      label: t('billing.meters.galleries'),
      used: b.usage.galleriesCount,
      limit: b.limits.maxGalleries,
      remaining: b.remaining.galleries,
      format: formatNumber,
    },
  ];
}

export function BillingPage() {
  const { t } = useTranslation();
  const orgId = useActiveOrgId() ?? '';
  const billing = useBilling(orgId);
  const changeTier = useChangeTier(orgId);
  const [tier, setTier] = useState<SubscriptionTier | ''>('');

  const data = billing.data;
  const selectedTier = (tier || data?.tier || 'DEFAULT') as SubscriptionTier;

  const applyTier = () => {
    if (!data || selectedTier === data.tier) return;
    changeTier.mutate(selectedTier, {
      onSuccess: () => {
        setTier('');
        toast.success(t('billing.tierChanged'));
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t('billing.changeFailed')),
    });
  };

  if (billing.isError) {
    return (
      <PageContainer>
        <PageHeader title={t('billing.title')} description={t('billing.subtitle')} />
        <ErrorState title={t('billing.loadError')} onRetry={() => billing.refetch()} />
      </PageContainer>
    );
  }

  const meters = data ? buildMeters(data, t) : [];

  return (
    <PageContainer>
      <PageHeader title={t('billing.title')} description={t('billing.subtitle')} />

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.3fr]">
        <Card className="space-y-4 border-[rgba(109,94,246,0.35)] bg-[linear-gradient(135deg,rgba(109,94,246,0.16),rgba(109,94,246,0.04))]">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-accent-soft">
              {t('billing.currentPlan')}
            </div>
            {billing.isLoading ? (
              <Skeleton height={28} width={120} className="mt-1.5" />
            ) : (
              <div className="mt-1.5 text-[22px] font-semibold">{t(`billing.tiers.${data?.tier ?? 'DEFAULT'}`)}</div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[12.5px] font-medium text-text-secondary">{t('billing.changeTier')}</span>
            <Select
              value={selectedTier}
              onChange={(e) => setTier(e.target.value as SubscriptionTier)}
              disabled={billing.isLoading}
              options={TIERS.map((tr) => ({ value: tr, label: t(`billing.tiers.${tr}`) }))}
            />
            <Button
              variant="primary"
              fullWidth
              onClick={applyTier}
              disabled={billing.isLoading || changeTier.isPending || !data || selectedTier === data.tier}
            >
              {changeTier.isPending ? t('common.loading') : t('billing.applyTier')}
            </Button>
          </div>
        </Card>

        <Card className="space-y-5">
          <SectionHeader title={t('billing.usage')} />
          {billing.isLoading ? (
            <Skeleton height={200} radius={12} />
          ) : (
            meters.map((m) => {
              const limit = m.limit;
              const unlimited = limit === null;
              const ratio = limit === null || limit === 0 ? 0 : m.used / limit;
              const over = limit !== null && ratio >= 1;
              return (
                <div key={m.key}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="font-medium">{m.label}</span>
                    <span className="font-mono text-text-secondary">
                      {m.format(m.used)} {limit === null ? '' : `/ ${m.format(limit)}`}
                      {unlimited && <span className="text-text-muted"> · {t('billing.unlimited')}</span>}
                    </span>
                  </div>
                  <ProgressBar
                    value={ratio}
                    height={9}
                    color={over ? 'var(--color-rejected)' : 'var(--color-accent)'}
                  />
                  {!unlimited && (
                    <p className="mt-1 text-[11.5px] text-text-muted">
                      {t('billing.remaining', { value: m.format(Math.max(0, m.remaining ?? 0)) })}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
