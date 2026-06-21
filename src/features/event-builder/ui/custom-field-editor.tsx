import { Trans, useTranslation } from 'react-i18next';
import { ListPlus, Plus, Trash2 } from 'lucide-react';

import { Button, Input, Select, Switch } from '@/shared/ui';
import type { CustomFieldType } from '../model/types';
import { useEventDraftStore } from '../model/event-draft-store';

/**
 * Registration form builder — clients add their own custom attendee fields.
 * This is the heart of "fully customizable": each event collects exactly the
 * data the client wants.
 */
export function CustomFieldEditor() {
  const { t } = useTranslation();
  const fields = useEventDraftStore((s) => s.draft.customFields);
  const addField = useEventDraftStore((s) => s.addField);
  const updateField = useEventDraftStore((s) => s.updateField);
  const removeField = useEventDraftStore((s) => s.removeField);

  const typeOptions: { value: CustomFieldType; label: string }[] = [
    { value: 'text', label: t('builder.registrationStep.types.text') },
    { value: 'email', label: t('builder.registrationStep.types.email') },
    { value: 'number', label: t('builder.registrationStep.types.number') },
    { value: 'select', label: t('builder.registrationStep.types.select') },
    { value: 'checkbox', label: t('builder.registrationStep.types.checkbox') },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-[10px] border border-border bg-surface px-4 py-3 text-[12.5px] text-text-muted">
        <Trans
          i18nKey="builder.registrationStep.builtInNote"
          components={[<strong className="text-text-secondary" />, <strong className="text-text-secondary" />]}
        />
      </div>

      {fields.length === 0 && (
        <div className="flex flex-col items-center rounded-[12px] border border-dashed border-border px-6 py-10 text-center">
          <ListPlus size={22} className="mb-2 text-text-muted" />
          <p className="text-[13.5px] text-text-secondary">{t('builder.registrationStep.noFields')}</p>
        </div>
      )}

      {fields.map((field) => (
        <div key={field.id} className="rounded-[12px] border border-border bg-surface p-3.5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[2fr_1.2fr]">
            <Input
              placeholder={t('builder.registrationStep.fieldLabelPh')}
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
            />
            <Select
              options={typeOptions}
              value={field.type}
              onChange={(e) => updateField(field.id, { type: e.target.value as CustomFieldType })}
            />
          </div>

          {field.type === 'select' && (
            <Input
              className="mt-2.5"
              placeholder={t('builder.registrationStep.optionsPh')}
              value={field.options.join(', ')}
              onChange={(e) =>
                updateField(field.id, {
                  options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
                })
              }
            />
          )}

          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-[13px] text-text-secondary">
              <Switch
                checked={field.required}
                onChange={(v) => updateField(field.id, { required: v })}
                aria-label={t('builder.registrationStep.required')}
              />
              {t('builder.registrationStep.required')}
            </label>
            <button
              type="button"
              aria-label={t('common.remove')}
              onClick={() => removeField(field.id)}
              className="flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-rejected"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      <Button variant="secondary" leadingIcon={<Plus size={15} />} onClick={addField}>
        {t('builder.registrationStep.addField')}
      </Button>
    </div>
  );
}
