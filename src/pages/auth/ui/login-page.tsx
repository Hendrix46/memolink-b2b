import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useLogin } from '@/features/auth';
import { ApiError } from '@/shared/api/mock-client';
import { Button } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { AuthLayout } from './auth-layout';
import { AuthInput, FieldLabel, FormError, PasswordInput } from './parts';

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('dana@jetbrains.com');
  const [password, setPassword] = useState('demo1234');
  const login = useLogin();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  const error = login.error instanceof ApiError ? login.error.message : login.error ? t('auth.signInFailed') : undefined;

  return (
    <AuthLayout
      title={t('auth.welcomeBack')}
      subtitle={t('auth.signInSubtitle')}
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to={paths.register} className="font-medium text-accent hover:text-accent-soft">
            {t('auth.createOne')}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />

        <label className="block">
          <FieldLabel>{t('auth.email')}</FieldLabel>
          <AuthInput
            type="email"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <div className="flex items-center justify-between">
            <FieldLabel>{t('auth.password')}</FieldLabel>
            <Link to={paths.forgotPassword} className="mb-1.5 text-[12.5px] font-medium text-accent hover:text-accent-soft">
              {t('auth.forgot')}
            </Link>
          </div>
          <PasswordInput
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={login.isPending} className="h-[44px]">
          {t('auth.signIn')}
        </Button>

        <p className="text-center text-[12px] text-text-muted">{t('auth.demoHint')}</p>
      </form>
    </AuthLayout>
  );
}
