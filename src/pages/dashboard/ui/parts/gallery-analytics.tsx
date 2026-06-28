import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Card, ProgressBar } from '@/shared/ui';
import { formatCompact } from '@/shared/lib/format';
import { paths } from '@/shared/config/paths';
import type { GalleryAnalytics as GalleryAnalyticsData } from '../../api/dashboard.api';

/** "Guests are reliving the moments" — gallery engagement + top galleries. */
export function GalleryAnalytics({ data }: { data: GalleryAnalyticsData }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col">
      <h2 className="text-[15px] font-semibold">{t('dashboard.gallery.title')}</h2>
      <p className="mb-4 mt-1 text-[12.5px] leading-relaxed text-text-muted">
        {t('dashboard.gallery.subtitle')}
      </p>

      <div className="mb-[18px] grid grid-cols-2 gap-3">
        <Stat label={t('dashboard.gallery.views')} value={formatCompact(data.views)} />
        <Stat label={t('dashboard.gallery.downloads')} value={formatCompact(data.downloads)} />
      </div>

      <div className="mb-4 flex flex-col gap-3">
        {data.top.map((g) => (
          <div key={g.id}>
            <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
              <span className="max-w-[150px] truncate">{g.name}</span>
              <span className="flex-none font-mono text-text-secondary">{formatCompact(g.views)}</span>
            </div>
            <ProgressBar value={g.pct} height={5} color="var(--color-accent-soft)" />
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(paths.delivery)}
        className="mt-auto flex h-[38px] items-center justify-center gap-1.5 rounded-[10px] border border-border bg-surface-raised text-[13px] font-semibold text-accent-soft transition-colors hover:border-accent"
      >
        {t('dashboard.gallery.open')}
      </button>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[11px] border border-hairline bg-sidebar px-3 py-3">
      <div className="mb-1 text-[10.5px] uppercase tracking-[0.05em] text-text-muted">{label}</div>
      <div className="font-mono text-[19px] font-semibold">{value}</div>
    </div>
  );
}
