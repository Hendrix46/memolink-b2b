import { useTranslation } from 'react-i18next';

import type { PipelineStage } from '../../api/dashboard.api';

/** Event-pipeline funnel strip — stage counts at a glance (spec 01 §3B). */
export function EventPipeline({ stages }: { stages: PipelineStage[] }) {
  const { t } = useTranslation();
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2.5 rounded-[14px] border border-border bg-surface px-4 py-3.5">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
        {t('dashboard.pipeline.label')}
      </span>
      {stages.map((s) => (
        <span
          key={s.id}
          className="flex h-[30px] items-center gap-2 rounded-lg border border-hairline bg-sidebar px-3 text-[12.5px]"
        >
          <span className="size-[7px] rounded-full" style={{ background: s.color }} />
          {t(`dashboard.pipeline.${s.id}`)}
          <span className="font-mono font-semibold text-text-secondary">{s.count}</span>
        </span>
      ))}
    </div>
  );
}
