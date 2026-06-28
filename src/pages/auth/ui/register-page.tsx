import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

import { useRegister, useUserTypeCheck, useVerifyPhone } from '@/features/auth';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { AuthLayout } from './auth-layout';
import { AuthInput, FieldLabel, FormError, PasswordInput } from './parts';

type Step = 'phone' | 'otp' | 'details';

/**
 * New-user sign-up, mirroring the backend flow:
 *   1. user-type-check  → confirms NEW_USER and sends an OTP
 *   2. verify-phone     → exchanges the OTP for a verification token
 *   3. register + login → creates the account and establishes the session
 */
export function RegisterPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  const userTypeCheck = useUserTypeCheck();
  const verifyPhone = useVerifyPhone();
  const register = useRegister();

  /** Step 1 — confirm the number is new and trigger the OTP. */
  const submitPhone = (e: FormEvent) => {
    e.preventDefault();
    userTypeCheck.mutate(phoneNumber, {
      onSuccess: (res) => {
        if (res.userType === 'EXISTS_USER') return; // handled inline below
        setStep('otp');
      },
    });
  };

  /** Step 2 — exchange the OTP for a verification token. */
  const submitOtp = (e: FormEvent) => {
    e.preventDefault();
    verifyPhone.mutate(
      { phoneNumber, otp },
      {
        onSuccess: (res) => {
          setVerificationToken(res.verificationToken);
          setStep('details');
        },
      },
    );
  };

  /** Step 3 — create the account and sign in. */
  const submitDetails = (e: FormEvent) => {
    e.preventDefault();
    register.mutate({ phoneNumber, firstName, lastName, password, verificationToken });
  };

  const resendCode = () => userTypeCheck.mutate(phoneNumber);

  const exists = userTypeCheck.data?.userType === 'EXISTS_USER';

  const phoneError = userTypeCheck.error
    ? userTypeCheck.error instanceof ApiError
      ? userTypeCheck.error.message
      : t('auth.requestFailed')
    : undefined;
  const otpError = verifyPhone.error
    ? verifyPhone.error instanceof ApiError
      ? verifyPhone.error.message
      : t('auth.requestFailed')
    : undefined;
  const detailsError = register.error
    ? register.error instanceof ApiError
      ? register.error.message
      : t('auth.signUpFailed')
    : undefined;

  const subtitle =
    step === 'phone'
      ? t('auth.registerSubtitle')
      : step === 'otp'
        ? t('auth.verifyPhoneSubtitle', { phone: phoneNumber })
        : t('auth.detailsSubtitle');

  return (
    <AuthLayout
      title={t('auth.createAccount')}
      subtitle={subtitle}
      footer={
        <>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to={paths.login} className="font-medium text-accent hover:text-accent-soft">
            {t('auth.signInLink')}
          </Link>
        </>
      }
    >
      {step === 'phone' && (
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
          {exists && (
            <p className="text-[13px] text-text-secondary">
              {t('auth.accountExists')}{' '}
              <Link to={paths.login} className="font-medium text-accent hover:text-accent-soft">
                {t('auth.signInLink')}
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
          <p className="text-center text-[12px] text-text-muted">{t('auth.terms')}</p>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={submitOtp} className="space-y-4">
          <FormError message={otpError} />
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
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={verifyPhone.isPending}
            className="h-[44px]"
          >
            {t('auth.verifyCode')}
          </Button>
          <div className="flex items-center justify-between text-[12.5px]">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="inline-flex items-center gap-1.5 font-medium text-text-muted hover:text-text"
            >
              <ArrowLeft size={13} /> {t('auth.changeNumber')}
            </button>
            <button
              type="button"
              onClick={resendCode}
              disabled={userTypeCheck.isPending}
              className="font-medium text-accent hover:text-accent-soft disabled:opacity-50"
            >
              {t('auth.resendCode')}
            </button>
          </div>
        </form>
      )}

      {step === 'details' && (
        <form onSubmit={submitDetails} className="space-y-4">
          <FormError message={detailsError} />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>{t('auth.firstName')}</FieldLabel>
              <AuthInput autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label className="block">
              <FieldLabel>{t('auth.lastName')}</FieldLabel>
              <AuthInput autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>
          </div>
          <label className="block">
            <FieldLabel>{t('auth.password')}</FieldLabel>
            <PasswordInput
              autoComplete="new-password"
              placeholder={t('auth.passwordHint')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <Button type="submit" variant="primary" size="lg" fullWidth loading={register.isPending} className="h-[44px]">
            {t('auth.createAccountBtn')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
