import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/shared/api';
import { Button, Field, Input } from '@/shared/ui';
import { useCreateOrg } from '../model/use-create-org';

export interface CreateOrgFormProps {
  /** Called after the org is created (e.g. to close the modal). */
  onDone?: () => void;
  autoFocus?: boolean;
}

/** Reusable create-organization form — shared by the modal and the onboarding. */
export function CreateOrgForm({ onDone, autoFocus }: CreateOrgFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const createOrg = useCreateOrg();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = name.trim();
    if (!value) return;
    createOrg.mutate(value, { onSuccess: () => onDone?.() });
  };

  const error =
    createOrg.error instanceof ApiError
      ? createOrg.error.message
      : createOrg.error
        ? t('orgCreate.failed')
        : undefined;

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label={t('orgCreate.nameLabel')} hint={t('orgCreate.nameHint')} error={error}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('orgCreate.namePlaceholder')}
          maxLength={255}
          autoFocus={autoFocus}
          required
        />
      </Field>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={createOrg.isPending}
        disabled={!name.trim()}
        className="h-[44px]"
      >
        {t('orgCreate.submit')}
      </Button>
    </form>
  );
}
