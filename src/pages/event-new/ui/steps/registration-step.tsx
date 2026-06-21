import { useTranslation } from 'react-i18next';

import { CustomFieldEditor, useEventDraftStore } from '@/features/event-builder';
import { Field, Input, Switch } from '@/shared/ui';

export function RegistrationStep() {
  const { t } = useTranslation();
  const d = useEventDraftStore((s) => s.draft);
  const patch = useEventDraftStore((s) => s.patch);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('builder.registrationStep.capacity')} hint={t('builder.registrationStep.capacityHint')}>
          <Input
            type="number"
            min={0}
            value={d.capacity || ''}
            onChange={(e) => patch({ capacity: Number(e.target.value) })}
          />
        </Field>
        <label className="flex items-end justify-between gap-3 pb-2.5">
          <span>
            <span className="block text-[13.5px] font-medium">{t('builder.registrationStep.requireApproval')}</span>
            <span className="block text-xs text-text-muted">{t('builder.registrationStep.requireApprovalDesc')}</span>
          </span>
          <Switch
            checked={d.requireApproval}
            onChange={(v) => patch({ requireApproval: v })}
            aria-label={t('builder.registrationStep.requireApproval')}
          />
        </label>
      </div>

      <div>
        <h3 className="mb-3 text-[14px] font-semibold">{t('builder.registrationStep.regForm')}</h3>
        <CustomFieldEditor />
      </div>
    </div>
  );
}
