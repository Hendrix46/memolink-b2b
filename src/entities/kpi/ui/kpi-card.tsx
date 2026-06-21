import { TrendingDown, TrendingUp } from 'lucide-react';

import { AnimatedNumber, Card, Skeleton, Sparkline } from '@/shared/ui';
import type { Kpi } from '../model/types';

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.deltaDirection !== 'down';
  const deltaColor = up ? 'var(--color-approved)' : 'var(--color-rejected)';

  return (
    <Card compact>
      <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">
        {kpi.label}
      </div>
      <div className="mt-2.5 flex items-end gap-2">
        <div className="font-mono text-[25px] font-semibold leading-none tracking-[-0.02em]">
          <AnimatedNumber value={kpi.value} />
        </div>
        {kpi.delta && (
          <div
            className="mb-0.5 flex items-center gap-0.5 text-[11.5px] font-semibold"
            style={{ color: deltaColor }}
          >
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {kpi.delta}
          </div>
        )}
      </div>
      {kpi.spark && <Sparkline data={kpi.spark} className="mt-3" color={deltaColor} />}
    </Card>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card compact>
      <Skeleton width={90} height={12} />
      <Skeleton width={70} height={26} className="mt-3" />
      <Skeleton height={26} className="mt-3" />
    </Card>
  );
}
