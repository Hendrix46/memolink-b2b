import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useSessionStore, type AuthTokens, type Viewer } from '@/entities/session';
import { authToken } from '@/shared/api';
import { paths } from '@/shared/config/paths';
import {
  authApi,
  type LoginInput,
  type MeResponse,
  type RegisterInput,
  type ResetPasswordInput,
  type VerifyPhoneInput,
} from '../api/auth.api';

/** Map the current-user response onto the viewer, preserving workspace state. */
function viewerFromMe(me: MeResponse): Viewer {
  const name = [me.firstName, me.lastName].filter(Boolean).join(' ').trim();
  return {
    id: me.userId,
    name: name || me.phoneNumber,
    email: me.email ?? '',
    phoneNumber: me.phoneNumber,
    orgRole: 'admin',
    workspace: useSessionStore.getState().viewer.workspace,
  };
}

/** Set the token, resolve the viewer, and establish the persisted session. */
async function establishSession(tokens: AuthTokens): Promise<void> {
  authToken.set(tokens.accessToken);
  const me = await authApi.me();
  useSessionStore.getState().setSession({ tokens, viewer: viewerFromMe(me) });
}

/**
 * Step 1 of both flows: check whether the phone is known. For a NEW_USER the
 * backend also sends an OTP; calling this again is how the OTP is resent.
 */
export function useUserTypeCheck() {
  return useMutation({
    mutationFn: (phoneNumber: string) => authApi.userTypeCheck(phoneNumber),
  });
}

/** Register step 2: exchange the SMS OTP for a single-use verification token. */
export function useVerifyPhone() {
  return useMutation({
    mutationFn: (input: VerifyPhoneInput) => authApi.verifyPhone(input),
  });
}

/** Sign in → establish session → land on the organizer dashboard. */
export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const tokens = await authApi.login(input);
      await establishSession(tokens);
    },
    onSuccess: () => navigate(paths.dashboard, { replace: true }),
  });
}

export interface CompleteRegistrationInput {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  /** Token returned by `verify-phone-number` — not the raw OTP. */
  verificationToken: string;
}

/**
 * Register step 3: create the account with the verified token. Newer backends
 * return a token pair directly (buglist C1) — use it; otherwise fall back to a
 * follow-up login. Either way the session is established.
 */
export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (input: CompleteRegistrationInput) => {
      const payload: RegisterInput = {
        phoneNumber: input.phoneNumber,
        firstName: input.firstName,
        lastName: input.lastName,
        password: input.password,
        verificationToken: input.verificationToken,
      };
      const created = await authApi.register(payload);
      const tokens: AuthTokens =
        created.accessToken && created.refreshToken
          ? {
              accessToken: created.accessToken,
              refreshToken: created.refreshToken,
              expiresIn: created.expiresIn ?? 0,
              refreshExpiresIn: created.refreshExpiresIn ?? 0,
              tokenType: 'Bearer',
              sessionState: '',
              scope: '',
            }
          : await authApi.login({ phoneNumber: input.phoneNumber, password: input.password });
      await establishSession(tokens);
    },
    onSuccess: () => navigate(paths.dashboard, { replace: true }),
  });
}

/**
 * Two-step password reset: `prepare` sends a one-time code to the phone, then
 * `reset` exchanges the code + new password. On success it returns to sign-in.
 */
export function usePasswordReset() {
  const navigate = useNavigate();
  const prepare = useMutation({
    mutationFn: (phoneNumber: string) => authApi.prepareResetPassword(phoneNumber),
  });
  const reset = useMutation({
    mutationFn: (input: ResetPasswordInput) => authApi.resetPassword(input),
    onSuccess: () => navigate(paths.login, { replace: true }),
  });
  return { prepare, reset };
}

/** Clear the session and return to the login screen. */
export function useSignOut() {
  const clearSession = useSessionStore((s) => s.clearSession);
  const navigate = useNavigate();
  return () => {
    clearSession();
    authToken.set(null);
    navigate(paths.login, { replace: true });
  };
}
