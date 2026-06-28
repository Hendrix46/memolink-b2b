import { useTranslation } from 'react-i18next';

import {
  CATEGORIES,
  LocationPicker,
  TagInput,
  TIMEZONES,
  useEventDraftStore,
  type LocationType,
} from '@/features/event-builder';
import { DatePicker, Field, Input, SegmentedControl, Select, Textarea, TimePicker } from '@/shared/ui';

export function BasicsStep() {
  const { t } = useTranslation();
  const d = useEventDraftStore((s) => s.draft);
  const patch = useEventDraftStore((s) => s.patch);

  const locationOptions: { value: LocationType; content: string }[] = [
    { value: 'in-person', content: t('builder.basics.inPerson') },
    { value: 'virtual', content: t('builder.basics.virtual') },
    { value: 'hybrid', content: t('builder.basics.hybrid') },
  ];

  return (
    <div className="space-y-5">
      <Field label={t('builder.basics.eventName')}>
        <Input
          placeholder={t('builder.basics.eventNamePh')}
          value={d.name}
          onChange={(e) => patch({ name: e.target.value })}
          autoFocus
        />
      </Field>

      <Field label={t('builder.basics.description')} hint={t('builder.basics.descriptionHint')}>
        <Textarea
          placeholder={t('builder.basics.descriptionPh')}
          value={d.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('builder.basics.category')}>
          <Select
            options={CATEGORIES.map((c) => ({ value: c, label: t(`builder.categories.${c}`) }))}
            value={d.category}
            onChange={(e) => patch({ category: e.target.value })}
          />
        </Field>
        <Field label={t('builder.basics.tags')}>
          <TagInput />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label={t('builder.basics.startDate')}>
          <DatePicker value={d.startDate} onChange={(v) => patch({ startDate: v })} />
        </Field>
        <Field label={t('builder.basics.endDate')}>
          <DatePicker value={d.endDate} onChange={(v) => patch({ endDate: v })} />
        </Field>
        <Field label={t('builder.basics.startTime')}>
          <TimePicker value={d.startTime} onChange={(v) => patch({ startTime: v })} />
        </Field>
        <Field label={t('builder.basics.endTime')}>
          <TimePicker value={d.endTime} onChange={(v) => patch({ endTime: v })} />
        </Field>
      </div>

      <Field label={t('builder.basics.timezone')}>
        <Select
          options={TIMEZONES.map((tz) => ({ value: tz, label: tz.replace('_', ' ') }))}
          value={d.timezone}
          onChange={(e) => patch({ timezone: e.target.value })}
        />
      </Field>

      <Field label={t('builder.basics.locationType')}>
        <SegmentedControl value={d.locationType} onChange={(v) => patch({ locationType: v })} options={locationOptions} />
      </Field>

      {d.locationType !== 'virtual' && <LocationPicker />}

      {d.locationType !== 'in-person' && (
        <Field label={t('builder.basics.streamUrl')}>
          <Input placeholder="https://…" value={d.virtualUrl} onChange={(e) => patch({ virtualUrl: e.target.value })} />
        </Field>
      )}
    </div>
  );
}
