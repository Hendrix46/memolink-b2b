import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MailCheck } from 'lucide-react';

import { usePasswordReset } from '@/features/auth';
import { ApiError } from '@/shared/api/mock-client';
import { Button } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { AuthLayout } from './auth-layout';
import { AuthInput, FieldLabel, FormError } from './parts';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const reset = usePasswordReset();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    reset.mutate(email);
  };

  const error = reset.error instanceof ApiError ? reset.error.message : reset.error ? t('auth.requestFailed') : undefined;

  return (
    <AuthLayout
      title={t('auth.resetPassword')}
      subtitle={t('auth.resetSubtitle')}
      footer={
        <Link to={paths.login} className="inline-flex items-center gap-1.5 font-medium text-accent hover:text-accent-soft">
          <ArrowLeft size={14} /> {t('auth.backToSignIn')}
        </Link>
      }
    >
      {reset.isSuccess ? (
        <div className="flex flex-col items-center rounded-[14px] border border-border bg-surface px-6 py-10 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(61,214,140,0.14)] text-approved">
            <MailCheck size={26} />
          </span>
          <h3 className="text-base font-semibold">{t('auth.checkInbox')}</h3>
          <p className="mt-1.5 text-[13.5px] text-text-secondary">{t('auth.resetSent', { email })}</p>
        </div>
      ) : (
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
          <Button type="submit" variant="primary" size="lg" fullWidth loading={reset.isPending} className="h-[44px]">
            {t('auth.sendResetLink')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
