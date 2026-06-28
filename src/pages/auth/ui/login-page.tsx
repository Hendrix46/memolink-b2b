import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

import { useLogin, useUserTypeCheck } from '@/features/auth';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { AuthLayout } from './auth-layout';
import { AuthInput, FieldLabel, FormError, PasswordInput } from './parts';

type Step = 'phone' | 'password';

/**
 * Existing-user sign-in, mirroring the backend flow:
 *   1. user-type-check → confirms EXISTS_USER for the phone
 *   2. login           → exchanges phone + password for tokens, opens session
 */
export function LoginPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const userTypeCheck = useUserTypeCheck();
  const login = useLogin();

  /** Step 1 — confirm an account exists before asking for the password. */
  const submitPhone = (e: FormEvent) => {
    e.preventDefault();
    userTypeCheck.mutate(phoneNumber, {
      onSuccess: (res) => {
        if (res.userType === 'EXISTS_USER') setStep('password');
      },
    });
  };

  /** Step 2 — authenticate. */
  const submitPassword = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ phoneNumber, password });
  };

  const isNew = userTypeCheck.data?.userType === 'NEW_USER';

  const phoneError = userTypeCheck.error
    ? userTypeCheck.error instanceof ApiError
      ? userTypeCheck.error.message
      : t('auth.requestFailed')
    : undefined;
  const passwordError = login.error
    ? login.error instanceof ApiError
      ? login.error.message
      : t('auth.signInFailed')
    : undefined;

  return (
    <AuthLayout
      title={t('auth.welcomeBack')}
      subtitle={step === 'phone' ? t('auth.signInSubtitle') : t('auth.enterPasswordFor', { phone: phoneNumber })}
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to={paths.register} className="font-medium text-accent hover:text-accent-soft">
            {t('auth.createOne')}
          </Link>
        </>
      }
    >
      {step === 'phone' ? (
        <form onSubmit={submitPhone} className="space-y-4">
          <FormError message={phoneError} />
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
          {isNew && (
            <p className="text-[13px] text-text-secondary">
              {t('auth.noAccountForPhone')}{' '}
              <Link to={paths.register} className="font-medium text-accent hover:text-accent-soft">
                {t('auth.createOne')}
              </Link>
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={userTypeCheck.isPending}
            className="h-[44px]"
          >
            {t('auth.continue')}
          </Button>
          <p className="text-center text-[12px] text-text-muted">{t('auth.demoHint')}</p>
        </form>
      ) : (
        <form onSubmit={submitPassword} className="space-y-4">
          <FormError message={passwordError} />
          <label className="block">
            <div className="flex items-center justify-between">
              <FieldLabel>{t('auth.password')}</FieldLabel>
              <Link
                to={paths.forgotPassword}
                className="mb-1.5 text-[12.5px] font-medium text-accent hover:text-accent-soft"
              >
                {t('auth.forgot')}
              </Link>
            </div>
            <PasswordInput
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </label>
          <Button type="submit" variant="primary" size="lg" fullWidth loading={login.isPending} className="h-[44px]">
            {t('auth.signIn')}
          </Button>
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="inline-flex w-full items-center justify-center gap-1.5 text-[12.5px] font-medium text-text-muted hover:text-text"
          >
            <ArrowLeft size={13} /> {t('auth.changeNumber')}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
