import type { AuthTokens } from '@/entities/session';
import { http, type RequestOptions } from '@/shared/api';

/** Public auth endpoints carry no bearer token. */
const PUBLIC: RequestOptions = { skipAuth: true };

export interface LoginInput {
  phoneNumber: string;
  password: string;
}

export interface RegisterInput {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  /** Phone-verification code (sent out-of-band, entered by the user). */
  verificationToken: string;
}

export interface VerifyPhoneInput {
  phoneNumber: string;
  otp: string;
}

export interface ResetPasswordInput {
  phoneNumber: string;
  otp: string;
  newPassword: string;
}

/** Whether the phone already has an account — drives login vs. register branching. */
export type UserType = 'NEW_USER' | 'EXISTS_USER';

export type AccountStatus =
  | 'CREATED'
  | 'PENDING'
  | 'ACTIVE'
  | 'BLOCKED'
  | 'DELETED'
  | 'PENDING_DELETION';

/** Result of `/api/auth/user-type-check`. The call also sends an OTP for NEW_USER. */
export interface UserTypeCheckResult {
  userType: UserType;
  /** OTP time-to-live, in seconds. */
  ttl?: number;
  /** Present only when the account is in PENDING_DELETION (restore prompt). */
  accountStatus?: AccountStatus | null;
  /** Scheduled hard-purge timestamp; set only for PENDING_DELETION. */
  purgeAt?: string | null;
}

/** Result of `/api/auth/verify-phone-number` — the token consumed by register. */
export interface VerifyPhoneResult {
  verificationToken: string;
}

/** Shape returned by `/api/auth/register`. */
export interface RegisterResult {
  userId: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
}

/** Shape returned by `/api/user/me`. */
export interface MeResponse {
  userId: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  status: string;
  dateCreated: string;
  dateUpdated: string;
}

/**
 * Live Memolink auth client. The `/api/auth/*` calls are public (no bearer);
 * `/api/user/me` requires the access token, which the HTTP client attaches
 * automatically from `authToken`.
 */
export const authApi = {
  /**
   * Step 1 of both login and register: checks whether the phone is known and,
   * for a NEW_USER, triggers an OTP. Re-calling this is also how an OTP resend
   * works.
   */
  userTypeCheck: (phoneNumber: string) =>
    http.post<UserTypeCheckResult>('/api/auth/user-type-check', { phoneNumber }, PUBLIC),

  login: (body: LoginInput) => http.post<AuthTokens>('/api/auth/login', body, PUBLIC),

  register: (body: RegisterInput) => http.post<RegisterResult>('/api/auth/register', body, PUBLIC),

  refresh: (refreshToken: string) =>
    http.post<AuthTokens>('/api/auth/refresh', { refreshToken }, PUBLIC),

  /** Exchanges the SMS OTP for a single-use `verificationToken` for register. */
  verifyPhone: (body: VerifyPhoneInput) =>
    http.post<VerifyPhoneResult>('/api/auth/verify-phone-number', body, PUBLIC),

  prepareResetPassword: (phoneNumber: string) =>
    http.post<void>('/api/auth/prepare-reset-password', { phoneNumber }, PUBLIC),

  resetPassword: (body: ResetPasswordInput) =>
    http.post<void>('/api/auth/reset-password', body, PUBLIC),

  me: () => http.get<MeResponse>('/api/user/me'),
};
