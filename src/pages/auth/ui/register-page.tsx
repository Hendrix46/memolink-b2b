import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useRegister } from '@/features/auth';
import { ApiError } from '@/shared/api/mock-client';
import { Button } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { AuthLayout } from './auth-layout';
import { AuthInput, FieldLabel, FormError, PasswordInput } from './parts';

export function RegisterPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', workspace: '', email: '', password: '' });
  const register = useRegister();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    register.mutate(form);
  };

  const error =
    register.error instanceof ApiError ? register.error.message : register.error ? t('auth.signUpFailed') : undefined;

  return (
    <AuthLayout
      title={t('auth.createWorkspace')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to={paths.login} className="font-medium text-accent hover:text-accent-soft">
            {t('auth.signInLink')}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <FieldLabel>{t('auth.fullName')}</FieldLabel>
            <AuthInput placeholder="Dana Whitfield" value={form.name} onChange={set('name')} required />
          </label>
          <label className="block">
            <FieldLabel>{t('auth.workspace')}</FieldLabel>
            <AuthInput placeholder="Acme Events" value={form.workspace} onChange={set('workspace')} required />
          </label>
        </div>

        <label className="block">
          <FieldLabel>{t('auth.workEmail')}</FieldLabel>
          <AuthInput type="email" autoComplete="email" placeholder={t('auth.emailPlaceholder')} value={form.email} onChange={set('email')} required />
        </label>

        <label className="block">
          <FieldLabel>{t('auth.password')}</FieldLabel>
          <PasswordInput autoComplete="new-password" placeholder={t('auth.passwordHint')} value={form.password} onChange={set('password')} required />
        </label>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={register.isPending} className="h-[44px]">
          {t('auth.createWorkspaceBtn')}
        </Button>

        <p className="text-center text-[12px] text-text-muted">{t('auth.terms')}</p>
      </form>
    </AuthLayout>
  );
}
