import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

import { usePasswordReset } from '@/features/auth';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { AuthLayout } from './auth-layout';
import { AuthInput, FieldLabel, FormError, PasswordInput } from './parts';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { prepare, reset } = usePasswordReset();

  const sentCode = prepare.isSuccess;

  const requestCode = (e: FormEvent) => {
    e.preventDefault();
    prepare.mutate(phoneNumber);
  };

  const submitReset = (e: FormEvent) => {
    e.preventDefault();
    reset.mutate({ phoneNumber, otp, newPassword });
  };

  const active = sentCode ? reset : prepare;
  const error = active.error instanceof ApiError ? active.error.message : active.error ? t('auth.requestFailed') : undefined;

  return (
    <AuthLayout
      title={t('auth.resetPassword')}
      subtitle={sentCode ? t('auth.resetConfirmSubtitle', { phone: phoneNumber }) : t('auth.resetSubtitle')}
      footer={
        <Link to={paths.login} className="inline-flex items-center gap-1.5 font-medium text-accent hover:text-accent-soft">
          <ArrowLeft size={14} /> {t('auth.backToSignIn')}
        </Link>
      }
    >
      {sentCode ? (
        <form onSubmit={submitReset} className="space-y-4">
          <FormError message={error} />
          <label className="block">
            <FieldLabel>{t('auth.otp')}</FieldLabel>
            <AuthInput
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={t('auth.otpPlaceholder')}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <FieldLabel>{t('auth.newPassword')}</FieldLabel>
            <PasswordInput
              autoComplete="new-password"
              placeholder={t('auth.passwordHint')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <Button type="submit" variant="primary" size="lg" fullWidth loading={reset.isPending} className="h-[44px]">
            {t('auth.updatePassword')}
          </Button>
        </form>
      ) : (
        <form onSubmit={requestCode} className="space-y-4">
          <FormError message={error} />
          <label className="block">
            <FieldLabel>{t('auth.phone')}</FieldLabel>
            <AuthInput
              type="tel"
              autoComplete="tel"
              placeholder={t('auth.phonePlaceholder')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </label>
          <Button type="submit" variant="primary" size="lg" fullWidth loading={prepare.isPending} className="h-[44px]">
            {t('auth.sendCode')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
