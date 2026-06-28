import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';

import { useEventDraftStore, type ModuleKey } from '@/features/event-builder';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-hairline py-2.5 first:border-0">
      <span className="text-[13px] text-text-muted">{label}</span>
      <span className="max-w-[62%] text-right text-[13.5px] font-medium">{value}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-border bg-surface p-4">
      <h3 className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
      {children}
    </div>
  );
}

export function ReviewStep() {
  const { t } = useTranslation();
  const d = useEventDraftStore((s) => s.draft);
  const enabled = (Object.keys(d.modules) as ModuleKey[]).filter((k) => d.modules[k]);

  const when = d.startDate
    ? `${d.startDate}${d.endDate ? ` → ${d.endDate}` : ''} · ${d.startTime}–${d.endTime}`
    : '—';
  const location = d.locationType === 'virtual' ? t('builder.review.virtual') : `${d.venue || '—'}${d.address ? `, ${d.address}` : ''}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 rounded-[12px] border border-approved/30 bg-[rgba(61,214,140,0.06)] px-4 py-3 text-[13.5px]">
        <CheckCircle2 size={18} className="text-approved" />
        {t('builder.review.looksGood')}
      </div>

      <Group title={t('builder.review.basics')}>
        <Row label={t('builder.review.name')} value={d.name || '—'} />
        <Row label={t('builder.review.category')} value={t(`builder.categories.${d.category}`)} />
        <Row label={t('builder.review.when')} value={when} />
        <Row label={t('builder.review.timezone')} value={d.timezone.replace('_', ' ')} />
        <Row label={t('builder.review.location')} value={location} />
        {d.tags.length > 0 && <Row label={t('builder.review.tags')} value={d.tags.join(', ')} />}
      </Group>

      <Group title={t('builder.review.capabilities')}>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {enabled.map((k) => (
            <span key={k} className="rounded-md bg-surface-raised px-2 py-1 text-[12px] font-medium">
              {t(`builder.modules.${k}`)}
            </span>
          ))}
        </div>
      </Group>

      <Group title={t('builder.review.brandingAccess')}>
        <Row label={t('builder.review.accent')} value={d.accent} />
        <Row label={t('builder.review.galleryLayout')} value={t(`builder.brandingStep.${d.layout}`)} />
        <Row label={t('builder.review.visibility')} value={t(`builder.accessStep.${d.visibility}`)} />
        <Row label={t('builder.review.watermark')} value={d.watermark ? t('builder.review.on') : t('builder.review.off')} />
      </Group>

      {d.modules.registrations && (
        <Group title={t('builder.review.registration')}>
          <Row label={t('builder.review.capacity')} value={String(d.capacity)} />
          <Row label={t('builder.review.approval')} value={d.requireApproval ? t('builder.review.approvalRequired') : t('builder.review.approvalAuto')} />
          <Row label={t('builder.review.customFields')} value={t('builder.review.fieldsAdded', { count: d.customFields.length })} />
        </Group>
      )}

      {d.modules.agenda && (
        <Group title={t('builder.review.agenda')}>
          <Row label={t('builder.review.sessions')} value={t('builder.review.sessionsAdded', { count: d.agenda.length })} />
        </Group>
      )}
    </div>
  );
}
